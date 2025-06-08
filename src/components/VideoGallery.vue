<script setup lang="ts">
/**
 * 视频画廊组件
 * 用于展示视频列表，并提供视频预览功能
 *
 * @param {Array} videos - 视频列表
 * @param {Number} columns - 列数
 * @param {String} aspectRatio - 视频宽高比
 */

import type { UserVideo } from '@/service/api'
import { ref, watch } from 'vue'
import VideoFeed from './VideoFeed.vue'
import VideoGrid from './VideoGrid.vue'

const props = defineProps({
  videos: {
    type: Array as () => UserVideo[],
    default: () => [],
  },
  columns: {
    type: Number,
    default: 3,
  },
  aspectRatio: {
    type: String,
    default: '1/1',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  threshold: {
    type: Number,
    default: 3, // 当剩余视频数小于等于此值时触发加载更多
  },
  // 是否为点赞列表或收藏列表
  isLikeList: {
    type: Boolean,
    default: false,
  },
  isFavoriteList: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['loadMore', 'update:videos', 'remove-video'])

// 本地视频数据，用于在操作后更新UI
const localVideos = ref<UserVideo[]>([...props.videos])

watch(
  () => props.videos,
  newVal => {
    localVideos.value = [...newVal]
  },
  { deep: true }
)

const showFeed = ref(false)
const selectedIndex = ref(0)

const handleVideoClick = (item: UserVideo) => {
  const index = localVideos.value.findIndex(video => video.id === item.id)
  if (index !== -1) {
    selectedIndex.value = index
    showFeed.value = true
  }
}

const handleCloseFeed = () => {
  showFeed.value = false

  // VideoFeed关闭后，处理所有待移除的视频
  if (pendingRemoveVideos.value.length > 0) {
    // 最后检查一次，确保所有待移除的视频当前确实是未点赞/未收藏状态
    const validRemoveItems = pendingRemoveVideos.value.filter(item => {
      const video = localVideos.value.find(v => v.id === item.id)
      if (!video) return false

      // 如果是点赞列表，确认视频确实是未点赞状态
      if (item.type === 'like') {
        return video.isLiked === false
      }
      // 如果是收藏列表，确认视频确实是未收藏状态
      if (item.type === 'favorite') {
        return video.isFavorite === false
      }
      return false
    })

    if (validRemoveItems.length > 0) {
      // 只移除那些确实应该移除的视频
      const updatedVideos = localVideos.value.filter(
        video => !validRemoveItems.some(item => item.id === video.id)
      )

      // 通知父组件移除的每个视频
      validRemoveItems.forEach(item => {
        emit('remove-video', item.video)
      })

      // 更新本地列表
      localVideos.value = updatedVideos
      emit('update:videos', updatedVideos)
    }

    // 清空待移除列表
    pendingRemoveVideos.value = []
  }
}

const handleIndexChange = (newIndex: number) => {
  selectedIndex.value = newIndex
  checkNeedLoadMore(newIndex)
}

const checkNeedLoadMore = (currentIndex: number) => {
  // 如果当前位置已经接近视频列表末尾，触发加载更多事件
  const remainingVideos = localVideos.value.length - (currentIndex + 1)
  if (remainingVideos <= props.threshold && !props.loading) {
    emit('loadMore')
  }
}

// 处理视频操作（点赞、收藏等）
const handleVideoAction = (actionData: {
  videoId: string | number
  action: string
  value: boolean
  index: number
}) => {
  const { videoId, action, value, index } = actionData

  // 更新本地数据
  if (localVideos.value[index]) {
    try {
      if (action === 'like') {
        // 检查属性是否存在，不存在则添加
        if (typeof localVideos.value[index].isLiked === 'undefined') {
          localVideos.value[index] = { ...localVideos.value[index], isLiked: value }
        } else {
          localVideos.value[index].isLiked = value
        }

        if (props.isLikeList) {
          if (!value) {
            // 取消点赞，添加视觉反馈并标记等待移除
            addRemovalHighlight(videoId)
            addToPendingRemoveList(videoId, localVideos.value[index], 'like')
          } else {
            // 重新点赞，从待移除列表中删除
            removeFromPendingRemoveList(videoId)
          }
        }
      } else if (action === 'favorite') {
        // 检查属性是否存在，不存在则添加
        if (typeof localVideos.value[index].isFavorite === 'undefined') {
          localVideos.value[index] = { ...localVideos.value[index], isFavorite: value }
        } else {
          localVideos.value[index].isFavorite = value
        }

        if (props.isFavoriteList) {
          if (!value) {
            // 取消收藏，添加视觉反馈并标记等待移除
            addRemovalHighlight(videoId)
            addToPendingRemoveList(videoId, localVideos.value[index], 'favorite')
          } else {
            // 重新收藏，从待移除列表中删除
            removeFromPendingRemoveList(videoId)
          }
        }
      }

      // 通知父组件视频数据已更新
      emit('update:videos', localVideos.value)
    } catch (error) {
      console.error('Error handling video action:', error)
    }
  } else {
    console.error('Video at index', index, 'not found in localVideos')
  }
}

// 添加到待移除列表
const addToPendingRemoveList = (
  videoId: string | number,
  video: UserVideo,
  type: 'like' | 'favorite'
) => {
  // 如果已经在列表中，就不重复添加
  if (!pendingRemoveVideos.value.some(item => item.id === videoId)) {
    pendingRemoveVideos.value.push({ id: videoId, video, type })
  }
}

// 从待移除列表中移除
const removeFromPendingRemoveList = (videoId: string | number) => {
  const index = pendingRemoveVideos.value.findIndex(item => item.id === videoId)
  if (index !== -1) {
    pendingRemoveVideos.value.splice(index, 1)
  }
}

// 为即将移除的视频添加视觉高亮提示
const addRemovalHighlight = (videoId: string | number) => {
  // 使用setTimeout避免阻塞UI
  setTimeout(() => {
    const videoElement = document.querySelector(`.grid-item[data-id="${videoId}"]`)
    if (videoElement) {
      videoElement.classList.add('pending-removal')

      // 移除高亮，让用户能看到效果
      setTimeout(() => {
        videoElement.classList.remove('pending-removal')
      }, 800)
    }
  }, 0)
}

// 存储待移除的视频
const pendingRemoveVideos = ref<
  { id: string | number; video: UserVideo; type: 'like' | 'favorite' }[]
>([])
</script>

<template>
  <div class="video-gallery">
    <VideoGrid
      :videos="localVideos"
      :columns="columns"
      :aspectRatio="aspectRatio"
      :loading="loading"
      @itemClick="handleVideoClick"
    >
      <template #empty>
        <slot name="empty">暂无数据</slot>
      </template>
    </VideoGrid>

    <VideoFeed
      :videos="localVideos"
      :initialIndex="selectedIndex"
      :visible="showFeed"
      @close="handleCloseFeed"
      @index-change="handleIndexChange"
      @video-action="handleVideoAction"
    />
  </div>
</template>

<style scoped>
.video-gallery {
  position: relative;
  width: 100%;
}
</style>
