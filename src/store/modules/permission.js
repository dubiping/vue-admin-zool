import Vue from 'vue'
import { asyncRoutes, constantRoutes } from '@/router'
import { getRouterList } from '@/api/router'
import { filterAsyncRoutes } from '@/utils/handleRoutes'
import { deepClone, translateTreeToArr } from '@/utils'

const state = {
  routes: [],
  permissions: []
}

const mutations = {
  setRoutes: (state, routes) => {
    state.routes = constantRoutes.concat(routes)
  },
  setPermission: (state, permissions) => {
    state.permissions = permissions
  }
}

const actions = {
  async generateRoutes({ commit }) {
    let { data } = await getRouterList()

    // 过滤禁用数据 0 禁用 1 开启
    data = (data || []).filter(v => v.status === '0')
    // 数据排序
    data.sort((a, b) => (a.orderNum || 0) - (b.orderNum || 0))

    if (!data.length) {
      Vue.prototype.$baseMessage('用户暂无权限访问', 'error')
    }

    const accessedRoutes = data.length ? filterAsyncRoutes(asyncRoutes, data) : []
    commit('setRoutes', accessedRoutes)
    commit('setPermission', data)
    return accessedRoutes
  },
  setAllRoutes({ commit }) {
    let data = translateTreeToArr(deepClone(asyncRoutes))
    data = data.filter(v => !v.hidden)
    commit('setRoutes', asyncRoutes)
    commit('setPermission', data)
    return asyncRoutes
  },
  clearPermission({ commit }) {
    commit('setRoutes', [])
    commit('setPermission', [])
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
