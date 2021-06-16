<template>
  <div class="chat-editor">
    <div class="tool-bar">
      <EmojiWx
        :source="source"
        @insertemoji="insertEmoji"
      >
        <svg-icon icon-class="reply_tool_emoji" class="reply_button" />
      </EmojiWx>
      <span @click="handleFolder">
        <svg-icon icon-class="folder" />
      </span>
    </div>
    <div class="editor"
      ref="editor"
      :placeholder="placeholder"
      contenteditable="true"
       @paste.prevent="handlePaste"
    />
  </div>
</template>
<script>
import EmojiWx from '@/components/EmojiWx'
import { paste, renderHtml } from '@/utils/paste'
import Selection from '@/utils/selection'
export default {
  name: 'ChatEditor',
  components: {
    EmojiWx
  },
  props: {
    placeholder: {
      type: String,
      default: '请输入。。。。。'
    }
  },
  data() {
    return {
      source: 'https://res.wx.qq.com/wxdoc/dist/assets/img/emoji-sprite.b5bd1fe0.png'
    }
  },
  mounted () {
    this.selection = new Selection()
    this.selection.createRangeByElem(this.$refs.editor, false, true)
  },
  methods: {
    insertEmoji(e) {
      this.selection.restoreSelection()
      const node = renderHtml({
        type: 'emoji',
        source: this.source,
        ...e
      })
      console.log(node, this.selection.getRange())
      this.selection.moveElemEnd(node)
      this.selection.restoreSelection()
    },
    handleFolder() {
      console.log(this.$refs.editor.innerText)
    },
    // 处理粘贴事件
    handlePaste(e) {
      paste(e).then(res => {
        console.log(res)
        const node = renderHtml(res)
        console.log(node, this.selection.getRange())
        this.selection.moveElemEnd(node)
        this.selection.restoreSelection()
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.chat-editor {
  .editor {
    width: 400px;
    min-height: 200px;
    outline: none;
    box-sizing: border-box;
    padding: 20px;
    white-space: pre-wrap;
    word-wrap: break-word;
    border: 1px solid #ccc;
    border-radius: 5px;
    &:empty:before {
      content: attr(placeholder);
      display: block; /* For Firefox */
      filter: contrast(15%);
      outline: none;
      cursor: text;
    }
  }
}
</style>