<template>
  <div class="scroll-page flex-row">
    <ScrollView ref="scroll" @pulldown="pulldown" @pullup="pullup">
      <div class="scroll-list">
        <div
          v-for="item in list"
          :key="item"
          class="scroll-item flex-center"
        >{{ item }}</div>
      </div>
    </ScrollView>
    <ScrollView
      ref="chat"
      class="ml-4"
      :up-use="false"
      :header-slot="'header'"
      @pulldown="loadmoreChat"
    >
      <template #header="{downStatus}">
        <span v-if="downStatus === ''">查看更多内容</span>
        <span v-else-if="downStatus === 'start'">查看更多内容</span>
        <p v-else-if="downStatus === 'loading'">
          <span class="loading" />
          <span class="ml-2">加载中 ...</span>
        </p>
      </template>
      <div class="chat-list">
        <div
          v-for="item in chatList"
          :key="item"
          class="scroll-item flex-center"
        >{{ item }}</div>
      </div>
    </ScrollView>
  </div>
</template>
<script>
import ScrollView from '@/components/ScrollView'
export default {
  name: 'ScrollViewPage',
  components: {
    ScrollView
  },
  data() {
    return {
      list: [1, 2],
      chatList: []
    }
  },
  created() {
    this.curChatPage = 1
  },
  methods: {
    pullup() {
      console.log('pullup')
      setTimeout(() => {
        const len = this.list.length
        for (let i = 0; i < 10; i++) {
          this.list.push(len + i + 1)
        }
        if (len + 10 > 40) {
          this.$refs.scroll.endUp()
          return
        }
        this.$refs.scroll.stopUp()
      }, 2000)
    },
    pulldown() {
      setTimeout(() => {
        const len = 0
        const list = []
        for (let i = 0; i < 10; i++) {
          list.push(len + i + 1)
        }
        this.list = list
        this.$refs.scroll.stopDown()
      }, 2000)
    },
    loadmoreChat() {
      setTimeout(() => {
        const len = this.chatList.length
        const maxCount = this.curChatPage === 1 ? 3 : 10
        for (let i = 0; i < maxCount; i++) {
          this.chatList.unshift(len + i + 1)
        }
        this.$refs.chat.stopDown()
        this.$refs.chat.showDownTip()
        if (this.curChatPage === 1) {
          this.$refs.chat.scrollBottom()
        } else {
          this.$refs.chat.restoreScrollPos()
        }
        this.curChatPage++
      }, 2000)
    }
  }
}
</script>
<style lang="scss" scoped>
.scroll-page {
  height: 300px;
  .scroll-item {
    height: 60px;
    margin-bottom: 20px;
    background: skyblue;
    border-radius: 10px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  .chat-list {
    min-height: 100%;
    background: #f9f9f9;
  }
}
</style>
