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
    <div
      ref="editor"
      class="editor"
      :draggable="true"
      :placeholder="placeholder"
      contenteditable="true"
      @paste.prevent="handlePaste"
      @focus.stop="handleFocus"
      @blur.stop="handleBlur"
      @input.stop="handleInput"
      @drop.prevent="handDrop"
      @dragleave.self.prevent
      @dragenter.self.prevent
      @dragover.self.prevent
    />
    <el-dialog
      :visible.sync="fileSendVisible"
      :modal="false"
      title="发送给"
      class="zool-dialog file-send-dialog color-gray"
      width="400px"
    >
      <div class="zool-dialog__body color-gray">
        <div class="flex-row flex-row-center">
          <el-image :src="receiverInfo.avatar || defaultAvatar" class="avatar mr-2" />
          <span>{{ receiverInfo.nickName || '哈哈哈哈' }}</span>
        </div>
        <div class="file-content mt-3">
          <div>共{{ dragFileList.length }}条消息</div>
          <template v-for="(item, index) in dragFileList">
            <div
              v-if="index < 2"
              :key="item.fileName"
              class="flex-row flex-row-center mt-1"
            >
              <svg-icon :icon-class="item.icon" class-name="mr-1" />
              <span v-if="typeToName(item.type)" class="flex-shrink mr-1">{{ typeToName(item.type) }}</span>
              <span class="ellipse-1">{{ item.type === 'text' ? item.text : item.fileName }}</span>
            </div>
          </template>
          <span
            v-if="dragFileList.length > 2"
            class="cursor-p"
            style="margin-left: 2px;"
            @click="checkSendVisible=true"
          >...</span>
        </div>
      </div>
      <template slot="footer">
        <el-button :loading="loadingConfirm" type="primary" @click="handlConfirmEvent">发 送</el-button>
        <el-button @click="fileSendVisible = false">取 消</el-button>
      </template>
    </el-dialog>
    <el-dialog
      :visible.sync="checkSendVisible"
      :modal="false"
      :title="'共' + dragFileList.length + '个文件'"
      class="zool-dialog check-send-dialog color-gray"
      width="500px"
    >
      <el-scrollbar wrap-class="zool-scrollbar_wrap" :wrap-style="[scrollbarStyle]">
        <div class="zool-dialog__body color-gray">
          <div
            v-for="item in dragFileList"
            :key="item.fileName"
            class="check-send-item pt-6 pb-6 ml-6 mr-6"
          >
            <div class="flex-row flex-row-center flex-space-between">
              <div class="flex-row flex-row-center">
                <template v-if="item.type === 'text'">
                  <span>{{ item.text }}</span>
                </template>
                <template v-else-if="item.type === 'image'">
                  <el-image :src="item.url" class="img-upload-chat mr-2" />
                  <span>{{ item.fileName }}</span>
                </template>
                <template v-else-if="item.type === 'file'">
                  <span :class="['fa-file-icon', 'mr-2', item.fileType]" />
                  <span>{{ item.fileName }}</span>
                </template>
              </div>
              <div class="color-gray">{{ item.size }}</div>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </el-dialog>
  </div>
</template>
<script>
import myMixin from '@/mixins/scrollbar'
import EmojiWx from '@/components/EmojiWx'
import { paste, drop, insertHtml, appendEmptyEle } from '@/utils/editorApi'
import Selection from '@/utils/selection'
export default {
  name: 'ChatEditor',
  components: {
    EmojiWx
  },
  mixins: [myMixin],
  props: {
    placeholder: {
      type: String,
      default: '请输入。。。。。'
    },
    // 接收者信息
    receiverInfo: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      defaultAvatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
      source: 'https://res.wx.qq.com/wxdoc/dist/assets/img/emoji-sprite.b5bd1fe0.png',
      fileSendVisible: false,
      checkSendVisible: false,
      dragFileList: [
        {
          type: 'text',
          icon: 'chat',
          text: 'this.selection = new Selection(this.$refs.editor)'
        },
        {
          type: 'image',
          icon: 'image',
          fileName: 'icon.png',
          url: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
          size: '1kb'
        },
        {
          type: 'file',
          icon: 'folder',
          fileName: '123456.xlsx',
          fileType: 'xlsx',
          size: '2kb'
        },
        {
          type: 'file',
          icon: 'folder',
          fileName: '123456.doc',
          fileType: 'doc',
          size: '2kb'
        }
      ],
      loadingConfirm: false
    }
  },
  mounted() {
    this.selection = new Selection(this.$refs.editor)
    this.selection.keepLastIndex(this.$refs.editor)
    // this.selection.createRangeByElem(this.$refs.editor, false, true)
  },
  methods: {
    insertEmoji(e) {
      this.setEditorStyle(true)
      this.selection.restoreSelection()
      insertHtml({
        type: 'emoji',
        source: this.source,
        ...e
      })
      this.selection.saveRange()
      this.setEditorStyle()
      appendEmptyEle(this.$refs.editor)
    },
    handleFolder() {
      this.setEditorStyle(true)
      this.selection.restoreSelection()
      insertHtml({
        type: 'file',
        fileName: '0808.xlsx',
        size: '80kb',
        icon: 'xlsx'
      })
      this.selection.saveRange()
      this.setEditorStyle()
      appendEmptyEle(this.$refs.editor)
    },
    handleAtMerber() {
      this.setEditorStyle(true)
      this.selection.restoreSelection()
      insertHtml({
        type: 'at',
        nickName: `xxx`,
        id: '123'
      })
      this.selection.saveRange()
      this.setEditorStyle()
      appendEmptyEle(this.$refs.editor)
    },
    // 处理粘贴事件
    handlePaste(e) {
      paste(e).then(res => {
        console.log(res)
        this.setEditorStyle(true)
        insertHtml(res)
        this.selection.saveRange()
        this.setEditorStyle()
      })
    },
    handleFocus(e) {
      this.selection.saveRange()
    },
    handleBlur(e) {
      this.selection.saveRange()
    },
    handleInput(e) {
      this.selection.saveRange()
    },
    handDrop(e) {
      drop(e).then(values => {
        let list = []
        let hasFolder = false // 是否有文件夹
        if (Array.isArray(values)) {
          list = values.filter(item => {
            !hasFolder && (hasFolder = item.fileType === 'folder')
            return item.type !== 'error'
          })
        }
        if (hasFolder) {
          this.$message.error('暂不支持发送文件夹')
          this.fileSendVisible = false
          return false
        }
        this.dragFileList = list
        this.fileSendVisible = list.length > 0
      })
    },
    setEditorStyle(hasHtml) {
      this.$refs.editor.style.cssText = hasHtml ? '-webkit-user-modify: read-write;user-modify: read-write;' : '-webkit-user-modify: read-write-plaintext-only;user-modify: read-write-plaintext-only;'
    },
    typeToName(val) {
      const map = {
        text: '',
        image: '[图片]',
        file: '[文件]'
      }
      return map[val] || ''
    },
    // 发送
    handlConfirmEvent() {

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
.img-upload-chat {
  max-width: 120px !important;
  max-height: 100px !important;
  vertical-align: top !important;
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
    word-break: break-word;
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
  .file-send-dialog {
    .zool-dialog__body {
      padding: 0 15px;
    }
    .avatar {
      width: 50px;
      height: 50px;
    }
    .file-content {
      min-height: 50px;
      padding: 10px;
      background: #f7f7f7;
      border-radius: 4px;
    }
    ::v-deep {
      .el-dialog__title {
        font-size: 14px;
        color: inherit;
      }
      .el-dialog__body, .el-dialog__footer {
        border-top: 0px;
        padding-top: 0px;
      }
    }
  }
  .check-send-dialog {
    .check-send-item {
      border-bottom: 1px solid $base-border-color;
      .img-upload-chat {
        max-width: 100px !important;
        max-height: 80px !important;
        vertical-align: top !important;
      }
    }
    ::v-deep {
      .el-dialog__title {
        font-size: 14px;
        color: inherit;
      }
      .el-dialog__body, .el-dialog__footer {
        border-top: 0px;
        padding-top: 0px;
      }
    }
  }
}
</style>
