<script setup lang="ts">
import CustomImage from '@/components/CustomImage.vue'
import CreatePopup from '@/components/Video/CreatePopup.vue'
import { getEnhancedUserHistory, type EnhancedUser } from '@/service/userEnhanced'
import utils from '@/utils'
import jumpTo from '@/utils/jumpTo'
import { Popup, showToast } from 'vant'
import { onMounted, ref, watch } from 'vue'
import CreateRoom from '@/components/Live/CreateRoom.vue'

interface UserItem {
  id: string | number
  nickname?: string
  avatar?: string
  isFollowing: boolean
  [key: string]: any
}

const showMenu = ref(false)
const showCreatePopup = ref(false)
const emit = defineEmits(['openLoginModal'])
const toggleSideMenu = () => {
  showMenu.value = !showMenu.value
}

const handleViewAllUsers = () => {
  jumpTo('/history?tab=users')
}

const recentUsers = ref<EnhancedUser[]>([])
const loadingRecentUsers = ref(false)
const showCreateRoomPopup = ref<boolean>(false)

const loadRecentUsers = async () => {
  if (loadingRecentUsers.value) return

  try {
    loadingRecentUsers.value = true
    const result = await getEnhancedUserHistory({
      page: 1,
      pageSize: 3,
    })

    recentUsers.value = result.list
  } catch (error) {
    console.error('Failed to load recent users:', error)
  } finally {
    loadingRecentUsers.value = false
  }
}
const handleAddVideo = (e: Event) => {
  e.stopPropagation()
  e.preventDefault()
  showCreatePopup.value = true
}

const goToPage = (path: string) => {
  utils.isLoggedIn() === 'not-logged-in' ? emit('openLoginModal') : jumpTo(path)
}

const goToUserPage = (user: EnhancedUser) => {
  if (user.isAnonymousUser) {
    showToast('该用户是匿名用户')
    return
  }
  jumpTo(`/user/${user.userId}`)
}

watch(showMenu, newValue => {
  if (newValue === true) {
    loadRecentUsers()
  }
})

onMounted(() => {
  loadRecentUsers()
})

defineExpose({
  toggleSideMenu,
})
</script>
<template>
  <Popup
    class="side-menu safe-area-inset-top safe-area-inset-bottom"
    v-model:show="showMenu"
    position="left"
    :style="{ width: '70%', height: '100%' }"
  >
    <ul>
      <li @click="goToPage('/message')">
        <span class="material-icons-outlined">notifications</span>
        我的消息
      </li>
      <li @click="goToPage('/user')">
        <span class="material-icons-outlined">manage_accounts</span>
        个人中心
        <span v-if="utils.isLoggedIn() === 'not-logged-in'" class="btn">去登录</span>
        <router-link
          to="/user"
          v-if="utils.isLoggedIn() !== 'not-logged-in'"
          class="full-link"
        ></router-link>
        <span
          v-if="utils.isLoggedIn() !== 'not-logged-in'"
          class="material-icons-outlined btn-add-video"
          @click="handleAddVideo"
          >add_circle_outline</span
        >
      </li>
      <li @click="utils.showDevelopingToast">
        <span class="material-icons-outlined">account_balance_wallet</span>
        我的钱包
      </li>
      <li @click="() => jumpTo('/history')">
        <span class="material-icons-outlined">history</span>
        浏览记录
      </li>
      <li @click="utils.showDevelopingToast">
        <span class="material-icons-outlined">celebration</span>
        活动中心
      </li>
    </ul>

    <div class="recent-users-section">
      <div class="section-header" @click="handleViewAllUsers">
        <span class="title">最近访问的人</span>
        <span class="view-all">全部 ›</span>
      </div>
      <div class="users-grid">
        <div
          v-for="user in recentUsers"
          :key="user.userId"
          class="user-item"
          @click="goToUserPage(user)"
        >
          <div class="avatar-wrapper">
            <CustomImage :src="user.avatar || '/default-avatar.png'" alt="用户头像" height="55px" />
          </div>
          <div class="nickname">{{ user.nickname || `${user.userId}号` }}</div>
        </div>
        <div v-if="recentUsers.length === 0 && !loadingRecentUsers" class="empty-state">
          暂无访问记录
        </div>
        <div v-if="loadingRecentUsers" class="loading-state">加载中...</div>
      </div>
    </div>

    <ul>
      <li @click="utils.showDevelopingToast">
        <span class="material-icons-outlined">headset_mic</span>
        联系客服
      </li>
    </ul>
  </Popup>
  <CreatePopup v-model:visible="showCreatePopup" @createLive="showCreateRoomPopup = true"/>
  <Popup class="loginModel" v-model:show="showCreateRoomPopup" v-if="showCreateRoomPopup">
      <CreateRoom  @closeLoginModal="showCreateRoomPopup = false" />
  </Popup>
</template>

<style scoped lang="less">
.side-menu {
  background: #f2f2f2;
  padding: 10px;

  &.safe-area-inset-top {
    padding-top: constant(safe-area-inset-top);
    padding-top: env(safe-area-inset-top);
  }

  ul {
    border-radius: 8px;
    background: #fff;
    margin-bottom: 12px;
    padding: 0 15px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

    li {
      position: relative;
      border-bottom: solid 1px #f2f2f2;
      font-size: 14px;
      display: flex;
      align-items: center;
      padding: 12px 0;
      cursor: pointer;

      &:last-child {
        border: none;
      }

      span {
        margin-right: 10px;
        font-weight: 100;
        font-size: 20px;
      }
      .btn {
        position: absolute;
        right: 0px;
        display: inline-block;
        font-size: 14px;
        font-weight: bold;
        color: #999;
        padding: 0px 5px;
        border-radius: 5px;
        background: #eee;
      }

      .btn-add-video {
        position: absolute;
        right: 0px;
        display: inline-block;
        font-size: 24px;
        font-weight: bold;
        padding: 0px 5px;
        border-radius: 5px;
        color: var(--van-gray-4);
        z-index: 1;
        margin-right: 0;
      }

      .full-link {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
      }
    }
  }

  .recent-users-section {
    background: #fff;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      cursor: pointer;

      .title {
        font-size: 12px;
        font-weight: 500;
        color: #323233;
      }

      .view-all {
        font-size: 13px;
        color: #666;
        padding: 2px 5px;
        border-radius: 4px;

        &:active {
          background-color: #f5f5f5;
        }
      }
    }

    .users-grid {
      display: flex;

      .user-item {
        width: 32%;
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;

        .avatar-wrapper {
          width: 55px;
          height: 55px;
          border-radius: 50%;
          overflow: hidden;
          margin-bottom: 8px;
          background-color: #f5f5f5;
          border: 1px solid #eee;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .nickname {
          font-size: 12px;
          color: #333;
          text-align: center;
          max-width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      .empty-state,
      .loading-state {
        width: 100%;
        text-align: center;
        color: #999;
        font-size: 13px;
        padding: 15px 0;
      }
    }
  }
}
</style>
