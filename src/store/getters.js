const getters = {
  callapse: state => state.settings.callapse,
  device: state => state.settings.device,
  visitedRoutes: (state) => state.tabsBar.visitedRoutes
}
export default getters
