import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/**
 * hidden: true       如果为true，侧边栏不显示
 * alwaysShow: true   如果设置为true，侧边栏会一直显示根菜单
 *                    如果设置为false，超过1个children才显示
 * meta : {
  icon:
  title:
  badge: ''             标识
  target: '_blank'      设置_blank，打开新窗口
 }
 */

/* Layout */
import Layout from '@/layouts'
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/401',
    name: '401',
    component: () => import('@/views/401'),
    hidden: true
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/404'),
    hidden: true
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: '首页', icon: 'ri-home-2-line', affix: true }
      }
    ]
  },
  {
    path: '/vab',
    name: 'Vab',
    component: Layout,
    alwaysShow: true,
    meta: { title: '组件', icon: 'box-open' },
    children: [
      {
        path: 'permission',
        name: 'Permission',
        component: () => import('@/views/vab/permissions'),
        redirect: '/vab/permission/page',
        meta: { title: '权限', icon: 'lock' },
        children: [
          {
            path: 'page',
            component: () => import('@/views/vab/permissions/page'),
            name: 'PagePermission',
            meta: { title: '菜单权限' }
          }
        ]
      }
    ]
  },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
