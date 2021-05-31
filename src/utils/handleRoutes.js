export function findRoute(routes, tmp, key) {
  return routes.find(v => v.path === (tmp[key] || tmp.meta?.[key] || ''))
}

/**
 * 过滤路由
 * @param routes asyncRoutes
 * @param roleRoutes 后端返回的权限表
 * 后台数据结构
  [
    {
      title: '',
      path: '', // 对应前端路由name
      orderNum: '',
      status: '1'
    }
  ]
 */
export function filterAsyncRoutes(routes, roleRoutes) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    let roleItem = null
    // 1、后端权限表里的name 和 路由表里的name相等
    // 2、路由表在左侧菜单里没有显示的页面，则根据父页面是否在权限表判断
    // 3、404页面
    if ((roleItem = findRoute(roleRoutes, tmp, 'name')) ||
      tmp.path === '*' ||
      (tmp.hidden && (roleItem = findRoute(roleRoutes, tmp, 'parentName')))) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roleRoutes)
      }
      // 重新设置页面title
      roleItem && ((tmp.meta || (tmp.meta = {})).title = roleItem.title)
      res.push(tmp)
    }
  })

  return res
}
