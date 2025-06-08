<script setup lang="ts">
import NoData from '@/components/NoData.vue'
import type { ApiResponse, PaginatedData } from '@/service/types/common'
import { isMobileDevice } from '@/utils/device'
import { PullRefresh, showFailToast } from 'vant'
import { onMounted, onUnmounted, ref } from 'vue'

interface LiveHistoryItem {
  id: string
  streamTitle: string
  channelName: string
  thumbnail: string
  watchedAt: string
  duration: number
}

type GetLiveHistoryResponse = ApiResponse<PaginatedData<LiveHistoryItem>>

const liveHistoryList = ref<LiveHistoryItem[]>([])
const isLoading = ref(true)
const isError = ref(false)
const refreshing = ref(false)

// Web拖拽刷新相关状态
const isDragging = ref(false)
const startY = ref(0)
const currentY = ref(0)
const DRAG_THRESHOLD = 80 // 拖拽触发刷新的阈值
const containerRef = ref<HTMLElement | null>(null)

defineExpose({ loadHistory, clearHistory })

async function getLiveHistory(params = { page: 1, pageSize: 10 }): Promise<GetLiveHistoryResponse> {
  // return videoApiInstance.get<GetLiveHistoryResponse>('/api/history/lives', { params })
  //   .then(response => response.data);

  // Mock response for now
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        success: true,
        code: '0',
        message: 'success',
        data: {
          items: [],
          total: 0,
          page: params.page,
          pageSize: params.pageSize,
          totalPages: 0,
        },
      })
    }, 500)
  })
}

async function loadHistory() {
  try {
    isLoading.value = true
    isError.value = false
    const response = await getLiveHistory({
      page: 1,
      pageSize: 10,
    })
    liveHistoryList.value = response.data.items
    refreshing.value = false
  } catch (error) {
    isError.value = true
    showFailToast({
      message: '获取直播历史失败',
      duration: 2000,
    })
    refreshing.value = false
  } finally {
    isLoading.value = false
  }
}

async function clearHistory() {
  try {
    // Replace with actual API when available
    // await clearLiveHistory()
    liveHistoryList.value = []
    showFailToast({
      message: '已清空直播观看历史',
      duration: 2000,
    })
  } catch (error) {
    showFailToast({
      message: '清空历史记录失败',
      duration: 2000,
    })
  }
}

// 下拉刷新处理
function onRefresh() {
  loadHistory()
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

onMounted(() => {
  loadHistory()

  // Web端的鼠标事件监听
  if (!isMobileDevice() && containerRef.value) {
    containerRef.value.addEventListener('mousedown', handleMouseDown)
  }
})

onUnmounted(() => {
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
      <div v-if="isLoading" class="loading-state">加载中...</div>
      <div v-else-if="isError" class="error-state">加载失败，请重试</div>
      <div v-else-if="liveHistoryList.length > 0" class="live-history-list">
        <div v-for="item in liveHistoryList" :key="item.id" class="live-item">
          <div class="live-thumbnail">
            <img :src="item.thumbnail" alt="直播封面" />
          </div>
          <div class="live-info">
            <div class="live-title">{{ item.streamTitle }}</div>
            <div class="channel-name">{{ item.channelName }}</div>
            <div class="watch-time">
              {{ new Date(item.watchedAt).toLocaleString() }}
            </div>
          </div>
        </div>
      </div>
      <NoData v-else text="暂无直播观看历史" />
    </PullRefresh>
  </div>
</template>

<style lang="less" scoped>
.history-list {
  padding: 10px;
  margin-top: 10px;
  height: calc(100vh - 100px);
  overflow-y: auto;
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

.live-history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.live-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background-color: var(--van-background-2);
  border-radius: 8px;
}

.live-thumbnail {
  width: 120px;
  height: 68px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.live-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.live-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.channel-name {
  font-size: 12px;
  color: var(--van-text-color-secondary);
}

.watch-time {
  font-size: 12px;
  color: var(--van-gray-6);
  margin-top: auto;
}

.loading-state,
.error-state,
.empty-data {
  text-align: center;
  padding: 40px 0;
  color: var(--van-text-color-secondary);
  font-size: 14px;
}
</style>
