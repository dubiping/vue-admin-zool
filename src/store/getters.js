const getters = {
  collapse: state => state.settings.collapse,
  device: state => state.settings.device,
  visitedRoutes: (state) => state.tabsBar.visitedRoutes
}
export default getters
