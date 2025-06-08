<script setup lang="ts">
import VideoGallery from '@/components/VideoGallery.vue'
import { useCurrentUser } from '@/composables/useCurrentUser'
import {
  getUserFavoriteList,
  getUserLikeList,
  getUserVideoList,
  type UserVideo,
} from '@/service/api/user'
import jumpTo from '@/utils/jumpTo'
import { showFailToast } from 'vant'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import NoData from '../../../components/NoData.vue'

const props = defineProps<{
  type: 'favorites' | 'likes' | 'works'
  sortBy?: string
}>()

const videos = ref<UserVideo[]>([])
const isLoading = ref(true)
const isError = ref(false)
const currentPage = ref(1)
const pageSize = 30
const hasMore = ref(true)
const loadingMore = ref(false)
const loadMoreTriggerRef = ref(null)

const typeTitle = computed(() => {
  switch (props.type) {
    case 'favorites':
      return '收藏'
    case 'likes':
      return '喜欢'
    case 'works':
      return '作品'
    default:
      return ''
  }
})
const errorMessage = computed(() => `获取${typeTitle.value}列表失败`)

const { myId, isCurrentUser, userId } = useCurrentUser()

const currentSortBy = computed(() => props.sortBy || 'latest')

// 当排序方式改变时重新加载视频列表（仅适用于作品类型）
watch(
  currentSortBy,
  () => {
    if (props.type === 'works') {
      currentPage.value = 1
      videos.value = []
      loadVideos(true)
    }
  },
  { immediate: props.type === 'works' }
)

async function loadVideos(reset = true) {
  const userIdParam = userId || myId
  if (!userIdParam) {
    showFailToast('请先登录')
    return
  }
  try {
    // 防止重复加载
    if (loadingMore.value || (isLoading.value && !reset)) return

    if (reset) {
      isLoading.value = true
      isError.value = false
      currentPage.value = 1
      videos.value = []
    } else {
      loadingMore.value = true
    }

    // 记录当前请求的页码
    const requestPage = currentPage.value

    // 根据类型选择不同的API调用
    let response
    switch (props.type) {
      case 'favorites':
        response = await getUserFavoriteList(userIdParam, requestPage, pageSize)
        break
      case 'likes':
        response = await getUserLikeList(userIdParam, requestPage, pageSize)
        break
      case 'works':
        response = await getUserVideoList(userIdParam, requestPage, pageSize, currentSortBy.value)
        break
    }

    if (!response.success) {
      throw new Error(response.message || errorMessage.value)
    }

    let apiData: UserVideo[] = []
    if (Array.isArray(response.data)) {
      apiData = response.data
    } else if (
      response.data &&
      'data' in response.data &&
      Array.isArray((response.data as any).data)
    ) {
      apiData = (response.data as any).data
    } else {
      console.error(`_UserVideoList - Unexpected data structure for ${props.type}:`, response.data)
      apiData = []
    }

    // 将UserVideo转换为ExtendedVideoItem
    const newData: UserVideo[] = apiData.map(video => ({
      ...video,
      tags: video.tags || [],
      isLiked: video.isLiked !== undefined ? video.isLiked : props.type === 'likes',
      isFavorite: video.isFavorite !== undefined ? video.isFavorite : props.type === 'favorites',
    }))

    if (reset) {
      videos.value = newData
    } else {
      videos.value = [...videos.value, ...newData]
    }

    // 检查是否还有更多数据
    hasMore.value = newData.length === pageSize

    // 增加页码 - 请求成功后递增
    if (hasMore.value) {
      currentPage.value = requestPage + 1
    }
  } catch (error) {
    console.error(errorMessage.value, error)
    isError.value = true
    showFailToast(errorMessage.value)
  } finally {
    isLoading.value = false
    loadingMore.value = false
  }
}

function goToVideoDetail(item: UserVideo) {
  jumpTo(`/video/${item.id}`)
}

function handleLoadMore() {
  if (hasMore.value && !loadingMore.value && !isLoading.value) {
    loadVideos(false)
  }
}

// 无限滚动逻辑
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
        if (props.type === 'works') {
          console.log('🔄 触发加载更多作品')
        }
        loadVideos(false)
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

// 监听列表变化，重新设置观察器
watch(videos, () => {
  nextTick(() => {
    setupIntersectionObserver()
  })
})

onMounted(() => {
  loadVideos(true)
  nextTick(() => {
    setupIntersectionObserver()
  })
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})
</script>

<template>
  <div class="user-videos-container">
    <VideoGallery
      v-model:videos="videos"
      :loading="isLoading || loadingMore"
      :columns="3"
      aspectRatio="1/1.3"
      :showTitle="true"
      :isFavoriteList="type === 'favorites'"
      :isLikeList="type === 'likes'"
      @itemClick="goToVideoDetail"
      @loadMore="handleLoadMore"
    >
      <template #empty> <NoData /> </template>
    </VideoGallery>

    <div v-if="loadingMore" class="loading-more">加载中...</div>
    <div v-else-if="hasMore" class="load-more-trigger" ref="loadMoreTriggerRef"></div>
  </div>
</template>

<style lang="less" scoped>
.user-videos-container {
  padding: 10px;
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
</style>
