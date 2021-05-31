import Vue from 'vue'

// import Cookies from 'js-cookie'

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import './plugins'
import '@/layouts/export'

// import './utils/error-log' // error log

// import * as filters from './filters' // global filters

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
if (process.env.NODE_ENV === 'production') {
  const { mockXHR } = require('../mock')
  mockXHR()
}

// register global utility filters
// Object.keys(filters).forEach(key => {
//   Vue.filter(key, filters[key])
// })
import AudioRecorder from 'vue-audio-recorder'

Vue.use(AudioRecorder)

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
