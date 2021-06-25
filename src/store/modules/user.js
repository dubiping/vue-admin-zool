import Vue from 'vue'
import { getUserInfo, login, logout } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'
import { title } from '@/config'

const state = {
  token: getToken(),
  userInfo: {
    userName: '',
    avatar: ''
  }
}

const mutations = {
  setToken: (state, token) => {
    state.token = token
    setToken(token)
  },
  setUserInfo: (state, userInfo) => {
    state.userInfo = userInfo
  }
}

const actions = {
  async login({ commit }, userInfo) {
    const { data } = await login(userInfo)
    if (!data.token) {
      return Vue.prototype.$baseMessage(
        `登录接口异常，未正确返回token...`,
        'error'
      )
    }
    commit('setToken', data.token)
    const hour = new Date().getHours()
    const thisTime = hour < 8
      ? '早上好' : hour <= 11
        ? '上午好' : hour <= 13
          ? '中午好' : hour < 18
            ? '下午好' : '晚上好'
    Vue.prototype.$baseNotify(`欢迎登录${title}`, `${thisTime}！`)
  },
  async getUserInfo({ commit, state }) {
    const { data } = await getUserInfo(state.token)
    if (!data) {
      Vue.prototype.$baseMessage('验证失败，请重新登录...', 'error')
      return false
    }
    if (!data.userName) {
      Vue.prototype.$baseMessage('用户信息接口异常', 'error')
      return false
    }
    commit('setUserInfo', data)
  },
  async logout({ dispatch, state }) {
    await logout(state.token)
    await dispatch('resetToken')
    await resetRouter()

    await dispatch('permission/clearPermission', null, { root: true })
  },
  resetToken({ commit }) {
    commit('setToken', '')
    removeToken()
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
