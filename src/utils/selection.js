export default class Selection {
  constructor() {
    this.currentRange = null
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
    const _range = selection.getRangeAt(0)
    this.currentRange = _range.cloneRange()
  }
  moveElemEnd(elem) {
    const range = this.currentRange
    range.setStartAfter(elem)
    range.collapse(true)
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
  // 恢复选区
  restoreSelection() {
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(this.currentRange)
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
}
