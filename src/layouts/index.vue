<template>
  <div class="vue-admin-zool-wrapper">
    <div
      v-if="device === 'mobile'"
      class="mask"
      @click="handleFoldSideBar"
    />
    <side-bar />
    <div class="main-container">
      <app-main />
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  name: 'Layout',
  computed: {
    ...mapGetters([
      'device'
    ])
  },
  methods: {
    handleFoldSideBar() {
      this.$store.dispatch('settings/foldSideBar')
    }
  }
}
</script>
<style lang="scss" scoped>
@import "~@/styles/mixin.scss";
@import "~@/styles/variables.scss";
.vue-admin-zool-wrapper {
  @include clearfix;
  position: relative;
  width: 100%;
  height: 100%;

  .mask {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: $base-z-index - 1;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    background: #000;
    opacity: 0.5;
  }
}
</style>
