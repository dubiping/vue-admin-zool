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
  } else if (res.type === 'at') {
    node = document.createElement('span')
    node.innerText = res.text
    node.style.cssText = '-webkit-user-modify: read-only;user-modify: read-only'
    range.insertNode(node)
  }
  return node
}
