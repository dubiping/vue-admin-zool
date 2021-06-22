export default class Selection {
  constructor(elem) {
    this.currentRange = null
    this.editor = elem
  }
  getRange() {
    return this.currentRange
  }
  saveRange(range) {
    if (range) {
      this.currentRange = range.cloneRange()
      return
    }
    // 获取当前的选区
    const selection = window.getSelection()
    if (selection.rangeCount === 0) {
      return
    }
    console.log(this.editor.lastChild)
    // 表情使用了overflow: hidden，导致光标出现在编辑器外部
    let lastNode = null
    if ((lastNode = this.editor.lastChild) && lastNode.className === 'weui-emoji_item') {
      this.createEmptyRange()
      return
    }
    const _range = selection.getRangeAt(0)
    this.currentRange = _range.cloneRange()
  }
  moveElemEnd(elem) {
    const range = this.currentRange
    range.setStartAfter(elem)
    range.collapse(true)
  }
  keepLastIndex(elem) {
    if (window.getSelection) {
      elem.focus()
      const selection = window.getSelection()
      selection.selectAllChildren(elem)
      selection.collapseToEnd()
    } else if (document.selection) {
      const range = document.selection.createRange()
      range.moveToElementText(elem)
      range.collapse(false)
      range.select()
    }
    this.saveRange()
  }
  // 恢复选区
  restoreSelection() {
    if (!this.currentRange) return this.keepLastIndex(this.editor)

    const selection = window.getSelection ? window.getSelection() : (document.selection ? document.selection.createRange() : null)

    if (!selection) return false

    selection.removeAllRanges()
    selection.addRange(this.currentRange)
  }
  // 折叠选区
  collapseRange(toStart) {
    if (toStart == null) {
      // 默认为 false
      toStart = false
    }
    const range = this.currentRange
    if (range) {
      range.collapse(toStart)
    }
  }
  // 选中区域的文字
  getSelectionText() {
    const range = this.currentRange
    if (range) {
      return this.currentRange.toString()
    } else {
      return ''
    }
  }
  // 选区的 $Elem
  getSelectionContainerElem(range) {
    range = range || this.currentRange
    let elem
    if (range) {
      elem = range.commonAncestorContainer
      return elem.nodeType === 1 ? elem : elem.parentNode
    }
  }
  getSelectionStartElem(range) {
    range = range || this.currentRange
    let elem
    if (range) {
      elem = range.startContainer
      return elem.nodeType === 1 ? elem : elem.parentNode
    }
  }
  getSelectionEndElem(range) {
    range = range || this.currentRange
    let elem
    if (range) {
      elem = range.endContainer
      return elem.nodeType === 1 ? elem : elem.parentNode
    }
  }
  // 选区是否为空
  isSelectionEmpty() {
    const range = this.currentRange
    if (range && range.startContainer) {
      if (range.startContainer === range.endContainer) {
        if (range.startOffset === range.endOffset) {
          return true
        }
      }
    }
    return false
  }
  createRangeByElem(elem, toStart, isContent) {
    if (!elem) return
    const range = document.createRange()
    if (isContent) {
      range.selectNodeContents(elem)
    } else {
      range.selectNode(elem)
    }

    if (typeof toStart === 'boolean') {
      range.collapse(toStart)
    }

    // 存储 range
    this.saveRange(range)
  }
  createEmptyRange() {
    const range = this.currentRange
    if (!range) return
    const el = document.createElement('span')
    el.style.cssText = 'word-break: break-word;min-width: 1px;min-height: 1px'
    range.insertNode(el)
    this.moveElemEnd(el)
    this.restoreSelection()
  }
}
