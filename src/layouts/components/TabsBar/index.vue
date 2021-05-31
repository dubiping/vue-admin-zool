<template>
  <div class="zool-tabs-bar">
    <span>
      <svg-icon :icon-class="!collapse ? 'menu-fold-line': 'menu-unfold-line'" />
    </span>
    <el-tabs
      v-model="tabActive"
      type="card"
      class="tabs-content zool-tabs-content-smart"
      @tab-click="handleTabClick"
      @tab-remove="handleTabRemove"
    >
      <el-tab-pane
        v-for="item in visitedRoutes"
        :key="item.path"
        :label="item.meta.title"
        :name="item.path"
        :closable="!isAffix(item)"
      />
    </el-tabs>
    <el-dropdown>
      <span class="zool-tabs-more">
        <span class="zool-tabs-more-icon">
          <i class="box box-t" />
          <i class="box box-b" />
        </span>
      </span>
      <operate-menu slot="dropdown" />
    </el-dropdown>
    <!-- <operate-menu /> -->
  </div>
</template>
<script>
import path from 'path'
import { mapGetters } from 'vuex'
export default {
  name: 'TabsBar',
  data() {
    return {
      affixtabs: [],
      tabActive: ''
    }
  },
  computed: {
    ...mapGetters([
      'visitedRoutes',
      'collapse',
      'routes'
    ])
  },
  watch: {
    $route: {
      handler(route) {
        this.inittabs()
        this.addtabs()
        let tabActive = ''
        this.visitedRoutes.forEach((item, index) => {
          if (item.path === this.$route.path) {
            tabActive = item.path
          }
        })
        this.tabActive = tabActive
      },
      immediate: true
    }
  },
  methods: {
    async handleTabRemove(tabActive) {
      let view
      this.visitedRoutes.forEach((item, index) => {
        if (tabActive === item.path) {
          view = item
        }
      })
      const { visitedRoutes } = await this.$store.dispatch(
        'tabsBar/delRoute',
        view
      )
      if (this.isActive(view)) {
        this.toLastTag(visitedRoutes, view)
      }
    },
    handleTabClick(tab) {
      const route = this.visitedRoutes.filter((item, index) => {
        if (tab.index === index) return item
      })[0]
      if (this.$route.path !== route.path) {
        this.$router.push({
          path: route.path,
          query: route.query,
          fullPath: route.fullPath
        })
      } else {
        return false
      }
    },
    isActive(route) {
      return route.path === this.$route.path
    },
    isAffix(tag) {
      return tag.meta && tag.meta.affix
    },
    // 过滤不需要关闭的tab
    filterAffixtabs(routes, basePath = '/') {
      let tabs = []
      routes.forEach((route) => {
        if (route.meta && route.meta.affix) {
          const tagPath = path.resolve(basePath, route.path)
          tabs.push({
            fullPath: tagPath,
            path: tagPath,
            name: route.name,
            meta: { ...route.meta }
          })
        }
        if (route.children) {
          const temptabs = this.filterAffixtabs(route.children, route.path)
          if (temptabs.length >= 1) {
            tabs = [...tabs, ...temptabs]
          }
        }
      })
      return tabs
    },
    inittabs() {
      const affixtabs = (this.affixtabs = this.filterAffixtabs(this.routes))
      for (const tag of affixtabs) {
        if (tag.name) {
          this.$store.dispatch('tabsBar/addVisitedRoute', tag)
        }
      }
    },
    addtabs() {
      const { name } = this.$route
      if (name) {
        this.$store.dispatch('tabsBar/addVisitedRoute', this.$route)
      }
      return false
    },
    handleCommand(command) {
      switch (command) {
        case 'refreshRoute':
          this.refreshRoute()
          break
        case 'closeOtherstabs':
          this.closeOtherstabs()
          break
        case 'closeLefttabs':
          this.closeLefttabs()
          break
        case 'closeRighttabs':
          this.closeRighttabs()
          break
        case 'closeAlltabs':
          this.closeAlltabs()
          break
      }
    },
    async refreshRoute() {
      this.$baseEventBus.$emit('reloadrouter-view')
    },
    async closeSelectedTag(view) {
      const { visitedRoutes } = await this.$store.dispatch(
        'tabsBar/delRoute',
        view
      )
      if (this.isActive(view)) {
        this.toLastTag(visitedRoutes, view)
      }
    },
    async closeOtherstabs() {
      const view = await this.toThisTag()
      await this.$store.dispatch('tabsBar/delOthersRoutes', view)
    },
    async closeLefttabs() {
      const view = await this.toThisTag()
      await this.$store.dispatch('tabsBar/delLeftRoutes', view)
    },
    async closeRighttabs() {
      const view = await this.toThisTag()
      await this.$store.dispatch('tabsBar/delRightRoutes', view)
    },
    async closeAlltabs() {
      const view = await this.toThisTag()
      const { visitedRoutes } = await this.$store.dispatch(
        'tabsBar/delAllRoutes'
      )
      if (this.affixtabs.some((tag) => tag.path === view.path)) {
        return
      }
      this.toLastTag(visitedRoutes, view)
    },
    toLastTag(visitedRoutes, view) {
      const latestView = visitedRoutes.slice(-1)[0]
      if (latestView) {
        this.$router.push(latestView)
      } else {
        this.$router.push('/')
      }
    },
    async toThisTag() {
      const view = this.visitedRoutes.filter((item, index) => {
        if (item.path === this.$route.fullPath) {
          return item
        }
      })[0]
      if (this.$route.path !== view.path) this.$router.push(view)
      return view
    }
  }
}
</script>
<style lang="scss" scoped>
.zool-tabs-bar {
  position: relative;
  box-sizing: border-box;
  display: flex;
  align-content: center;
  align-items: center;
  justify-content: space-between;
  min-height: $base-tabs-bar-height;
  padding-right: $base-padding;
  padding-left: $base-padding;
  user-select: none;
  background: $base-color-white;
  border-top: 1px solid #f6f6f6;
  .tabs-content {
    width: calc(100% - 90px);
    height: $base-tag-item-height;
    ::v-deep {
      .el-tabs__header {
        border-bottom: 0;
      }
    }
  }
  .zool-tabs-more {
    position: relative;
  }
  .zool-tabs-more-active,
  .zool-tabs-more:hover {
    &::after {
      position: absolute;
      bottom: -1px;
      left: 0;
      height: 0;
      content: "";
    }
    .zool-tabs-more-icon {
      transform: rotate(90deg);
      .box {
        &::after，
        &::before {
          background: #1890ff;
        }
      }
      .box-t {
        &::before {
          transform: rotate(45deg)
        }
      }
    }
  }
  .zool-tabs-more-icon {
    display: inline-block;
    color: #9a9a9a;
    cursor: pointer;
    transition: transform .3s ease-out;
    .box {
      position: relative;
      display: block;
      width: 14px;
      height: 8px;
      &::before {
        position: absolute;
        top: 0;
        left: 0;
        width: 6px;
        height: 6px;
        content: "";
        background: #9a9a9a
      }
      &::after {
        position: absolute;
        top: 0;
        left: 8px;
        width: 6px;
        height: 6px;
        content: "";
        background: #9a9a9a;
      }
    }
    .box-t {
      &::before {
        transition: transform .3s ease-out .3s;
      }
    }
  }
}
</style>
