<template>
  <el-popover v-model="show" placement="top-start" :width="width" trigger="click">
    <div
      class="custom-popover"
      :style="{ width: width +'px', height: height +'px'}"
    >
      <div v-show="showHistory || history.length">
        <div class="weui-emotion_head">最近使用</div>
        <div
          v-for="(item, index) in history"
          :key="item"
          class="weui-emotion_item"
          :style="{
            marginRight: ((index + 1) % perLine ? extraPadding : 0) + 'px',
          }"
          @click="insertEmoji(item)"
        >
          <div
            class="weui-icon_emotion"
            :class="emotions[item].style"
            :style="{
              backgroundImage: `url(${source})`,
            }"
          />
        </div>
      </div>
      <div class="weui-emotion_head" style="margin-top: 8px">所有表情</div>
      <div
        v-for="(item, index) in emotions"
        :key="item.id"
        class="weui-emotion_item"
        :style="{
          paddingRight: ((index + 1) % perLine ? extraPadding : 0) + 'px',
        }"
        @click="insertEmoji(index)"
      >
        <div
          class="weui-icon_emotion"
          :class="item.style"
          :style="{
            backgroundImage: `url(${source})`,
          }"
        />
      </div>
    </div>
    <slot slot="reference" />
  </el-popover>
</template>
<script>
import emojiData from './data/emoji'
import emojiPanelData from './data/panel'

const EMOTION_SIZE = 40
const emotionMap = {}
const emotionNames = []
emojiData.forEach((item) => {
  emotionMap[item.id] = item
  emotionNames.push(item.cn)
})
const emotions = emojiPanelData.map((id) => {
  return emotionMap[id]
})

export default {
  name: 'EmojiWx',
  props: {
    padding: {
      type: Number,
      default: 0
    },
    backgroundColor: {
      type: String,
      default: '#EDEDED',
    },
    showSend: {
      type: Boolean,
      default: true,
    },
    showDel: {
      type: Boolean,
      default: true,
    },
    showHistory: {
      type: Boolean,
      default: true,
    },
    height: {
      type: Number,
      default: 300,
    },
    width: {
      type: Number,
      default: 400,
    },
    source: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      history: [],
      emotions: emotions,
      extraPadding: 0,
      perLine: 0,
      show: false,
    }
  },
  created() {
    const padding = this.padding
    const areaWidth = this.width
    const perLine = Math.floor((areaWidth - padding * 2) / 45)
    this.extraPadding = Math.floor(
      (areaWidth - padding * 2 - perLine * EMOTION_SIZE) / (perLine - 1)
    )
    this.perLine = perLine
  },
  methods: {
    getEmojiNames() {
      return emotionNames
    },
    insertEmoji(id) {
      // const emotionName = this.emotions[id].cn
      // console.log(emotionName, id)
      this.LRUCache(this.perLine, id)
      this.show = false
      this.$emit('insertemoji', this.emotions[id])
    },
    LRUCache(limit, id) {
      const index = this.history.indexOf(id)
      if (index >= 0) {
        this.history.splice(index, 1)
        this.history.push(id)
      } else if (this.history.length < limit) {
        this.history.push(id)
      } else if (this.history.length === limit) {
        this.$set(this.history, limit - 1, id)
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.custom-popover {
  height: 200px;
  width: 378px;
  overflow: auto;
}
</style>