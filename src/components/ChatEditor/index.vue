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
      <el-button @click="handleAtMerber">@</el-button>
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
import { paste, insertHtml } from '@/utils/editorApi'
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
    this.selection = new Selection(this.$refs.editor)
    // this.selection.createRangeByElem(this.$refs.editor, false, true)
  },
  methods: {
    insertEmoji(e) {
      this.setEditorStyle(true)
      this.selection.restoreSelection()
      const node = insertHtml({
        type: 'emoji',
        source: this.source,
        ...e
      })
      console.log(node, this.selection.getRange())
      // this.selection.restoreSelection()
      this.setEditorStyle()
    },
    handleFolder() {
      this.selection.restoreSelection()
      const node = insertHtml({
        type: 'file',
        fileName: '0808.xlsx',
        size: '80kb',
        icon: 'xlsx'
      })
      console.log(node, this.selection.getRange())
      this.selection.restoreSelection()
    },
    handleAtMerber() {
      this.selection.restoreSelection()
      const node = insertHtml({
        type: 'at',
        text: `@xxx`
      })
      console.log(node, this.selection.getRange())
      this.selection.restoreSelection()
    },
    // 处理粘贴事件
    handlePaste(e) {
      console.log(e.clipboardData.types.join(' '))
      paste(e).then(res => {
        console.log(res)
        this.selection.restoreSelection()
        const node = insertHtml(res)
        console.log(node, this.selection.getRange())
        this.selection.restoreSelection()
      })
    },
    setEditorStyle(hasHtml) {
      this.$refs.editor.style.cssText = hasHtml ? '-webkit-user-modify: read-write;user-modify: read-write;' : '-webkit-user-modify: read-write-plaintext-only;user-modify: read-write-plaintext-only;'
    }
  }
}
</script>
<style lang="scss">
.file-upload {
  width: 250px;
  display:inline-block;
  cursor: not-allowed;
  user-select: none;
  -webkit-user-modify: read-only;
  user-modify: read-only;
}
.fa-file-icon {
  width: 40px;
  height: 40px;
  background: url("../../assets/chat_images/file-icon.png") no-repeat;
  background-size: 201.5px 150px;
}
.doc,
.docm,
.docx,
.dot,
.dotm,
.dotx,
.mht,
.mhtml,
.odt,
.rtf,
.xml,
.xps {
  background-position: -106px -55px;
}
.xls,
.xlsb,
.xlsm,
.xlst,
.xlsx {
  background-position: -106px -5px;
}
.ppt,
.pptx {
  background-position: -5px -5px;
}
.pdf {
  background-position: -5px -55px;
}
.avi,
.dat,
.f4v,
.mid,
.move,
.mp4,
.mpeg,
.mpg,
.rm,
.rmvb,
.wmv {
  background-position: -55.5px -5px;
}
.bmp,
.gif,
.jpeg2000,
.jpeg,
.jpg,
.png {
  background-position: -55px -105px;
}
.noknown,
.unknown {
  background-position: -151.5px -5px;
}
</style>
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
    -webkit-user-modify: read-write-plaintext-only;
    user-modify: read-write-plaintext-only;
    line-height: 22px;
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