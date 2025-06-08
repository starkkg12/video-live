<script setup lang="ts">
import defaultAvatar from '@/assets/images/default-avatar.png'
import CustomImage from '@/components/CustomImage.vue'
import NoData from '@/components/NoData.vue'
import { useCurrentUser } from '@/composables/useCurrentUser'
import service from '@/service'
import { FeedAction } from '@/service/api/feed'
import type { EnhancedUser } from '@/service/userEnhanced'
import { isMobileDevice } from '@/utils/device'
import jumpTo from '@/utils/jumpTo'
import { Loading, PullRefresh, showFailToast } from 'vant'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps<{
  userList: EnhancedUser[]
  loading?: boolean
  error?: boolean
  emptyText?: string
  showRecordsHint?: boolean
  recordsHintText?: string
  loadingMore?: boolean
  hasMore?: boolean
  refreshing?: boolean
}>()

const emit = defineEmits(['refresh', 'update:userList', 'load-more', 'update:refreshing'])
const { myId } = useCurrentUser()

const listRef = ref<HTMLElement | null>(null)
const loadTriggerRef = ref<HTMLElement | null>(null)
const isCheckingScroll = ref(false)
const observer = ref<IntersectionObserver | null>(null)
const lastScrollTop = ref(0)
const scrollSpeed = ref(0)
const scrollTimer = ref<number | null>(null)
const isScrollingDown = ref(true)
const lastScrollCheckTime = ref(Date.now())

// Web拖拽刷新相关状态
const isDragging = ref(false)
const startY = ref(0)
const currentY = ref(0)
const DRAG_THRESHOLD = 80 // 拖拽触发刷新的阈值

async function handleFollow(item: EnhancedUser) {
  try {
    await service.api.setFeedInteraction(item.userId, {
      action: item.isFollowing ? FeedAction.Unfollow : FeedAction.Follow,
      objectType: 'user',
      clientType: 0,
    })

    const updatedItem = { ...item, isFollowing: !item.isFollowing }
    const updatedList = props.userList.map(user =>
      user.userId === item.userId ? updatedItem : user
    )

    emit('update:userList', updatedList)
  } catch (error) {
    showFailToast({
      message: item.isFollowing ? '取消关注失败' : '关注失败',
      duration: 2000,
    })
  }
}

function navigateToUserProfile(item: EnhancedUser) {
  if (!item.isAnonymousUser) {
    jumpTo(`/user/${item.userId}`)
  }
}

function onRefresh() {
  emit('refresh')
}

function onRefreshingChange(value: boolean) {
  emit('update:refreshing', value)
}

function onLoadMore() {
  if (!props.loading && !props.loadingMore && props.hasMore) {
    emit('load-more')
  }
}

function checkLoadMore() {
  if (
    isCheckingScroll.value ||
    !listRef.value ||
    props.loading ||
    props.loadingMore ||
    !props.hasMore
  ) {
    return
  }

  const now = Date.now()
  if (now - lastScrollCheckTime.value < 50) {
    return
  }
  lastScrollCheckTime.value = now
  isCheckingScroll.value = true

  const scrollHeight = listRef.value.scrollHeight
  const scrollTop = listRef.value.scrollTop
  const clientHeight = listRef.value.clientHeight

  // 检测滚动方向
  isScrollingDown.value = scrollTop > lastScrollTop.value

  // 计算滚动速度和距离底部的距离
  scrollSpeed.value = Math.abs(scrollTop - lastScrollTop.value)
  lastScrollTop.value = scrollTop
  const distanceToBottom = scrollHeight - scrollTop - clientHeight

  // 根据滚动速度动态调整预加载距离
  let preloadDistance = 150
  if (scrollSpeed.value > 100) {
    preloadDistance = 500
  } else if (scrollSpeed.value > 50) {
    preloadDistance = 300
  }

  // 判断是否需要加载更多的条件
  const shouldLoadMore =
    // 向下滚动且接近底部，根据滚动速度动态调整距离
    (isScrollingDown.value && distanceToBottom < preloadDistance) ||
    // 列表项少于5个时自动加载更多
    props.userList.length < 5 ||
    // 滚动速度非常快时提前加载
    (isScrollingDown.value && scrollSpeed.value > 200) ||
    // 滚动到内容的最后10%时一定触发加载
    distanceToBottom < scrollHeight * 0.1

  if (shouldLoadMore) {
    emit('load-more')
  }

  // 滚动停止检测
  if (scrollTimer.value !== null) {
    clearTimeout(scrollTimer.value)
  }
  scrollTimer.value = window.setTimeout(() => {
    // 滚动停止后再次检查是否接近底部
    if (
      listRef.value &&
      !props.loading &&
      !props.loadingMore &&
      props.hasMore &&
      listRef.value.scrollHeight - listRef.value.scrollTop - listRef.value.clientHeight < 150
    ) {
      emit('load-more')
    }
    scrollTimer.value = null
  }, 150)

  setTimeout(() => {
    isCheckingScroll.value = false
  }, 50)
}

// Web端下拉刷新相关事件处理
function handleMouseDown(e: MouseEvent) {
  if (!listRef.value || props.refreshing) return

  // 仅在页面顶部时才允许开始拖动
  if (listRef.value.scrollTop > 0) return

  isDragging.value = true
  startY.value = e.clientY
  currentY.value = e.clientY

  // 添加临时事件监听
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)

  // 防止默认行为和文本选择
  e.preventDefault()
}

function handleMouseMove(e: MouseEvent) {
  if (!isDragging.value) return

  currentY.value = e.clientY
  const distance = currentY.value - startY.value

  // 只有向下拖动才考虑刷新
  if (distance > 0) {
    // 让PullRefresh组件感知到下拉状态
    const pullDistance = Math.min(distance * 0.6, DRAG_THRESHOLD * 1.2)

    if (pullDistance > DRAG_THRESHOLD) {
      // 触发松手刷新的视觉提示
      listRef.value?.style.setProperty('--pull-distance', `${pullDistance}px`)
    }

    e.preventDefault()
  }
}

function handleMouseUp(e: MouseEvent) {
  if (!isDragging.value) return

  const distance = currentY.value - startY.value

  // 清理临时事件监听
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)

  isDragging.value = false

  // 如果拖拽距离超过阈值，触发刷新
  if (distance > DRAG_THRESHOLD) {
    emit('update:refreshing', true)
    onRefresh()
  }

  // 重置样式
  listRef.value?.style.removeProperty('--pull-distance')
}

// 检查初始加载 - 用于短列表自动加载更多
function checkInitialLoad() {
  if (
    listRef.value &&
    props.hasMore &&
    !props.loading &&
    !props.loadingMore &&
    (props.userList.length < 10 || listRef.value.scrollHeight <= listRef.value.clientHeight)
  ) {
    emit('load-more')
  }
}

// 初始化 Intersection Observer
function setupIntersectionObserver() {
  if (!loadTriggerRef.value) return

  // 先断开旧的观察器
  if (observer.value) {
    observer.value.disconnect()
    observer.value = null
  }

  observer.value = new IntersectionObserver(
    entries => {
      const entry = entries[0]
      if (entry.isIntersecting && props.hasMore && !props.loading && !props.loadingMore) {
        emit('load-more')
      }
    },
    {
      root: null, // 使用视口作为根元素
      rootMargin: '500px', // 大预加载距离
      threshold: 0,
    }
  )

  observer.value.observe(loadTriggerRef.value)
}

// 处理触摸结束事件 - 检测惯性滚动结束
function handleTouchEnd() {
  if (!listRef.value || !props.hasMore || props.loading || props.loadingMore) return

  // 触摸结束后可能有惯性滚动，所以在不同时间点检查
  const checkAfterDelay = (delay: number) => {
    setTimeout(() => {
      if (
        listRef.value &&
        props.hasMore &&
        !props.loading &&
        !props.loadingMore &&
        listRef.value.scrollHeight - listRef.value.scrollTop - listRef.value.clientHeight < 150
      ) {
        emit('load-more')
      }
    }, delay)
  }

  // 延迟不同时间检查两次
  checkAfterDelay(50)
  checkAfterDelay(300)
}

onMounted(() => {
  nextTick(() => {
    if (listRef.value) {
      // 滚动事件监听
      listRef.value.addEventListener('scroll', checkLoadMore, { passive: true })

      // 触摸结束事件监听
      listRef.value.addEventListener('touchend', handleTouchEnd, { passive: true })

      // Web端的鼠标事件监听
      if (!isMobileDevice()) {
        listRef.value.addEventListener('mousedown', handleMouseDown)
      }

      // 初始化 Intersection Observer
      setupIntersectionObserver()

      // 初始检查，确保短列表能触发加载
      setTimeout(checkInitialLoad, 300)
    }
  })
})

onUnmounted(() => {
  // 清理事件监听
  if (listRef.value) {
    listRef.value.removeEventListener('scroll', checkLoadMore)
    listRef.value.removeEventListener('touchend', handleTouchEnd)

    if (!isMobileDevice()) {
      listRef.value.removeEventListener('mousedown', handleMouseDown)
    }

    // 清理可能遗留的mousemove和mouseup监听器
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  // 清理计时器
  if (scrollTimer.value !== null) {
    clearTimeout(scrollTimer.value)
  }

  // 清理 Intersection Observer
  if (observer.value) {
    observer.value.disconnect()
    observer.value = null
  }
})
</script>

<template>
  <div class="user-list-container" ref="listRef">
    <PullRefresh
      class="user-list-pull-refresh"
      :modelValue="refreshing"
      @update:modelValue="onRefreshingChange"
      @refresh="onRefresh"
    >
      <div class="list-wrapper">
        <div v-if="error" class="error-state">加载失败，请重试</div>
        <div v-else-if="userList.length > 0" class="user-list">
          <div v-for="(item, index) in userList" :key="item.userId || index" class="user-item">
            <div class="user-info" @click="navigateToUserProfile(item)">
              <!-- 用户头像 -->
              <CustomImage
                v-if="item.avatar"
                :src="item.avatar"
                class="user-avatar"
                alt="用户头像"
                fit="cover"
                round
                height="40px"
              />
              <img v-else :src="defaultAvatar.src" class="user-avatar" alt="默认头像" />

              <!-- 用户昵称 -->
              <div class="user-name">
                {{ item.nickname || '用户' + (item.userId ? ` ${item.userId}` : '') }}
              </div>
            </div>

            <!-- 关注按钮 -->
            <button
              v-if="myId !== item.userId && !item.isAnonymousUser"
              class="follow-btn"
              :class="{ following: item.isFollowing }"
              @click="handleFollow(item)"
            >
              {{ item.isFollowing ? '取消关注' : '关注' }}
            </button>
          </div>
        </div>
        <NoData v-else-if="!loading" :text="emptyText || '暂无数据'" />

        <div class="loading-more" v-if="loadingMore">
          <Loading color="#999" size="24px">加载中...</Loading>
        </div>

        <!-- 加载更多触发区域 -->
        <div
          v-if="hasMore"
          class="load-more-trigger"
          ref="loadTriggerRef"
          @click="onLoadMore"
        ></div>
        <div v-else-if="userList.length > 0" class="list-finished">
          {{ recordsHintText || '最多显示近30天记录' }}
        </div>
      </div>
    </PullRefresh>

    <!-- 底部显示记录数提示 -->
    <!-- <div v-if="showRecordsHint && userList.length > 0" class="records-hint">
      {{ recordsHintText || '最多显示近30天记录' }}
    </div> -->
  </div>
</template>

<style lang="less" scoped>
.user-list-container {
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  position: relative;

  /* Web端下拉刷新效果 */
  &::before {
    content: '';
    display: block;
    height: var(--pull-distance, 0);
    transition: height 0.2s;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0) 100%);
  }
}

.list-wrapper {
  min-height: 100%;
  padding-bottom: 20px;
}

.user-list {
  display: flex;
  flex-direction: column;
  padding: 0 20px;
}

.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0px;
  border-bottom: 1px solid var(--van-gray-1);
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
  // border: 1px solid #ffffff;
}

.user-name {
  font-size: 14px;
  font-weight: normal;
  color: var(--van-text-color);
}

.follow-btn {
  padding: 4px 12px;
  border-radius: 4px;
  background-color: var(--van-primary-color);
  border: none;
  color: var(--van-text-color);
  font-size: 14px;
  text-align: center;
  font-weight: 400;
  width: 80px;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.follow-btn.following {
  background-color: #efefef;
  color: #333;
}

.loading-state,
.error-state,
.empty-data {
  text-align: center;
  padding: 40px 0;
  color: var(--van-text-color-secondary);
  font-size: 14px;
}

.loading-more {
  text-align: center;
  padding: 15px 0;
  color: var(--van-text-color-secondary);
  font-size: 14px;
}

.load-more-trigger {
  height: 100px;
  margin: 10px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  width: 100%;
}

.list-finished {
  text-align: center;
  color: #999;
  font-size: 14px;
  padding: 10px 0;
}

.records-hint {
  text-align: center;
  font-size: 12px;
  color: #999;
  padding: 12px 0;
  margin-top: 8px;
}

.user-list-pull-refresh {
  height: 100%;
  overflow: visible;
}
</style>
