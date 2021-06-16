<template>
  <div class="zool-tabs-bar">
    <span>
      <svg-icon :icon-class="!collapse ? 'menu-fold-line': 'menu-unfold-line'" />
    </span>
    <el-tabs
      v-model="tabActive"
      type="card"
      class="zool-tabs-content zool-tabs-content-card"
      @tab-click="handleTabClick"
      @tab-remove="handleTabRemove"
    >
      <el-tab-pane
        v-for="item in visitedRoutes"
        :key="item.path"
        :label="item.meta.title"
        :name="item.path"
        :closable="!isAffix(item)"
      >
        <span
          slot="label"
          class="tab-label"
          @contextmenu.prevent="openMenu(item.path,$event)"
        >
          <i
            v-if="isElIcon(item.meta.icon)"
            :class="[item.meta.icon, 'sub-el-icon']"
          />
          <svg-icon
            v-else-if="item.meta.icon"
            :icon-class="item.meta.icon"
            :class-name="item.meta.icon.includes('ri') ? 'ri-icon' : ''"
          />
          {{ item.meta.title }}
        </span>
      </el-tab-pane>
    </el-tabs>
    <el-dropdown @command="handleCommand">
      <span class="zool-tabs-more">
        <span class="zool-tabs-more-icon">
          <i class="box box-t" />
          <i class="box box-b" />
        </span>
      </span>
      <el-dropdown-menu slot="dropdown" class="tabs-more">
        <el-dropdown-item command="closeOtherstabs">
          <svg-icon icon-class="ri-close-line" class-name="ri-icon" />
          关闭其他
        </el-dropdown-item>
        <el-dropdown-item command="closeLefttabs">
          <svg-icon icon-class="ri-arrow-left-line" class-name="ri-icon" />
          关闭左侧
        </el-dropdown-item>
        <el-dropdown-item command="closeRighttabs">
          <svg-icon icon-class="ri-arrow-right-line" class-name="ri-icon" />
          关闭右侧
        </el-dropdown-item>
        <el-dropdown-item command="closeAlltabs">
          <svg-icon icon-class="ri-close-line" class-name="ri-icon" />
          关闭全部
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <ul v-show="visible" :style="{left:left+'px',top:top+'px'}" class="contextmenu el-dropdown-menu el-dropdown-menu--small">
      <li class="el-dropdown-menu__item" @click="closeOtherstabs('closeOtherstabs')">
        <svg-icon icon-class="ri-close-line" class-name="ri-icon" />
        关闭其他
      </li>
      <li class="el-dropdown-menu__item" @click="closeLefttabs('closeLefttabs')">
        <svg-icon icon-class="ri-arrow-left-line" class-name="ri-icon" />
        关闭左侧
      </li>
      <li class="el-dropdown-menu__item" @click="closeRighttabs('closeRighttabs')">
        <svg-icon icon-class="ri-arrow-right-line" class-name="ri-icon" />
        关闭右侧
      </li>
      <li class="el-dropdown-menu__item" @click="closeAlltabs('closeAlltabs')">
        <svg-icon icon-class="ri-close-line" class-name="ri-icon" />
        关闭全部
      </li>
    </ul>
  </div>
</template>
<script>
import path from 'path'
import { mapGetters } from 'vuex'
export default {
  name: 'TabsBar',
  data() {
    return {
      visible: false,
      top: 0,
      left: 0,
      affixtabs: [],
      tabActive: '',
      currentPath: ''
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
        this.currentPath = tabActive
      },
      immediate: true
    },
    visible(value) {
      if (value) {
        document.body.addEventListener('click', this.closeMenu)
      } else {
        document.body.removeEventListener('click', this.closeMenu)
      }
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
        if (tab.index === (index + '')) return item
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
        if (item.path === this.currentPath) {
          return item
        }
      })[0]
      if (this.$route.path !== view.path) this.$router.push(view)
      return view
    },
    openMenu(tag, e) {
      const menuMinWidth = 105
      const offsetLeft = this.$el.getBoundingClientRect().left // container margin left
      const offsetWidth = this.$el.offsetWidth // container width
      const maxLeft = offsetWidth - menuMinWidth // left boundary
      const left = e.clientX - offsetLeft + 15 // 15: margin right

      if (left > maxLeft) {
        this.left = maxLeft
      } else {
        this.left = left
      }

      this.top = e.clientY
      this.visible = true
      this.currentPath = tag
    },
    closeMenu() {
      this.visible = false
    },
    handleScroll() {
      this.closeMenu()
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
  .zool-tabs-content {
    width: calc(100% - 96px);
    height: $base-tag-item-height;
    ::v-deep {
      .el-tabs__header {
        border-bottom: 0;
      }
    }
  }
  // tab 卡片式
  .zool-tabs-content-card {
    height: $base-tag-item-height;
    ::v-deep {
      .el-tabs__nav-next,
      .el-tabs__nav-prev {
        height: $base-tag-item-height;
        line-height: $base-tag-item-height;
      }
      .el-tabs__header {
        border-bottom: 0;
        .el-tabs__nav {
          border: 0;
        }
        .el-tabs__item {
          box-sizing: border-box;
          height: $base-tag-item-height;
          margin-right: 5px;
          line-height: $base-tag-item-height;
          border: 1px solid $base-border-color;
          border-radius: 2.5px;
          transition: padding .3s cubic-bezier(.645, .045, .355, 1) !important;
          &.is-active {
            color: $base-color-default;
            background: mix($base-color-white, $base-color-default, 90%);
            border: 1px solid $base-color-default;
            outline: none;
          }
          &:hover {
            border: 1px solid $base-color-default;
          }
        }
      }
    }
  }
  // tab 灵动
  .zool-tabs-content-smart {
    height: $base-tag-item-height;
    ::v-deep {
      .el-tabs__nav-next,
      .el-tabs__nav-prev {
        height: $base-tag-item-height;
        line-height: $base-tag-item-height;
      }
      .el-tabs__header {
        border-bottom: 0;
        .el-tabs__nav {
          border: 0;
        }
        .el-tabs__item {
          height: $base-tag-item-height;
          margin-right: 5px;
          line-height: $base-tag-item-height;
          border: 0;
          outline: none;
          transition: padding .3s cubic-bezier(.645, .045, .355, 1) !important;
          &.is-active {
            background: mix($base-color-white, $base-color-default, 90%);
            outline: none;
            &::after {
              width: 100%;
              transition: $base-transition-color;
            }
          }
          &::after {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 0;
            height: 2px;
            content: "";
            background-color: $base-color-default;
            transition: $base-transition-color;
          }
          &:hover {
            background: mix($base-color-white, $base-color-default, 90%);
            &::after {
              width: 100%;
              transition: $base-transition-color;
            }
          }
        }
      }
    }
  }
  // tab 圆滑
  .zool-tabs-content-smooth {
    height: $base-tag-item-height + 4;
    ::v-deep {
      .el-tabs__nav-next,
      .el-tabs__nav-prev {
        height: $base-tag-item-height + 4;
        line-height: $base-tag-item-height + 4;
      }
      .el-tabs__header {
        border-bottom: 0;
        .el-tabs__nav {
          border: 0;
        }
        .el-tabs__item {
          height: $base-tag-item-height + 4;
          padding: 0 30px 0 30px;
          margin-top: 6px;
          margin-right: -18px;
          line-height: $base-tag-item-height + 4;
          text-align: center;
          border: 0;
          outline: none;
          transition: padding .3s cubic-bezier(.645, .045, .355, 1) !important;
          &.is-active {
            outline: none;
            &, &:hover {
              color: $base-color-default;
              background: mix($base-color-white, $base-color-default, 90%);
            }
          }
          &.is-active, &.is-active:hover, &:hover {
            padding: 0 30px 0 30px;
            mask: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANoAAAAkBAMAAAAdqzmBAAAAMFBMVEVHcEwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlTPQ5AAAAD3RSTlMAr3DvEM8wgCBA379gj5//tJBPAAAAnUlEQVRIx2NgAAM27fj/tAO/xBsYkIHyf9qCT8iWMf6nNQhAsk2f5rYheY7Dnua2/U+A28ZEe8v+F9Ax2v7/F4DbxkUH2wzgtvHTwbYPo7aN2jZq26hto7aN2jZq25Cy7Qvctnw62PYNbls9HWz7S8/G6//PsI6H4396gAUQy1je08W2jxDbpv6nD4gB2uWp+J9eYPsEhv/0BPS1DQBvoBLVZ3BppgAAAABJRU5ErkJggg==);
            mask-size: 100% 100%
          }
          &:hover {
            color: $base-color-gray;
            background: #dee1e6;
          }
        }
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
