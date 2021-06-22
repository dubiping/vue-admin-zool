<template>
  <div ref="scroll">
    <div class="scroll-header">
      <slot v-if="headerSlot" :name="headerSlot" />
      <span v-else-if="upStatus === 'default'">下拉刷新</span>
      <span v-else-if="upStatus === 'start'">释放更新</span>
      <template v-else-if="upStatus === 'loading'">
        <span class="loading" />
        <span>加载中 ...</span>
      </template>
    </div>
    <slot />
    <div class="scroll-footer">
      <slot v-if="bottomSlot" :name="bottomSlot" />
      <template v-else-if="downStatus === 'loading'">
        <span class="loading" />
        <span>加载中 ...</span>
      </template>
      <span v-else-if="downStatus === 'noData'">没有更多了，我是有底线的</span>
    </div>
  </div>
</template>
<script>
export default {
  name: 'ScrollView',
  props: {
    headerSlot: {
      type: String,
      default: ''
    },
    topOffset: {
      type: Number,
      default: 80
    },
    bottomViewport: {
      type: Number,
      default: 20
    },
    bottomOffset: {
      type: Number,
      default: 100
    },
    // // 在列表顶部,下拉的距离小于offset时,改变下拉区域高度比例;值小于1且越接近0,高度变化越小,表现为越往下越难拉
    inOffsetRate: {
      type: Number,
      default: 1
    },
    // 在列表顶部,下拉的距离大于offset时,改变下拉区域高度比例;值小于1且越接近0,高度变化越小,表现为越往下越难拉
    outOffsetRate: {
      type: Number,
      default: 0.2
    },
    // 向下滑动最少偏移的角度,取值区间  [0,90];默认45度,即向下滑动的角度大于45度则触发下拉;而小于45度,将不触发下拉
    minAngle: {
      type: Number,
      default: 45
    }
  },
  data() {
    return {
      upStatus: 'default', // default start loading loaded
      downStatus: 'default', // default loading loaded noData
      loading: false
    }
  },
  mounted() {
    // 是否在滚动
    this.isScrollTo = false
    // 记录起点
    this.startPoint = {}
    // 重置上次move的点
    this.lastPoint = {}
    // 手指触摸的最大范围(写在touchstart避免body获取高度为0的情况)
    this.maxTouchmoveY = 0
    // inTouchend
    this.inTouchend = false
    this.isKeepTop = 0
  },
  methods: {
    touchstartEvent(e) {

    },
    isPc() {
      return typeof window.orientation === 'undefined'
    },
    isIOS() {
      return !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
    },
    getScrollHeight() {
      return this.$refs.scroll.scrollHeight
    },
    getClientHeight() {
      return this.$refs.scroll.clientHeight
    },
    /* body的高度 */
    getBodyHeight() {
      return document.body.clientHeight || document.documentElement.clientHeight
    },
    getScrollTop() {
      return this.$refs.scroll?.scrollTop || 0
    },
    setScrollTop(val) {
      this.$refs.scroll.scrollTop = val
    },
    /* 滚动条到底部的距离 */
    getToBottom() {
      return this.getScrollHeight() - this.getClientHeight() - this.getScrollTop()
    }
  }
}
</script>
<style lang="scss" scoped>

</style>
