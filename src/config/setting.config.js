module.exports = {
  title: 'Vue Admin Zool',

  // token key
  tokenKey: 'zool-token',
  // token存储位置localStorage sessionStorage
  storage: 'localStorage',

  // 路由
  // 缓存路由的最大数量
  keepAliveMaxNum: 99,
  // 路由模式，可选值为 history 或 hash
  routerMode: 'hash',
  // 不经过token校验的路由
  routesWhiteList: ['/login', '/register', '/404', '/401'],
  // 是否开启登录拦截
  loginInterception: false,

  // 加载时显示文字
  loadingText: '正在加载中...',
  // 消息框消失时间
  messageDuration: 3000,

  // sideBar
  // vertical布局时是否只保持一个子菜单的展开
  uniqueOpened: true,
  // vertical布局时默认展开的菜单path
  defaultOpeneds: []
}
