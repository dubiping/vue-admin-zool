const data = [
  {
    id: '1',
    parentId: '',
    title: '组件',
    path: 'Vab',
    orderNum: 0,
    status: '1'
  },
  {
    id: '2',
    parentId: '1',
    title: '权限',
    path: 'Permission',
    orderNum: 0,
    status: '1'
  },
  {
    id: '3',
    parentId: '2',
    title: '菜单权限',
    path: 'PagePermission',
    orderNum: 0,
    status: '1'
  }
]
module.exports = [
  {
    url: '/menu/navigate',
    type: 'post',
    response() {
      return { code: 200, msg: 'success', data: data }
    }
  }
]