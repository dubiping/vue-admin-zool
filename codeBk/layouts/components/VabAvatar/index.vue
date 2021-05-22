<template>
  <el-dropdown trigger="click" @command="handleCommand">
    <span class="avatar-dropdown">
      <img class="user-avatar" :src="avatar" alt="" />
    </span>

    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item command="github">
        <div class="dropdown-item">
          <img class="user-avatar" :src="avatar" alt="" />
          <span class="user-name">{{ username }}</span>
        </div>
      </el-dropdown-item>
      <el-dropdown-item command="logout" divided>
        <div class="dropdown-item">
          <svg data-icon="log-out" width="16" height="16" viewBox="0 0 16 16">
            <desc>log-out</desc>
            <path d="M7 14H2V2h5c.55 0 1-.45 1-1s-.45-1-1-1H1C.45 0 0 .45 0 1v14c0 .55.45 1 1 1h6c.55 0 1-.45 1-1s-.45-1-1-1zm8.71-6.71l-3-3a1.003 1.003 0 00-1.42 1.42L12.59 7H6c-.55 0-1 .45-1 1s.45 1 1 1h6.59l-1.29 1.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71l3-3c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71z" fill-rule="evenodd"></path>
          </svg>
          <span>退出登录</span>
        </div>
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
  import { mapGetters } from 'vuex'
  import { recordRoute } from '@/config'

  export default {
    name: 'VabAvatar',
    computed: {
      ...mapGetters({
        avatar: 'user/avatar',
        username: 'user/username',
      }),
    },
    methods: {
      handleCommand(command) {
        switch (command) {
          case 'logout':
            this.logout()
            break
          case 'personalCenter':
            this.personalCenter()
            break
          case 'github':
            window.open('https://github.com/chuzhixin/vue-admin-beautiful')
            break
          case 'gitee':
            window.open('https://gitee.com/chu1204505056/vue-admin-beautiful')
            break
          case 'pro':
            window.open(
              'https://chu1204505056.gitee.io/admin-pro/?hmsr=homeAd&hmpl=&hmcu=&hmkw=&hmci='
            )
            break
          case 'plus':
            window.open(
              'https://chu1204505056.gitee.io/admin-plus/?hmsr=homeAd&hmpl=&hmcu=&hmkw=&hmci='
            )
        }
      },
      personalCenter() {
        this.$router.push('/personalCenter/personalCenter')
      },
      logout() {
        this.$baseConfirm(
          '您确定要退出' + this.$baseTitle + '吗?',
          null,
          async () => {
            await this.$store.dispatch('user/logout')
            if (recordRoute) {
              const fullPath = this.$route.fullPath
              this.$router.push(`/login?redirect=${fullPath}`)
            } else {
              this.$router.push('/login')
            }
          }
        )
      },
    },
  }
</script>
<style lang="scss" scoped>
  .avatar-dropdown {
    display: flex;
    align-content: center;
    align-items: center;
    justify-content: center;
    justify-items: center;
    width: 36px;
    height: 36px;
    padding: 0;
    border-radius: 50%;

    &:active,
    &:hover {
      background: #346cb5;
    }
  }
  .dropdown-item {
    display: flex;
    align-items: center;
  }
  .user-avatar {
    width: 30px;
    height: 30px;
    cursor: pointer;
    border-radius: 50%;
  }

  .user-name {
    position: relative;
    margin-left: 5px;
    margin-left: 5px;
    cursor: pointer;
  }
</style>
