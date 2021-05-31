import router from '@/router'
import store from '@/store'
import NProgress from 'nprogress'
import getPageTitle from '@/utils/pageTitle'
import { loginInterception, routesWhiteList } from '@/config'

NProgress.configure({
  easing: 'ease',
  speed: 500,
  trickleSpeed: 200,
  showSpinner: false
})
router.beforeEach(async(to, from, next) => {
  NProgress.start()

  document.title = getPageTitle(to.meta.title)

  let hasTokens = store.getters.token

  if (!loginInterception) hasTokens = true

  // 在免费登录白名单中，直接进入
  if (!hasTokens && routesWhiteList.indexOf(to.path) !== -1) {
    next()
    return false
  }
  // 其他没有访问权限的页面将重定向到登录页面
  if (!hasTokens) {
    next(`/login?redirect=${to.fullPath}`)
    NProgress.done()
    return false
  }

  if (to.path === '/login') {
    next({ path: '/' })
    NProgress.done()
    return false
  }
  const hasPermissions =
    store.getters.pagePermissions &&
    store.getters.pagePermissions.length > 0

  if (hasPermissions) {
    return next()
  }

  try {
    let accessRoutes
    if (!loginInterception) {
      accessRoutes = await store.dispatch('permission/setAllRoutes')
    } else {
      accessRoutes = await store.dispatch('permission/generateRoutes')
    }
    console.log(accessRoutes)
    // 用户无权限时登出，防止接口重复调用
    if (!accessRoutes.length) {
      await store.dispatch('user/logout')
      next({ path: '/' })
      return false
    }
    router.addRoutes(accessRoutes)
    // 获取用户信息
    await store.dispatch('user/getUserInfo')
    // 设置replace:true，这样导航就不会留下历史记录
    next({ ...to, replace: true })
  } catch (e) {
    await store.dispatch('user/resetToken')
    next(`/login?redirect=${to.fullPath}`)
    NProgress.done()
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
