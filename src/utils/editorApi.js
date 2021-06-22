/**
 * 解码后的字符串转html
 * @param {*} str
 * @returns
 */
export function escape2Html(str) {
  const t = {
    lt: '<',
    gt: '>',
    nbsp: ' ',
    amp: '&',
    quot: '"'
  }
  return str.replace(/&(lt|gt|nbsp|amp|quot);/gi, (e, n) => {
    return t[n]
  })
}
/**
 * 图片压缩函数
 *
 * @param {*} img 图片对象
 * @param {*} fileType  图片类型
 * @param {*} maxWidth 图片最大宽度
 * @returns base64字符串
 */
export function compress(img, fileType, maxWidth) {
  let canvas = document.createElement('canvas')
  let ctx = canvas.getContext('2d')

  const proportion = img.width / img.height
  const width = maxWidth
  const height = maxWidth / proportion

  canvas.width = width
  canvas.height = height

  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, 0, 0, width, height)

  const base64data = canvas.toDataURL(fileType, 0.75)
  canvas = ctx = null

  return base64data
}
/**
 * 图片转base64
 * @param {*} file
 * @param {*} cb 回调函数
 * @param {number} [maxsize=200 * 1024] 图片最大体积
 */
export function imageToBase64(file, maxsize = 200 * 1024) {
  return new Promise((resolve, reject) => {
    if (!file || !/\/(?:jpeg|jpg|png|gif)/i.test(file.type)) {
      return reject({
        type: 'error',
        message: 'file type is error'
      })
    }

    const reader = new FileReader()
    reader.onload = function() {
      const result = this.result
      let img = new Image()
      img.crossOrigin = 'anonymous'

      if (result.length <= maxsize) {
        resolve(result)
        return
      }

      img.onload = function() {
        const compressedDataUrl = compress(img, file.type, maxsize / 1024)
        resolve(compressedDataUrl)
        img = null
      }

      img.onerror = function() {
        reject({
          type: 'error',
          message: 'Failed to get image from: ' + result,
          url: result
        })
      }

      img.src = result
    }

    reader.onerror = reject

    reader.readAsDataURL(file)
  })
}
/**
 * 检查图片是否插入
 * @param {*} selector 编辑器元素的选择器
 * @param {*} cb 回调函数
 */
export function checkImageInContainer(selector, cb) {
  const randomNum = Math.floor(1000 * Math.random()) + ''
  const nodes = document.querySelectorAll(selector + '>img')
  nodes.forEach(node => {
    node.setAttribute(`paste-marked`, randomNum)
  })
  setTimeout(() => {
    const imgNodes = document.querySelectorAll(selector + '>img')
    const flag = imgNodes.some(node => {
      if (node.getAttribute('paste-marked') === randomNum) {
        cb && cb(node.getAttribute('src'))
        node.parentNode.removeChild(node)
        return true
      }
    })
    if (!flag) {
      cb && cb({
        type: 'error',
        message: 'Failed to get paste'
      })
    }
  }, 1)
}

/**
 * 粘贴
 * 文字 =》 文字
 * 图片 =》 图片
 * 图片 + 文字 =》 文字
 * 图片 + 图片 =》 空字符串
 * @param {*} e paste事件
 * @param {*} selector 编辑框选择器
 * @param {*} isBase64 是否转base64
 * @returns
 */
export function paste(e, selector = '.editor', isBase64 = true) {
  let clipboardData = (e.originalEvent || e).clipboardData
  if (!(clipboardData && clipboardData.items)) {
    // 只有ie支持window.clipboardData
    clipboardData = clipboardData || window.clipboardData

    if (!clipboardData && navigator.clipboard) {
      return navigator.clipboard.readText().then(str => {
        return ({
          type: 'text',
          text: str
        })
      })
    }
    if (!clipboardData) {
      return Promise.reject(new Error('浏览器不支持剪贴板粘贴'))
    }
    return new Promise((resolve, reject) => {
      if (clipboardData.files && clipboardData.files.length) {
        clipboardData.files.forEach(file => {
          const URLObj = window.URL || window.webkitURL
          const pasteFile = URLObj.createObjectURL(file)
          isBase64 ? imageToBase64(pasteFile).then(res => {
            typeof res === 'object' ? reject(res) : resolve({
              type: 'image',
              url: res
            })
          }) : resolve({
            type: 'imgage',
            url: pasteFile
          })
        })
        return false
      }

      if (Array.prototype.indexOf.call(clipboardData.types, 'text/plain') !== -1 || clipboardData.getData('text/plain')) {
        resolve({
          type: 'text',
          text: clipboardData.getData('text/plain') || ''
        })
        return false
      }
      checkImageInContainer(selector, src => {
        imageToBase64(src).then(res => {
          typeof res === 'object' ? reject(res) : resolve({
            type: 'image',
            url: res
          })
        })
      })
    })
  }
  return new Promise((resolve, reject) => {
    clipboardData.items.forEach(item => {
      if (item.kind === 'string') {
        item.getAsString((str) => {
          resolve({
            type: 'text',
            text: str
          })
        })
      } else if (item.kind === 'file') {
        const pasteFile = item.getAsFile()
        isBase64 ? imageToBase64(pasteFile).then(res => {
          typeof res === 'object' ? reject(res) : resolve({
            type: 'image',
            url: res
          })
        }) : resolve({
          type: 'image',
          url: pasteFile
        })
      } else {
        reject(new Error('Not allow to paste this type!'))
      }
    })
  })
}
/**
 * 拖拽
 * @param {*} e
 * @param {*} isBase64
 * @returns
 * {
    type: 'image', // text | image | file
    icon: 'image', // chat | image | folder
    url: res, // base64路径
    file:  // 二进制数据
    fileName: item.name, // 文件名
    fileType, // 文件类型
    size: sizeUnit // 文件大小， 加上了单位
  }
 */
export function drop(e, isBase64 = true) {
  const list = []
  // files里才可以获取文件名name
  ;(e.dataTransfer.files || []).forEach(item => {
    let fileType = item.name.substr(item.name.lastIndexOf('.') + 1)
    const size = item.size / 1024 / 1024
    const sizeUnit = size > 1 ? ''.concat(size.toFixed(2), 'M') : ''.concat((item.size / 1024).toFixed(2), 'KB')
    const isImage = item.type.match('^image/')
    const isFolder = !item.type // 是文件夹
    fileType = isFolder ? 'folder' : fileTypeIcon(fileType)
    // const pasteFile = item.getAsFile()
    const event = isBase64 && isImage ? imageToBase64(item).then(res => {
      return typeof res === 'object' ? res : {
        type: 'image',
        icon: 'image',
        url: res,
        fileName: item.name,
        fileType,
        size: sizeUnit
      }
    }) : Promise.resolve({
      type: isImage ? 'image' : 'file',
      icon: isImage ? 'image' : 'folder',
      fileName: item.name,
      fileType,
      file: item,
      size: sizeUnit
    })
    event && list.push(event)
  })
  ;(e.dataTransfer.items || []).forEach(item => {
    let event
    if (item.kind === 'string') {
      event = new Promise(resolve => {
        item.getAsString((str) => {
          resolve({
            type: 'text',
            icon: 'chat',
            text: str
          })
        })
      })
    }
    event && list.push(event)
  })
  return Promise.all(list)
}
/**
 * 删除at内容
 * @param {*} str
 * @returns
 */
export function delAtHtml(str) {
  if (!str) return ''
  const reg = /data-id="([^"]*)"/g
  return str.replace(/<span class="at-member"[^>]*>(.*?)<\/span>/gi, function(e, n) {
    let r = ''
    e.replace(reg, function(e, t) {
      r = t
    })
    return '@$' + r + '$'
  })
}

export function delAtHtmlIds(str) {
  if (!str) return ''
  const reg = /data-id="([^"]*)"/g
  return str.replace(/<span class="at-member"[^>]*>(.*?)<\/span>/gi, function(e, n) {
    return e.replace(reg, function(e, t) {
      return t
    })
  })
}
/**
 * 删除文件内容
 * @param {*} str
 * @returns
 */
export function delFileHtml(str) {
  if (!str) return ''
  const elem = document.createElement('div')
  elem.innerHTML = str
  const nodes = elem.getElementsByClassName('file-upload')
  Array.from(nodes).forEach(node => {
    node.innerHTML = ''
  })
  return elem.innerHTML
}
/**
 * 返回文件内容
 * @param {*} str
 * @returns
 */
export function returnFileContent(str) {
  if (!str) return []
  const list = []
  str.replace(/<p class="file-content"[^>]*>([\s\S]*?)<\/p>/gi, function(e, n) {
    list.push(JSON.parse(n))
    return n
  })
  return list
}

export function returnId(str) {
  if (!str) return []
  const list = []
  str.replace(/data-id="([^"]*)"/g, function(e, n) {
    list.push(n)
    return n
  })
  return list
}
/**
 * 删除图片样式
 * @param {*} str
 * @returns
 */
export function delStyleImg(str) {
  if (!str) return ''
  return str.replace(/<img[^>]*>/gi, function(e, t) {
    return e.replace(/style\s*?=\s*?([‘"])[\s\S]*?\1/gi, '')
  })
}

/**
 * 删除除了img的标签
 * @param {*} str
 * @returns
 */
export function delAllTag(str) {
  if (!str) return ''
  return str.replace(/<(?!img).*?>/gi, '')
}
/**
 * 删除所有标签
 * @param {*} str
 * @returns
 */
export function delAllHtml(str) {
  if (!str) return ''
  return str.replace(/<[^>]*>|<\/[^>]*>/gm, '')
}
/**
 * 删除img标签
 * @param {*} str
 * @returns
 */
export function delImgTag(str) {
  if (!str) return ''
  return str.replace(/<img.*?(?:>|\/>)/gi, '')
}
/**
 * 获取图片路径
 * @param {*} str
 * @returns
 */
export function matchImgUrl(str) {
  if (!str) return []
  const result = []
  const reg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i
  const list = str.match(/<img.*?(?:>|\/>)/gi) || []
  list.forEach(item => {
    const v = item.match(reg)
    result.push(v[1])
  })
  return result
}
/**
 * 获取文本内容
 * @param {*} str
 * @returns
 */
export function getInnerText(str) {
  if (!str) return ''
  const elem = document.createElement('div')
  elem.innerHTML = str.replace(/\u200B/g, '').replace(/\u200E/g, '')
  return elem.innerText
}
/**
 * 默认图片路径
 */
export const defaultImage = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='

/**
 * 光标处插入html
 * @param {*} res
 * text: {type, text},
 * emoji: {type, source},
 * image: {type, url},
 * file: {type, fileName, size, icon}
 * at: {type, nickName, id}
 * @returns
 */
export function insertHtml(res) {
  const selection = window.getSelection()
  if (!selection.rangeCount) return false
  const range = selection.getRangeAt(0)
  range.deleteContents()
  let html = ''
  if (res.type === 'text') {
    html = getInnerText(res.text)
  } else if (res.type === 'image') {
    html = `<img class="img-upload-chat" src="${res.url}">`
  } else if (res.type === 'emoji') {
    html = `<div class="weui-emoji_item" contenteditable="false" style="-webkit-user-modify: read-only;user-modify: read-only;">
      <img class="weui-icon_emoji ${res.style}" src="${defaultImage}" style="background-image: url(${res.source});">
    </div>
    <span style="min-width: 1px;min-height: 14px"></span>`
    html = trimSpaceThan2(html)
  } else if (res.type === 'at') {
    html = `<span class="at-member" contenteditable="false" data-id="${res.id}" style="-webkit-user-modify: read-only;user-modify: read-only;">@${res.nickName} </span>
    <span style="min-width: 1px;min-height: 14px"></span>`
    html = trimSpaceThan2(html)
  } else if (res.type === 'file') {
    html = `<div style="white-space: normal;">
      <div class="file-upload border-1 p-2" contenteditable="false">
        <div class="flex-row flex-row-center">
          <span class="fa-file-icon mr-2 ${res.icon}"></span>
          <div class="flex-1">
            <h3 class="fs-14 file-name ellipse-2">${res.fileName}</h3>
            <p>${res.size}</p>
            <p class="file-content" style="height: 0;overflow:hidden">${JSON.stringify(res)}</p>
          </div>
        </div>
      </div>
      <span style="word-break: break-word;min-width: 1px;min-height: 1px"></span>
    </div>`
    html = trimSpaceThan2(html)
  }
  const elem = document.createElement('div')
  elem.innerHTML = html
  const frag = document.createDocumentFragment()
  let el = null
  let pre = null
  while ((el = elem.firstChild)) {
    pre = frag.appendChild(el)
  }
  range.insertNode(frag)

  const _range = range.cloneRange()
  _range.setStartAfter(pre)
  _range.collapse(true)
  selection.removeAllRanges()
  selection.addRange(_range)
}
/**
 * 当编辑框连续两个元素是只读时，用空元素进行分割，防止同时删除
 * @param {*} parentNode
 */
export function appendEmptyEle(parentNode) {
  const nodes = parentNode.querySelectorAll('[contenteditable="false"]')
  nodes.forEach(node => {
    if (node.nextSibling && node.nextSibling.getAttribute('contenteditable') === 'false') {
      const el = document.createElement('span')
      el.style.cssText = 'word-break: break-word;min-width: 1px;min-height: 1px;'
      parentNode.insertBefore(el, node.nextSibling)
    }
  })
}
/**
 * 剔除2个以上空格
 * @param {*} str
 * @returns
 */
export function trimSpaceThan2(str) {
  return (str || '').replace(/[\r\n]/g, '').replace(/\s{2,}/g, '')
}
/**
 * 获取文件icon
 * @param {*} fileType
 * @returns
 */
export function fileTypeIcon(fileType) {
  if (!fileType) return 'unknown'
  fileType = fileType.trim().toLowerCase()
  const map = ['doc', 'docx', 'dotx', 'dot', 'docm', 'dotm', 'xps', 'mht', 'mhtml', 'rtf', 'xml', 'odt', 'pdf', 'ppt', 'pptx', 'xls', 'xlsx', 'xlsb', 'xlsm', 'xlst', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'jpeg2000', 'mp4', 'avi', 'rm', 'rmvb', 'wmv', 'f4v', 'flv', 'mid', 'mpeg', 'mpg', 'dat']
  return map.indexOf(fileType) === -1 ? 'unknown' : fileType
}
