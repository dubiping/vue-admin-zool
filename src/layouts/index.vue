<template>
  <div class="vue-admin-zool-wrapper">
    <div
      v-if="device === 'mobile'"
      class="mask"
      @click="handleFoldSideBar"
    />
    <div class="zool-layout-header" :class="header === 'fixed' ? 'fixed-header' : ''">
      <side-bar />
      <div class="zool-main">
        <tabs-bar />
      </div>
    </div>
    <div class="zool-main" :class="collapse ? 'is-collapse-main' : ''">
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
      'device',
      'collapse',
      'header'
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
  .zool-main {
    position: relative;
    min-height: 100%;
    margin-left: $base-left-menu-width;
    background: #f6f8f9;
    transition: $base-transition;
    .zool-app-main {
      width: calc(100% - #{$base-padding} - #{$base-padding});
      padding: $base-padding;
      background: $base-color-white;
      border-radius: $base-border-radius;
    }
  }
  &.is-collapse-main {
    margin-left: $base-left-menu-width-min;
  }
}
</style>
