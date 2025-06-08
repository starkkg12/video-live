<script setup lang="ts">
import NoData from '@/components/NoData.vue'
import VideoGallery from '@/components/VideoGallery.vue'
import type { WatchHistoryItem } from '@/service/api/history'
import { clearUserWatchHistory, getUserWatchHistoryNew } from '@/service/api/history'
import { isMobileDevice } from '@/utils/device'
import { PullRefresh, showFailToast, showSuccessToast } from 'vant'
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import type { UserVideo } from '@/service/api/user'

const historyList = ref<WatchHistoryItem[]>([])
const galleryVideos = ref<any[]>([])
const isLoading = ref(true)
const isError = ref(false)
const currentPage = ref(1)
const pageSize = 12
const hasMore = ref(true)
const loadingMore = ref(false)
const loadMoreTriggerRef = ref<HTMLElement | null>(null)
const refreshing = ref(false)

// Web拖拽刷新相关状态
const isDragging = ref(false)
const startY = ref(0)
const currentY = ref(0)
const DRAG_THRESHOLD = 80 // 拖拽触发刷新的阈值
const containerRef = ref<HTMLElement | null>(null)

defineExpose({ loadHistory, clearHistory })

// 将WatchHistoryItem转换为VideoGallery所需的格式
function transformHistoryToGalleryVideos(historyItems: WatchHistoryItem[]): any[] {
  return historyItems.map(item => ({
    ...item,
    tags: item.tags || [],
    isLiked: false, // 默认值
    isFavorite: false, // 默认值
    // 必要的兼容字段 - 使用默认值填充
    size: 0,
    resolution: '',
    bitrate: 0,
    encoding: '',
    language: '',
    hasComments: false,
    hasBarrages: false,
    hasListening: false,
    isPublic: true,
    isPublished: true,
    auditStatus: 1,
    createdAt: item.viewedAt,
  }))
}

async function loadHistory(reset = true) {
  try {
    // 防止重复加载或在加载中时触发
    if (loadingMore.value || (isLoading.value && !reset)) return

    if (reset) {
      isLoading.value = true
      isError.value = false
      currentPage.value = 1
      historyList.value = []
      galleryVideos.value = []
    } else {
      loadingMore.value = true
    }

    // 记录当前请求的页码，确保日志清晰
    const requestPage = currentPage.value

    const response = await getUserWatchHistoryNew({
      page: requestPage,
      pageSize,
    })

    const newData = response.data.data || []

    if (reset) {
      historyList.value = newData
      galleryVideos.value = transformHistoryToGalleryVideos(newData)
      refreshing.value = false
    } else {
      historyList.value = [...historyList.value, ...newData]
      galleryVideos.value = transformHistoryToGalleryVideos([...historyList.value])
    }

    // 检查是否还有更多数据
    hasMore.value = newData.length === pageSize

    // 增加页码 - 请求成功后递增，确保下次请求正确的页码
    if (hasMore.value) {
      currentPage.value = requestPage + 1
    } else {
    }
  } catch (error) {
    console.error('获取历史记录失败:', error)
    isError.value = true
    showFailToast('获取观看历史失败')
    refreshing.value = false
  } finally {
    isLoading.value = false
    loadingMore.value = false
  }
}

function loadMoreHistory() {
  if (hasMore.value && !loadingMore.value && !isLoading.value) {
    loadHistory(false)
  }
}

function handleLoadMore() {
  if (hasMore.value && !loadingMore.value && !isLoading.value) {
    console.log('🔄 Feed视图触发加载更多历史视频')
    loadHistory(false)
  }
}

function goToVideoDetail(item: any) {
  window.location.href = `/video/${item.id}`
}

async function clearHistory() {
  try {
    await clearUserWatchHistory()
    showSuccessToast({
      message: '已清空视频观看历史',
      duration: 2000,
    })
    loadHistory(true)
  } catch (error) {
    showFailToast({
      message: '清空历史记录失败',
      duration: 2000,
    })
  }
}

// 下拉刷新处理
function onRefresh() {
  loadHistory(true)
}

// Web端下拉刷新相关事件处理
function handleMouseDown(e: MouseEvent) {
  if (!containerRef.value || refreshing.value) return

  // 仅在页面顶部时才允许开始拖动
  if (containerRef.value.scrollTop > 5) return

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
    // 模拟下拉效果
    const pullDistance = Math.min(distance * 0.6, DRAG_THRESHOLD * 1.2)

    if (pullDistance > DRAG_THRESHOLD) {
      // 触发松手刷新的视觉提示
      containerRef.value?.style.setProperty('--pull-distance', `${pullDistance}px`)
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
    refreshing.value = true
    onRefresh()
  }

  // 重置样式
  containerRef.value?.style.removeProperty('--pull-distance')
}

// 滚动监听
let observer: IntersectionObserver | null = null

function setupIntersectionObserver() {
  if (observer) {
    observer.disconnect()
  }

  observer = new IntersectionObserver(
    entries => {
      const entry = entries[0]
      if (
        entry &&
        entry.isIntersecting &&
        hasMore.value &&
        !loadingMore.value &&
        !isLoading.value
      ) {
        loadMoreHistory()
      }
    },
    {
      rootMargin: '100px',
    }
  )

  if (loadMoreTriggerRef.value) {
    observer.observe(loadMoreTriggerRef.value)
  }
}

// 监听historyList变化，在数据更新后重新设置观察器
watch(historyList, () => {
  nextTick(() => {
    setupIntersectionObserver()
  })
})

onMounted(() => {
  loadHistory(true)

  // 初始设置观察器
  nextTick(() => {
    setupIntersectionObserver()
  })

  // Web端的鼠标事件监听
  if (!isMobileDevice() && containerRef.value) {
    containerRef.value.addEventListener('mousedown', handleMouseDown)
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }

  // 清理事件监听
  if (containerRef.value) {
    containerRef.value.removeEventListener('mousedown', handleMouseDown)
  }

  // 清理可能遗留的mousemove和mouseup监听器
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})
</script>

<template>
  <div class="history-list" ref="containerRef">
    <PullRefresh v-model="refreshing" @refresh="onRefresh" :disabled="!isMobileDevice()">
      <VideoGallery
        class="history-video-list-content"
        :videos="galleryVideos"
        :loading="isLoading || loadingMore"
        :columns="3"
        aspectRatio="1/1.3"
        :showTitle="true"
        @itemClick="goToVideoDetail"
        @loadMore="handleLoadMore"
      >
        <template #empty> <NoData /> </template>
      </VideoGallery>

      <div v-if="loadingMore" class="loading-more">加载中...</div>
      <div v-else-if="!hasMore && historyList.length > 0" class="history-footer">
        最多显示近30天记录
      </div>
      <div v-else-if="hasMore" class="load-more-trigger" ref="loadMoreTriggerRef"></div>
    </PullRefresh>
  </div>
</template>

<style lang="less" scoped>
.history-list {
  padding: 10px;
  height: 100%;
  overflow-y: auto;
  position: relative;
  -webkit-overflow-scrolling: touch;

  /* Web端下拉刷新效果 */
  &::before {
    content: '';
    display: block;
    height: var(--pull-distance, 0);
    transition: height 0.2s;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0) 100%);
  }
}

:deep(.van-pull-refresh) {
  overflow: visible;
  height: 100%;
}

.loading-more {
  text-align: center;
  padding: 16px 0;
  font-size: 14px;
  color: var(--van-gray-6);
}

.load-more-trigger {
  height: 20px;
  width: 100%;
}

.history-footer {
  text-align: center;
  padding: 16px 0;
  font-size: 12px;
  color: var(--van-gray-6, #7d7e80);
  margin-top: 8px;
}
</style>
