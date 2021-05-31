const getters = {
  header: state => state.settings.header,
  collapse: state => state.settings.collapse,
  device: state => state.settings.device,
  visitedRoutes: state => state.tabsBar.visitedRoutes,
  token: state => state.user.token,
  routes: state => state.permission.routes,
  pagePermissions: state => state.permission.permissions
}
export default getters
