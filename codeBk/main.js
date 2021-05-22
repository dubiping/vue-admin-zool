import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import './plugins'
import '@/layouts/export'

if (process.env.NODE_ENV === 'production') {
  const { mockXHR } = require('@/utils/mock')
  mockXHR()
}

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: (h) => h(App),
})
