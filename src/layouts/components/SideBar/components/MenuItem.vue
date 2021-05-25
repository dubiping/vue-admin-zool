<template>
  <el-menu-item :index="handlePath(routeChildren.path)" @click="handleLink">
    <i
      v-if="isElIcon(routeChildren.meta.icon)"
      :class="[routeChildren.meta.icon, 'sub-el-icon']"
    />
    <svg-icon
      v-else-if="routeChildren.meta.icon"
      :icon-class="routeChildren.meta.icon"
    />
    <span>{{ routeChildren.meta.title }}</span>
    <el-tag
      v-if="routeChildren.meta && routeChildren.meta.badge"
      type="danger"
      effect="dark"
    >
      {{ routeChildren.meta.badge }}
    </el-tag>
  </el-menu-item>
</template>

<script>
import { isExternal } from '@/utils/validate'
import path from 'path'

export default {
  name: 'MenuItem',
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
  computed: {
    isElIcon(icon) {
      return (icon + '').includes('el-icon')
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
    handleLink() {
      const routePath = this.routeChildren.path
      const target = this.routeChildren.meta.target

      if (target === '_blank') {
        if (isExternal(routePath)) {
          window.open(routePath)
        } else if (isExternal(this.fullPath)) {
          window.open(this.fullPath)
        } else if (
          this.$route.path !== path.resolve(this.fullPath, routePath)
        ) {
          const routeData = this.$router.resolve(
            path.resolve(this.fullPath, routePath)
          )
          window.open(routeData.href)
        }
      } else {
        if (isExternal(routePath)) {
          window.location.href = routePath
        } else if (isExternal(this.fullPath)) {
          window.location.href = this.fullPath
        } else if (
          this.$route.path !== path.resolve(this.fullPath, routePath)
        ) {
          this.$router.push(path.resolve(this.fullPath, routePath))
        }
      }
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
