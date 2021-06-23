<template>
  <div
    ref="scroll"
    class="scroll"
    :class="{
      'scroll-hardware': hardwareClass
    }"
    :style="scrollStyle"
  >
    <div
      class="scroll-header"
      :style="{
        height: downHeight + 'px'
      }"
    >
      <div class="scroll-header__content flex-center">
        <slot v-if="headerSlot" :name="headerSlot" :downStatus="downStatus" />
        <span v-else-if="downStatus === ''">下拉刷新</span>
        <span v-else-if="downStatus === 'start'">释放更新</span>
        <template v-else-if="downStatus === 'loading'">
          <span class="loading" />
          <span class="ml-2">加载中 ...</span>
        </template>
      </div>
    </div>
    <slot />
    <div v-show="upStatus !== ''" class="scroll-footer">
      <div class="scroll-footer_content flex-center">
        <slot v-if="bottomSlot" :name="bottomSlot" :upStatus="upStatus" />
        <template v-else-if="upStatus === 'loading'">
          <span class="loading" />
          <span class="ml-2">加载中 ...</span>
        </template>
        <span v-else-if="upStatus === 'noData'">没有更多了，我是有底线的</span>
      </div>
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
    bottomSlot: {
      type: String,
      default: ''
    },
    topOffset: {
      type: Number,
      default: 50
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
    },
    // 是否允许ios的bounce回弹;默认true,允许
    isBounce: {
      type: Boolean,
      default: true
    },
    // 列表数据过少,不足以滑动触发上拉加载,是否自动加载下一页,直到满屏或者无更多数据为止;默认false,因为可通过调高page.size避免这个情况
    isLoadFull: {
      type: Boolean,
      default: false
    },
    // 延时执行的毫秒数; 延时是为了保证列表数据或占位的图片都已初始化完成,且下拉刷新上拉加载中区域动画已执行完毕;
    loadFullDelay: {
      type: Number,
      default: 500
    },
    // 是否在初始化完毕之后自动执行下拉刷新的回调; 默认true
    auto: {
      type: Boolean,
      default: true
    },
    // 是否启用上拉加载
    upUse: {
      type: Boolean,
      default: true
    },
    // 是否启用下拉刷新
    downUse: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      upStatus: '', // '' start loading  noData
      downStatus: '', // '' loading  noData
      loading: false,
      hardwareClass: false,
      scrollStyle: '',
      downHeight: 0
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
    this.movetype = 0
    this.isMoveDown = false
    this.preScrollY = 0
    this.isSetScrollAuto = false
    this.lastScrollTop = 0
    this.lastScrollHeight = 0
    this.init()
    if (this.upUse && this.auto) {
      this.triggerUpScroll()
    } else if (this.downUse && this.auto) {
      this.triggerDownScroll()
    }
  },
  destroyed() {
    this.destroy()
  },
  methods: {
    init() {
      this.$refs.scroll.addEventListener('mousedown', this.touchstartEvent)
      this.$refs.scroll.addEventListener('touchstart', this.touchstartEvent)

      this.$refs.scroll.addEventListener('touchmove', this.touchmoveEvent)
      this.$refs.scroll.addEventListener('scroll', this.scrollEvent)

      this.$refs.scroll.addEventListener('mouseup', this.touchendEvent)
      this.$refs.scroll.addEventListener('mouseleave', this.touchendEvent)
      this.$refs.scroll.addEventListener('touchend', this.touchendEvent)
      this.$refs.scroll.addEventListener('touchcancel', this.touchendEvent)
    },
    destroy() {
      this.$refs.scroll?.removeEventListener('touchstart', this.touchstartEvent) // 移动端手指事件
      this.$refs.scroll?.removeEventListener('touchmove', this.touchmoveEvent) // 移动端手指事件
      this.$refs.scroll?.removeEventListener('touchend', this.touchendEvent) // 移动端手指事件
      this.$refs.scroll?.removeEventListener('touchcancel', this.touchendEvent) // 移动端手指事件
      this.$refs.scroll?.removeEventListener('mousedown', this.touchstartEvent) // PC端鼠标事件
      this.$refs.scroll?.removeEventListener('mousemove', this.touchmoveEvent) // PC端鼠标事件
      this.$refs.scroll?.removeEventListener('mouseup', this.touchendEvent) // PC端鼠标抬起事件
      this.$refs.scroll?.removeEventListener('mouseleave', this.touchendEvent) // PC端鼠标离开事件
      this.$refs.scroll?.removeEventListener('scroll', this.scrollEvent)
    },
    touchstartEvent(e) {
      if (this.isScrollTo) this.preventDefault(e)
      this.startPoint = this.getPoint(e)
      this.lastPoint = this.startPoint
      // 手指触摸的最大范围
      this.maxTouchmoveY = this.getBodyHeight() - this.bottomViewport
      this.inTouchend = false
      const scrollTop = this.getScrollTop()
      this.isKeepTop = scrollTop === 0
      if (this.isPc() && scrollTop <= 0) {
        this.$refs.scroll.addEventListener('mousemove', this.touchmoveEvent, {
          passive: false
        })
        document.ondragstart = function() {
          return false
        }
      }
    },
    touchmoveEvent(e) {
      if (!this.startPoint) return
      const scrollTop = this.getScrollTop()
      // 在移动过程中,只要滚动条有一次大于0,则标记false
      if (scrollTop > 0) this.isKeepTop = false
      const curPoint = this.getPoint(e)
      // 和起点比,移动的距离,大于0向下拉,小于0向上拉
      const moveY = curPoint.y - this.startPoint.y
      // 向下拉
      if (moveY > 0) {
        if (scrollTop <= 0) {
          // 阻止浏览器默认的滚动,避免触发bounce
          this.preventDefault(e)

          if (this.downUse && !this.inTouchend && !this.loading) {
            // 下拉的角度是否在配置的范围内
            const x = Math.abs(this.lastPoint.x - curPoint.x)
            const y = Math.abs(this.lastPoint.y - curPoint.y)
            const z = Math.sqrt(x * x + y * y)
            if (z !== 0) {
              // 两点之间的角度,区间 [0,90]
              const angle = Math.asin(y / z) / Math.PI * 180
              // 如果小于配置的角度,则不往下执行下拉刷新
              if (angle < this.minAngle) return
            }

            // 如果手指的位置超过配置的距离,则提前结束下拉,避免Webview嵌套导致touchend无法触发
            if (this.maxTouchmoveY > 0 && curPoint.y >= this.maxTouchmoveY) {
              this.inTouchend = true
              this.touchendEvent()
              return
            }
            // 和上次比,移动的距离 (大于0向下,小于0向上)
            const diff = curPoint.y - this.lastPoint.y
            if (!this.downHeight) this.downHeight = 0
            // 下拉距离  < 指定距离
            if (this.downHeight < this.topOffset) {
              if (this.movetype !== 1) {
                this.movetype = 1
                this.upStatus = ''
                // 标记下拉区域高度改变,在touchend重置回来
                this.isMoveDown = true
                // 下拉过程中,滚动条一直在顶部的,则不必取消回弹,否则会闪白屏
                if (this.isIOS() && !this.isKeepTop) {
                  // 开启硬件加速,解决iOS下拉因隐藏进度条而闪屏的问题
                  this.hardwareClass = true
                  this.scrollStyle = '-webkit-overflow-scrolling: auto;'
                  this.isSetScrollAuto = true
                }
              }
              // 越往下,高度变化越小
              this.downHeight += diff * this.inOffsetRate
            } else {
              // 指定距离  <= 下拉距离
              if (this.movetype !== 2) {
                this.movetype = 2
                this.upStatus = 'start'
                this.isMoveDown = true
                if (this.isIOS() && !this.isKeepTop) {
                  // 开启硬件加速,解决iOS下拉因隐藏进度条而闪屏的问题
                  this.hardwareClass = true
                  this.scrollStyle = '-webkit-overflow-scrolling: auto;'
                  this.isSetScrollAuto = true
                }
              }
              // 向下拉
              if (diff > 0) {
                // 越往下,高度变化越小
                this.downHeight += diff * this.outOffsetRate
              } else { // 向上收
                // 向上收回高度,则向上滑多少收多少高度
                this.downHeight += diff
              }
            }
          }
        }
      } else if (moveY < 0) {
        // 向上拉
        const scrollHeight = this.getScrollHeight()
        const clientHeight = this.getClientHeight()
        const toBottom = scrollHeight - clientHeight - scrollTop
        if (!this.isBounce && toBottom <= 0) this.preventDefault(e)

        // 如果不满屏或者已经在底部,无法触发scroll事件,此时需主动触发上拉回调
        if (this.upUse && this.upStatus !== 'noData' && !this.loading && (clientHeight + this.bottomOffset >= scrollHeight || toBottom <= 0)) {
          this.triggerUpScroll()
        }
      }
      this.lastPoint = curPoint
    },
    touchendEvent(e) {
      if (this.downUse && this.isMoveDown) {
        if (this.downHeight >= this.topOffset) {
          this.downHeight = this.topOffset
          this.downStatus = 'loading'
          this.$emit('pulldown')
        } else {
          this.downHeight = 0
        }
        if (this.isSetScrollAuto) {
          this.hardwareClass = false
          this.isSetScrollAuto = false
          this.scrollStyle = '-webkit-overflow-scrolling: touch;'
        }
        this.movetype = 0
        this.isMoveDown = false
      }
      if (this.isPc()) {
        this.$refs.scroll.removeEventListener('mousemove', this.touchmoveEvent)
        document.ondragstart = function() {
          return true
        }
      }
    },
    scrollEvent(e) {
      const scrollTop = this.getScrollTop()
      const isUp = scrollTop - this.preScrollY > 0
      this.preScrollY = scrollTop

      if (this.upUse && !this.loading && this.upStatus !== 'noData') {
        // offsetHeight 列表高度(内容+内边距+边框),滚动条在边框之内,所以使用clientHeight即可
        // clientHeight 列表高度(内容+内边距),不含列表边框
        // scrollHeight 列表内容撑开的高度
        const toBottom = this.getScrollHeight() - this.getClientHeight() - scrollTop
        if (toBottom <= this.bottomOffset && isUp) {
          this.triggerUpScroll()
        }
      }

      if (this.downUse && !this.loading && this.downStatus !== 'noData' && scrollTop <= 0 && this.isPc()) {
        this.triggerDownScroll()
      }

      this.$emit('scroll', scrollTop)
    },
    triggerDownScroll() {
      this.loading = true
      this.downStatus = 'loading'
      this.downHeight = this.topOffset
      this.$emit('pulldown')
    },
    triggerUpScroll() {
      this.upStatus = 'loading'
      this.loading = true
      this.$emit('pullup')
    },
    setUpStatus(isLoad, status) {
      this.loading = isLoad
      this.upStatus = status
    },
    setDownStatus(isLoad, status) {
      this.loading = isLoad
      this.downStatus = status
    },
    stopUp() {
      this.loading = false
      this.upStatus = ''
      this.loadFull()
    },
    stopDown() {
      this.loading = false
      this.downStatus = ''
      this.downHeight = 0
    },
    endUp() {
      this.loading = false
      this.upStatus = 'noData'
    },
    endDown() {
      this.loading = false
      this.downStatus = 'noData'
    },
    showDownTip() {
      this.downHeight = this.topOffset
    },
    isPc() {
      return typeof window.orientation === 'undefined'
    },
    isIOS() {
      return !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
    },
    /* 阻止浏览器默认滚动事件 */
    preventDefault(e) {
      if (e && e.cancelable && !e.defaultPrevented) e.preventDefault()
    },
    /* 根据点击滑动事件获取第一个手指的坐标 */
    getPoint(e) {
      return {
        x: e.touches ? e.touches[0].pageX : e.clientX,
        y: e.touches ? e.touches[0].pageY : e.clientY
      }
    },
    getScrollHeight() {
      const scrollHeight = this.$refs.scroll.scrollHeight
      this.lastScrollHeight = scrollHeight
      return scrollHeight
    },
    getClientHeight() {
      return this.$refs.scroll.clientHeight
    },
    /* body的高度 */
    getBodyHeight() {
      return document.body.clientHeight || document.documentElement.clientHeight
    },
    getScrollTop() {
      const scrollTop = this.$refs.scroll?.scrollTop || 0
      this.lastScrollTop = scrollTop
      return scrollTop
    },
    setScrollTop(val) {
      this.$refs.scroll.scrollTop = val
    },
    /* 滚动条到底部的距离 */
    getToBottom() {
      return this.getScrollHeight() - this.getClientHeight() - this.getScrollTop()
    },
    loadFull() {
      if (this.isLoadFull && this.upStatus !== 'noData' && this.getScrollHeight() <= this.getClientHeight()) {
        setTimeout(() => {
          this.getScrollHeight() <= this.getClientHeight() && this.triggerUpScroll()
        }, this.loadFullDelay)
      }
    },
    /* 滑动列表到指定位置--带缓冲效果 (y=0回到顶部;如果要滚动到底部可以传一个较大的值,比如99999);t时长,单位ms,默认300 */
    scrollTo(y, t) {
      const start = this.getScrollTop()
      let end = y
      if (end > 0) {
        const maxY = this.getScrollHeight = this.getClientHeight()
        if (end > maxY) end = maxY
      } else {
        end = 0
      }
      // 标记在滑动中,阻止列表的触摸事件
      this.isScrollTo = true
      this.scrollStyle = '-webkit-overflow-scrolling: auto; overflow: hidden;'
      this.getStep(start, end, (step) => {
        this.setScrollTop(step)
        if (step === end) {
          this.scrollStyle = '-webkit-overflow-scrolling: touch; overflow: auto;'
          this.isScrollTo = false
        }
      }, t)
    },
    // 滚动到底部
    scrollBottom() {
      this.$nextTick(() => {
        this.setScrollTop(this.getScrollHeight())
      })
    },
    scrollIntoView(elem) {
      this.$nextTick(() => {
        elem.scrollIntoView()
      })
    },
    restoreScrollPos() {
      this.$nextTick(() => {
        const lastScrollHeight = this.lastScrollHeight
        const scrollTop = this.getScrollHeight() - lastScrollHeight + this.lastScrollTop
        this.setScrollTop(scrollTop)
      })
    },
    /* 计步器
     star: 开始值
     end: 结束值
     callback(step,timer): 回调step值,计步器timer,可自行通过window.clearInterval(timer)结束计步器;
     t: 计步时长,传0则直接回调end值;不传则默认300ms
     rate: 周期;不传则默认30ms计步一次
    */
    getStep(start, end, callback, t, rate) {
      const diff = end - start
      if (t === 0 || diff === 0) {
        callback && callback(0)
        return
      }
      // 时长 300ms
      t = t || 300
      // 周期 30ms
      rate = rate || 30
      const count = t / rate
      const step = diff / count
      let i = 0
      const timer = setTimeout(() => {
        if (i < count - 1) {
          start += step
          callback && callback(start, timer)
          i++
        } else {
          callback && callback(end, timer)
          clearInterval(timer)
        }
      }, rate)
    }
  }
}
</script>
<style lang="scss" scoped>
.scroll {
  width: 100%;
  height: 100%;
  overflow-y: auto;
}
.scroll-hardware {
  -webkit-transform: translateZ(0);
  -webkit-transform-style: preserve-3d;
  -webkit-backface-visibility: hidden;
  -webkit-perspective: 1000;
}
.scroll-header {
  width: 100%;
  overflow: hidden;
  text-align: center;
  position: relative;
  background: #F8F8F9;
  .scroll-header__content {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    min-height: 30px;
    padding: 10px 0;
    background: #fff;
  }
}
.scroll-footer {
  min-height: 30px;
  padding: 15px 0;
  text-align: center;
}
.loading {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid gray;
  border-bottom-color: transparent;
  vertical-align: middle;
  animation: rotate 0.6s linear infinite;
}
@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
