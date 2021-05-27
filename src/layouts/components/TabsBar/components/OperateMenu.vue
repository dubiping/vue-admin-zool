<template>
  <el-dropdown-menu slot="dropdown" class="tabs-more">
      <el-dropdown-item command="closeOtherstabs">
        关闭其他
      </el-dropdown-item>
      <el-dropdown-item command="closeLefttabs">
        关闭左侧
      </el-dropdown-item>
      <el-dropdown-item command="closeRighttabs">
        关闭右侧
      </el-dropdown-item>
      <el-dropdown-item command="closeAlltabs">
        关闭全部
      </el-dropdown-item>
    </el-dropdown-menu>
</template>
<script>
export default {
  name: 'OperateMenu'
}
</script>