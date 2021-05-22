import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { isWhiteApiUrl } from '@/api'
import { getToken, setToken } from '@/utils/auth'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    const reg = new RegExp(`(${process.env.VUE_APP_BASE_API})`)
    const val = config.url.replace(reg, '')
    if (isWhiteApiUrl(val) && process.env.NODE_ENV === 'development') {
      config.baseURL = process.env.VUE_APP_BASE_API + '/xapi'
    } else if (!isWhiteApiUrl(val) && process.env.NODE_ENV === 'production') {
      console.log(val, '使用mock')
      config.baseURL = '/prod-api'
    }
    // do something before request is sent
    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['FH-Authorization'] = getToken()
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data
    if (response.headers['fh-authorization']) {
      setToken(response.headers['fh-authorization'])
    }

    // if the custom code is not 200, it is judged as an error.
    const url = response.config.url
    if (url.indexOf('/selectScanResult') !== -1 || url.indexOf('/selectQrCode') !== -1) {
      return res
    }
    if (res.code !== 200) {
      Message({
        message: res.msg || res.message || 'Error',
        type: 'error',
        duration: 5 * 1000,
        showClose: true
      })

      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (res.code === 20003) {
        // to re-login
        MessageBox.confirm('您当前的登录状态失效，请重新登录', '登出提醒', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(new Error(res.msg || res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.log(error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000,
      showClose: true
    })
    return Promise.reject(error)
  }
)

export default service
