<template>
  <el-submenu
    ref="subMenu"
    :index="handlePath(item.path)"
    :popper-append-to-body="false"
  >
    <template slot="title">
      <i
        v-if="isElIcon(routeChildren.meta.icon)"
        :class="[routeChildren.meta.icon, 'sub-el-icon remix-icon']"
      />
      <svg-icon
        v-else-if="routeChildren.meta.icon"
        :icon-class="routeChildren.meta.icon"
        class="remix-icon"
      />
      <span>{{ item.meta.title }}</span>
    </template>
    <slot />
  </el-submenu>
</template>

<script>
import { isExternal } from '@/utils/validate'
import path from 'path'

export default {
  name: 'Submenu',
  props: {
    routeChildren: {
      type: Object,
      default() {
        return null
      }
    },
    item: {
      type: Object,
      default() {
        return null
      }
    },
    fullPath: {
      type: String,
      default: ''
    }
  },
  methods: {
    handlePath(routePath) {
      if (isExternal(routePath)) {
        return routePath
      }
      if (isExternal(this.fullPath)) {
        return this.fullPath
      }
      return path.resolve(this.fullPath, routePath)
    },
    isElIcon(icon) {
      return (icon + '').includes('el-icon')
    }
  }
}
</script>
<style lang="scss" scoped>
.sub-el-icon {
  color: currentColor;
  width: 1.125em;
  height: 1.125em;
}
</style>
