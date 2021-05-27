<template>
  <div class="zool-tabs-bar">
    <span>
      <svg-icon :icon-class="collapse ? 'menu-fold-line': 'zip'" />
    </span>
    <el-tabs
      v-model="tabActive"
      type="card"
      class="tabs-content"
      @tab-click="handleTabClick"
      @tab-remove="handleTabRemove"
    >
      <el-tab-pane
        v-for="item in visitedRoutes"
        :key="item.path"
        :label="item.meta.title"
        :name="item.path"
        :closable="!isAffix(item)"
      ></el-tab-pane>
    </el-tabs>
    <el-dropdown>
      <span class="zool-tabs-more">
        <span class="zool-tabs-more-icon">
          <i class="box box-t" />
          <i class="box box-b" />
        </span>
      </span>
      <operate-menu />
    </el-dropdown>
    <operate-menu />
  </div>
</template>
<script>
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
      'collapse'
    ])
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
