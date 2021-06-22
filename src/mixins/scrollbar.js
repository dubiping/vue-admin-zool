export default {
  data() {
    return {
      scrollbarStyle: {
        marginLeft: '-10px',
        marginRight: '-10px!important',
        maxHeight: 'auto'
      }
    }
  },
  mounted() {
    const fn = () => {
      const screenHeight = document.body.clientHeight
      const maxHeight = screenHeight * 0.85 - 64 - 72 - 32
      this.$set(this.scrollbarStyle, 'maxHeight', maxHeight + 'px')
    }
    window.onresize = () => {
      return fn()
    }
    this.$nextTick(fn)
  }
}
