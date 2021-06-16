<template>
  <div>
    <!-- <audio-recorder
    upload-url="YOUR_API_URL"
    :attempts="3"
    :time="2"
    :headers="headers"
    :before-recording="callback"
    :pause-recording="callback"
    :after-recording="callback"
    :select-record="callback"
    :before-upload="callback"
    :successful-upload="callback"
    :failed-upload="callback"/> -->
    <ChatEditor></ChatEditor>
  </div>
</template>

<script>
import ChatEditor from '@/components/ChatEditor'
export default {
  name: 'Dashboard',
  components: {
    ChatEditor
  },
  props: {},
  data() {
    return {}
  },
  created() {},
  mounted() {},
  methods: {
    callback(data) {
      console.log(data)
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
