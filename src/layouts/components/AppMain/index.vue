<template>
  <section v-if="routerView" class="zool-app-main">
    <transition mode="out-in" name="fade-transform">
      <keep-alive :include="cachedRoutes" :max="keepAliveMaxNum">
        <router-view :key="key" class="app-main-height" />
      </keep-alive>
    </transition>
  </section>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { keepAliveMaxNum } from '@/config'

export default {
  name: 'AppMain',
  data() {
    return {
      keepAliveMaxNum,
      routerView: true
    }
  },
  computed: {
    ...mapGetters(['visitedRoutes', 'device']),
    cachedRoutes() {
      const cachedRoutesArr = []
      this.visitedRoutes.forEach((item) => {
        if (!item.meta.noKeepAlive) {
          cachedRoutesArr.push(item.name)
        }
      })
      return cachedRoutesArr
    },
    key() {
      return this.$route.path
    }
  },
  watch: {
    $route: {
      handler(route) {
        if ('mobile' === this.device) this.foldSideBar()
      },
      immediate: true
    }
  },
  created() {
    // 重载所有路由
    this.$baseEventBus.$on('reload-router-view', () => {
      this.routerView = false
      this.$nextTick(() => {
        this.routerView = true
      })
    })
  },
  mounted() {},
  methods: {
    ...mapActions({
      foldSideBar: 'settings/foldSideBar'
    })
  }
}
</script>

<style lang="scss" scoped>
.zool-app-main {
  position: relative;
  width: 100%;
  overflow: hidden;
  .vab-keel {
    margin: $base-padding;
  }
  .app-main-height {
    min-height: $base-app-main-height;
  }

  .footer-copyright {
    min-height: 55px;
    line-height: 55px;
    color: rgba(0, 0, 0, 0.45);
    text-align: center;
    border-top: 1px dashed $base-border-color;
  }
}
</style>
