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
 * 图片函数
 *
 * @param {*} file
 * @param {*} cb 回调函数
 * @param {number} [maxsize=200 * 1024] 图片最大体积
 */
export function handleImage(file, cb, maxsize = 200 * 1024) {
  if (!file || !/\/(?:jpeg|jpg|png)/i.test(file.type)) {
    return
  }

  const reader = new FileReader()
  reader.onload = function () {
    const result = this.result
    let img = new Image()
    img.crossOrigin = 'anonymous'

    if (result.length <= maxsize) {
      cb && cb(result)
      return
    }

    img.onload = function () {
      const compressedDataUrl = compress(img, file.type, maxsize / 1024)
      cb && cb(compressedDataUrl)
      img = null
    }

    img.onerror = function () {
      cb && cb({
        type: 'error',
        message: 'Failed to get image from: ' + result,
        url: result
      })
    }

    img.src = result
  }

  reader.readAsDataURL(file)
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
    if (!flag) cb && cb({
      type: 'error',
      message: 'Failed to get paste'
    })
  }, 1)
}
/**
 * 粘贴
 * @param {*} e paste事件
 * @param {*} selector 编辑框选择器
 * @returns
 */
export function paste(e, selector = '.editor') {
  if (!(e.clipboardData && e.clipboardData.items)) {
    // 只有ie支持window.clipboardData
    const clipboardData = e.clipboardData || window.clipboardData
    if (!clipboardData && navigator.clipboard) {
      return navigator.clipboard.readText().then(str => {
        resolve({
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
          handleImage(pasteFile, (res) => {
            typeof res === 'object' ? reject(res) : resolve({
              type: 'image',
              url: res
            })
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
        handleImage(src, res => {
          typeof res === 'object' ? reject(res) : resolve({
            type: 'image',
            url: res
          })
        })
      })
    })
  }
  return new Promise((resolve, reject) => {
    e.clipboardData.items.forEach(item => {
      if (item.kind === 'string') {
        item.getAsString((str) => {
          resolve({
            type: 'text',
            text: str
          })
        })
      } else if (item.kind === 'file') {
        const pasteFile = item.getAsFile()
        handleImage(pasteFile, res => {
          typeof res === 'object' ? reject(res) : resolve({
            type: 'image',
            url: res
          })
        })
      } else {
        reject(new Error('Not allow to paste this type!'))
      }
    })
  })
}

/**
 * 渲染节点
 * @param {*} res {type, text, url}
 * @param {boolean} disableReturn 是否可以换行
 * @returns 
 */
export function renderHtml(res, disableReturn = false) {
  const selection = window.getSelection()
  if (!selection.rangeCount) return false
  selection.deleteFromDocument()
  const range = selection.getRangeAt(0)
  let node = null
  if (res.type === 'text') {
    res.text.trim()
    if (!disableReturn) {
      const paragraphs = res.text.split(/[\r\n]+/g)
      const frag = document.createDocumentFragment()
      if (paragraphs.length <= 1) {
        node = document.createTextNode(res.text)
        range.insertNode(node)
      } else {
        paragraphs.forEach(t => {
          node = document.createElement('div')
          node.innerHTML = t
          frag.appendChild(node)
        })
        range.insertNode(frag)
      }
    } else {
      const text = res.text.replace(/[\r\n]/g, ' ')
      node = document.createTextNode(text)
      range.insertNode(node)
    }
  } else if (res.type === 'image') {
    const img = document.createElement('img')
    img.src = res.url
    img.className = 'editor-img'
    range.insertNode(img)
    node = img
  } else if (res.type === 'emoji') {
    node = document.createElement('img')
    node.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='
    node.className = res.style + ' weui-icon_emotion-1'
    node.style.backgroundImage = `url(${res.source})`
    range.insertNode(node)
  }
  return node
}
/**
 * 获取光标位置
 * @param {DOMElement} element 输入框的dom节点
 * @return {Number} 光标位置
 */
export function getCursorPosition(element) {
  let caretOffset = 0
  const doc = element.ownerDocument || element.document
  const win = doc.defaultView || doc.parentWindow
  const sel = win.getSelection()
  if (sel.rangeCount > 0) {
    const range = win.getSelection().getRangeAt(0)
    const preCaretRange = range.cloneRange()
    preCaretRange.selectNodeContents(element)
    preCaretRange.setEnd(range.endContainer, range.endOffset)
    caretOffset = preCaretRange.toString().length
  }
  return caretOffset
}
/**
 * 设置光标位置
 * @param {DOMElement} element 输入框的dom节点
 * @param {Number} cursorPosition 光标位置的值
 */
export function setCursorPosition(element, cursorPosition) {
  const range = document.createRange()
  range.setStart(element.firstChild, cursorPosition)
  range.setEnd(element.firstChild, cursorPosition)
  const sel = window.getSelection()
  sel.removeAllRanges()
  sel.addRange(range)
}
