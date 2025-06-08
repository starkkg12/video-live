<script setup lang="ts">
import StateManager from '@/components/StateManager.vue'
import constants from '@/constants'
import service from '@/service'
import { FeedAction, setFeedInteraction } from '@/service/api/feed'
import utils from '@/utils'
import jumpToLogin from '@/utils/jumpToLogin'
import { Icon, showFailToast, showToast, Sticky, Tab, Tabs } from 'vant'
import { onMounted, ref } from 'vue'

import { useCurrentUser } from '@/composables/useCurrentUser'
import type { EnhancedUser } from '@/service/userEnhanced'
import FavoritesComponent from './components/_Favorites.vue'
import LikesComponent from './components/_Likes.vue'
import LivesComponent from './components/_Lives.vue'
import UserHeader from './components/_UserHeader.vue'
import UserStats from './components/_UserStats.vue'
import WorksComponent from './components/_Works.vue'

const props = defineProps({
  userId: {
    type: String,
    default: '',
  },
})

const componentMap = {
  WorksComponent,
  LivesComponent,
  LikesComponent,
  FavoritesComponent,
}

const isLoggedIn = ref(false)
const isLoading = ref(false)
const isError = ref(false)
const userInfo = ref<EnhancedUser>()
const profile = ref<EnhancedUser>()

const { isCurrentUser, myId, userId: resolvedUserId } = useCurrentUser(props.userId)

const active = ref(0)
const worksSortBy = ref('latest')
const showSortMenu = ref(false)

const sortOptions = [
  { text: '最新', value: 'latest' },
  { text: '最热', value: 'hottest' },
]

const tab3 = [
  {
    action: 'works',
    label: '作品',
    component: 'WorksComponent',
    hasDropdown: true,
  },
  {
    action: 'lives',
    label: '直播动态',
    component: 'LivesComponent',
  },
  {
    action: 'likes',
    label: '喜欢',
    component: 'LikesComponent',
  },
  {
    action: 'favorites',
    label: '收藏',
    component: 'FavoritesComponent',
  },
]

const onBack = () => {
  typeof window !== 'undefined' && window.history.back()
}

const onTabChange = (tabIndex: number) => {
  active.value = tabIndex
}

const copyText = async () => {
  try {
    await navigator.clipboard.writeText(userInfo.value?.userId ?? '')
    showToast('复制成功')
  } catch (err) {
    console.error(err)
    showToast('复制失败')
  }
}

const openDropdown = (event: MouseEvent) => {
  event.stopPropagation()
  event.preventDefault()

  if (active.value !== 0) {
    active.value = 0
    return
  }

  showSortMenu.value = !showSortMenu.value
}

const selectOption = (value: string) => {
  console.log('Selecting option', value)
  worksSortBy.value = value
  showSortMenu.value = false
}

async function initData() {
  const targetUserId = resolvedUserId || myId
  if (!targetUserId) {
    jumpToLogin()
    return
  }

  isLoading.value = true
  isError.value = false

  try {
    const enhancedProfile = await service.userEnhanced.getEnhancedUserProfile(targetUserId)
    if (!enhancedProfile) {
      throw new Error('获取用户信息失败')
    }

    profile.value = enhancedProfile
    userInfo.value = enhancedProfile
    if (profile.value && isCurrentUser) {
      const userData = profile.value as any
      utils.setLSItem(constants.localStorageKeys.NICKNAME, userData.nickname)
      utils.setLSItem(constants.localStorageKeys.VIP_LEVEL, userData.vipLevel)
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    isError.value = true
    showToast('获取用户信息失败，请稍后重试')
  } finally {
    isLoading.value = false
  }
}

async function reportUserProfileView() {
  if (!isCurrentUser && resolvedUserId) {
    try {
      await setFeedInteraction(resolvedUserId, {
        action: FeedAction.ClickProfile,
        objectType: 'user',
        clientType: 0,
      })
    } catch (error) {
      console.error('上报用户访问行为失败:', error)
    }
  }
}

function handleClickOutside(event: MouseEvent) {
  if (showSortMenu.value) {
    const sortIndicator = document.querySelector('.sort-indicator')
    const sortDropdown = document.querySelector('.sort-dropdown')

    if (
      sortIndicator &&
      !sortIndicator.contains(event.target as Node) &&
      sortDropdown &&
      !sortDropdown.contains(event.target as Node)
    ) {
      showSortMenu.value = false
    }
  }
}

async function handleFollow() {
  const id = userInfo.value?.userId
  if (!id) return

  try {
    const res = await service.api.setFeedInteraction(id, {
      action: userInfo.value?.isFollowing ? FeedAction.Unfollow : FeedAction.Follow,
      objectType: 'user',
      clientType: 0,
    })

    if (userInfo.value && res.data.success) {
      const wasFollowing = userInfo.value.isFollowing
      userInfo.value.isFollowing = !wasFollowing
      // 更新粉丝数量
      if (!wasFollowing) {
        // 关注时，粉丝数+1
        userInfo.value.followerCount = (userInfo.value.followerCount || 0) + 1
      } else {
        // 取消关注时，粉丝数-1
        userInfo.value.followerCount = Math.max(0, (userInfo.value.followerCount || 0) - 1)
      }
    }
  } catch (error) {
    showFailToast({
      message: userInfo.value?.isFollowing ? '取消关注失败' : '关注失败',
      duration: 2000,
    })
  }
}

onMounted(async () => {
  isLoggedIn.value = utils.isLoggedIn() !== 'not-logged-in'
  await initData()

  reportUserProfileView()
})
</script>

<template>
  <StateManager :loading="isLoading" :error="isError">
    <div class="user-info-wrapper">
      <UserHeader
        :user-info="userInfo"
        :is-logged-in="isLoggedIn"
        class="user-header"
        @back="onBack"
        @copy-id="copyText"
      />

      <div class="content">
        <UserStats :user-info="userInfo" class="user-stats" @follow="handleFollow" />

        <div class="tabs-container">
          <Sticky :offset-top="0" :z-index="10" container-selector=".user-info-wrapper">
            <div class="tabs-header">
              <Tabs
                v-model:active="active"
                class="full-line-tabs"
                type="line"
                title-active-color="var(--van-text-color)"
                @change="onTabChange"
              >
                <Tab v-for="(item, index) in tab3" :key="item.action">
                  <template #title>
                    <div class="tab-title-container">
                      <div>{{ item.label }}</div>
                      <button
                        v-if="index === 0"
                        class="sort-button"
                        @click.stop.prevent="openDropdown"
                      >
                        <Icon
                          :name="showSortMenu ? 'arrow-up' : 'arrow-down'"
                          size="14"
                          color="var(--van-text-color)"
                        />
                      </button>
                    </div>
                  </template>
                </Tab>
              </Tabs>

              <div v-if="active === 0 && showSortMenu" class="sort-dropdown" @click.stop>
                <div
                  v-for="option in sortOptions"
                  :key="option.value"
                  class="dropdown-option"
                  :class="{ active: worksSortBy === option.value }"
                  @click="selectOption(option.value)"
                >
                  <span>{{ option.text }}</span>
                  <Icon
                    v-if="worksSortBy === option.value"
                    name="success"
                    color="var(--van-primary-color)"
                    size="16"
                  />
                </div>
              </div>
            </div>
          </Sticky>

          <div class="tab-content">
            <component
              :is="componentMap[tab3[active].component as keyof typeof componentMap]"
              :userId="resolvedUserId || myId"
              :sortBy="tab3[active].action === 'works' ? worksSortBy : undefined"
            />
          </div>
        </div>
      </div>

      <!-- 底部安全区域填充 -->
      <div class="safe-area-bottom"></div>
    </div>
  </StateManager>
</template>

<style scoped>
.user-info-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding-bottom: 0;
  overflow-y: scroll;
  overflow-x: hidden;
  font-size: 14px;
  color: var(--van-text-color);
  position: relative;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: none;
}

/* 添加Header样式确保不会被压缩 */
.user-info-wrapper :deep(.user-header) {
  flex-shrink: 0;
}

/* 确保用户统计信息不被压缩 */
.user-info-wrapper :deep(.user-stats) {
  flex-shrink: 0;
  min-height: 100px;
}

.content {
  background-color: var(--van-background);
  position: relative;
  flex: 1;
  overflow: visible;
}

.tabs-header {
  width: 100%;
  background-color: var(--van-background);
  flex-shrink: 0;
  min-height: 44px;
  position: relative; /* 为下拉菜单提供相对定位基准 */
}

.tab-content {
  padding-top: 8px;
  overflow: visible;
}

/* 确保组件内容不创建独立滚动区域 */
.tab-content :deep(> *) {
  overflow: visible !important;
}

/* 防止子组件内嵌滚动区域 */
:deep(.van-tab__pane),
:deep(.van-tab__pane-wrapper),
:deep(.van-tabs__content) {
  overflow: visible !important;
  height: auto !important;
}

/* 确保组件库内部元素不创建独立滚动区域 */
:deep([role='tabpanel']) {
  overflow: visible !important;
  height: auto !important;
}

/* Sticky tabs styling */
:deep(.van-sticky) {
  height: auto;
  width: 100%;
}

:deep(.van-sticky--fixed) {
  z-index: 100;
  width: 100%;
  left: 0;
  top: 0;
}

@media (min-width: 768px) {
  :deep(.van-sticky--fixed) {
    max-width: 768px;
    left: 50%;
    transform: translateX(-50%);
  }
}

:deep(.van-sticky--fixed) .tabs-header {
  padding-top: 8px;
}

:deep(.van-sticky--fixed) .van-tabs__nav {
  background-color: var(--van-background) !important;
  border-bottom: 1px solid var(--van-gray-2);
  width: 100%;
}

.full-line-tabs :deep(.van-tabs__nav) {
  background: var(--van-background);
  font-size: 14px;
}

.full-line-tabs :deep(.van-tabs__line) {
  width: calc(25% - 8px);
  background-color: var(--van-primary-color);
  transform: translateX(61px) translateX(-50%);
  transition-duration: 0.3s;
  position: absolute;
  bottom: 15px;
}

:deep(.van-tab) {
  color: var(--van-text-color, #000);
}

:deep(.van-tabs__nav--line .van-tab--active) {
  color: var(--van-primary-color);
}

.tab-title-container {
  display: flex;
  align-items: center;
  gap: 4px;
  position: relative;
}

.tabs-container {
  position: relative;
}

.sort-indicator {
  margin-left: 6px;
  color: var(--van-primary-color);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  user-select: none;
  padding: 10px;
  margin: -10px;
  z-index: 10;
}

.sort-dropdown {
  position: absolute;
  top: 100%; /* 相对于父元素底部 */
  width: 100%;
  background-color: var(--van-gray-1);
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  z-index: 101;
  overflow: hidden;
  font-size: 14px;
  left: 0;
}

.dropdown-option {
  padding: 10px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown-option:not(:last-child) {
  border-bottom: 1px solid var(--van-background);
}

.dropdown-option:hover {
  background-color: var(--van-gray-2);
}

.dropdown-option.active {
  color: var(--van-primary-color);
  font-weight: 500;
}

.sort-button {
  color: var(--van-primary-color);
  background: transparent;
  border: none;
  cursor: pointer;
}

.sort-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

/* 底部安全区域填充 */
.safe-area-bottom {
  height: max(100px, env(safe-area-inset-bottom, 100px));
  background-color: var(--van-background);
  width: 100%;
  flex-shrink: 0;
}
</style>
