const install = (Vue, opts = {}) => {
  /* 全局事件总线 */
  Vue.prototype.$baseEventBus = new Vue()
}
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export default install
