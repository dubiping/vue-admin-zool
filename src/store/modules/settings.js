import { header } from '@/config'

const theme =
  JSON.parse(localStorage.getItem('vue-admin-zool-theme')) || ''

const state = () => ({
  device: 'desktop',
  collapse: false,
  header: theme.header || header
})
const mutations = {
  changeHeader: (state, header) => {
    if (header) state.header = header
  },
  changeCollapse: (state) => {
    state.collapse = !state.collapse
  },
  foldSideBar: (state) => {
    state.collapse = true
  },
  openSideBar: (state) => {
    state.collapse = false
  },
  toggleDevice: (state, device) => {
    state.device = device
  }
}
const actions = {
  changeHeader({ commit }, header) {
    commit('changeHeader', header)
  },
  changeCollapse({ commit }) {
    commit('changeCollapse')
  },
  foldSideBar({ commit }) {
    commit('foldSideBar')
  },
  openSideBar({ commit }) {
    commit('openSideBar')
  },
  toggleDevice({ commit }, device) {
    commit('toggleDevice', device)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
