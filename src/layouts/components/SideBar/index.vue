<template>
  <el-scrollbar class="side-bar-container">
    <el-menu
      :background-color="variables.menuBackground"
      :text-color="variables.menuColor"
      :active-text-color="variables.menuColorActive"
      :default-active="activeMenu"
      :collapse="collapse"
      :collapse-transition="false"
      :default-openeds="defaultOpens"
      :unique-opened="uniqueOpened"
      mode="vertical"
    />
  </el-scrollbar>
</template>
<script>
import variables from '@/styles/variables.scss'
import { mapGetters } from 'vuex'
import { defaultOpeneds, uniqueOpened } from '@/config'
export default {
  name: 'SideBar',
  data() {
    return {
      uniqueOpened
    }
  },
  computed: {
    ...mapGetters([
      'permission_routes',
      'collapse'
    ]),
    defaultOpens() {
      if (this.collapse) {
      }
      return defaultOpeneds
    },
    activeMenu() {
      const route = this.$route
      const { meta, path } = route
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    },
    variables() {
      return variables
    }
  }
}
</script>
<style lang="scss" scoped>

</style>
