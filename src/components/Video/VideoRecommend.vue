<script setup lang="ts">
import VideoContent from '@/components/Video/VideoContent.vue'
import ShakaVideoPlayer from '@/components/Video/VideoPlayerShaka.vue'
import {
  getFeedList,
  getFollowingFeed,
  getVideoDetail,
  setFeedInteraction,
  FeedAction,
} from '@/service/api'
import '@vant/touch-emulator'
import { Swipe, SwipeItem } from 'vant'
import { computed, nextTick, onBeforeUnmount, onMounted, provide, reactive, ref, watch } from 'vue'

import { useFetchData, type UseFetchDataInterface } from '@/composables/useFetchData'
import { useShaka } from '@/composables/useShaka'
import Loading from '@/components/Loading.vue'
import NoData from '@/components/NoData.vue'
import LazyShow from '@/components/LazyShow.vue'
import { useCacheData } from '@/composables/useCacheData'

const shakaInstance = useShaka()

const props = defineProps<{
  isFollowing?: boolean
  isActiveTab?: boolean
}>()

const fetchFunc = props.isFollowing ? getFollowingFeed : getFeedList
const isMuted = ref(true)
const shakaVideoPlayerRef = ref<InstanceType<typeof ShakaVideoPlayer> | null>(null)
const toggleMuted = () => {
  isMuted.value = !isMuted.value
}
const { addUsersDictionary, usersDictionary } = useCacheData()

provide('isMuted', isMuted)
provide('toggleMuted', toggleMuted)
provide('addUsersDictionary', addUsersDictionary)
provide('usersDictionary', usersDictionary)

const swipeRef = ref<InstanceType<typeof Swipe> | null>(null)
const videoList = ref<any[]>([])
const isRealPlay = ref(false)
const followingMap = reactive<Record<string, boolean>>({})
const { fetchData }: UseFetchDataInterface = useFetchData()

// 最后一条数据的scrollerId,第一次请求是0
const scrollerId = ref(0)
const isLoading = ref(false)
const shakaVideoPlayerWrapper = ref<HTMLElement | null>(null)
const videoPlayerElement = ref<HTMLElement | null>(null)

// 获取URL参数的函数
const getUrlParam = (name: string) => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(name)
}

const size = reactive({
  width: window.innerWidth,
  height: window.innerHeight,
})

const updateSize = () => {
  size.width = window.innerWidth
  size.height = window.innerHeight
  const swipeElement = swipeRef.value?.$el as HTMLElement
  if (swipeElement) {
    swipeElement.style.height = `${size.height}px`
  }
  const swipeInstance = swipeRef.value as any
  swipeInstance?.resize()
}

// 处理分享链接
const processShareId = async () => {
  const firstId = getUrlParam('shareId') || getUrlParam('previewId')
  if (firstId) {
    isLoading.value = true
    try {
      const response = await getVideoDetail(firstId)
      if (response.data && response.data.success) {
        // 将共享视频插入到列表第一位
        videoList.value.unshift(response.data.data)
        // 确保激活第一个视频
        activeIndex.value = 0
        // 设置交互记录-查看
        setFeedInteraction(firstId, {
          action: FeedAction.View,
        })
      }
    } catch (error) {
      console.error('获取分享视频失败:', error)
    } finally {
      isLoading.value = false
    }
  }
}

onMounted(() => {
  nextTick(() => {
    updateSize()
  })
  window.addEventListener('resize', updateSize)
  // 先处理分享ID，然后再加载常规列表
  processShareId().then(async () => {
    isLoading.value = !videoList.value.length
    // 如果处理了分享ID，videoList已经有内容，我们可以继续加载普通列表
    await loadData()

    isLoading.value = false
  })
  shakaVideoPlayerWrapper.value = document.getElementById('shakaVideoPlayerWrapper')
  videoPlayerElement.value = document.getElementById('shakaVideoPlayer')
})

watch(
  () => props.isActiveTab,
  (newVal: boolean) => {
    if (!newVal) {
      shakaVideoPlayerRef.value?.pause()
    } else {
      shakaVideoPlayerRef.value?.play()
    }
  }
)

const swipeStyle = computed(() => ({
  width: `${size.width}px`,
  height: `${size.height}px`,
}))

const loadData = async () => {
  const res = await fetchFunc()
  if (res.data.success) {
    const videos = res.data.data.videos

    // 如果已经有分享视频，过滤掉相同的视频（防止重复）
    if (videoList.value.length > 0) {
      const sharedVideoId = videoList.value[0].id
      const filteredVideos = videos.filter((video: any) => video.id !== sharedVideoId)
      videoList.value.push(...filteredVideos)
    } else {
      videoList.value.push(...videos)
    }
  }
}

const loadVideoDetails = (index: number) => {
  const id = videoList.value.at(index)?.id!
  console.log('TODO Load video details from id:', id)
  // TODO: fetch video details by video id
}

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateSize)
})

const activeIndex = ref(0)

const onSwipeChange = (index: number) => {
  activeIndex.value = index
  loadVideoDetails(index)
  // 最后一条数据时加载更多
  if (videoList.value.length == index + 1) {
    loadData()
  }
  setFeedInteraction(videoList.value.at(index)?.id!, {
    action: FeedAction.View,
  })
  isRealPlay.value = false
}

const checkVisible = (index: number) => {
  const offset = index - activeIndex.value
  return offset >= -1 && offset <= 1
}

const onRealPlay = () => {
  isRealPlay.value = true
}

const updateActionStatus = (item: any, action: FeedAction, status?: boolean) => {
  if (action === FeedAction.Like) {
    item.isLiked = status
    item.likeCount = status ? item.likeCount + 1 : item.likeCount - 1
  } else if (action === FeedAction.Favorite) {
    item.isFavorite = status
    item.favoriteCount = status ? item.favoriteCount + 1 : item.favoriteCount - 1
  } else if (action === FeedAction.Comment) {
    item.commentCount += 1
  } else if (action === FeedAction.Share) {
    item.shareCount += 1
  } else if (action === FeedAction.Follow) {
    followingMap[item.userId] = true
  }
}
</script>

<template>
  <div class="video-list-container">
    <div class="shaka-video-player-wrapper" id="shakaVideoPlayerWrapper">
      <ShakaVideoPlayer
        id="shakaVideoPlayer"
        ref="shakaVideoPlayerRef"
        :src="videoList.at(activeIndex)?.videoPath"
        :poster="videoList.at(activeIndex)?.poster"
        :isActive="true"
        :isMuted="isMuted"
        :shakaInstance="shakaInstance"
        @realPlay="onRealPlay"
      />
    </div>
    <Swipe
      ref="swipeRef"
      class="video-swipe safe-area-full"
      vertical
      :show-indicators="false"
      :style="swipeStyle"
      :loop="false"
      @change="onSwipeChange"
      v-if="videoList.length && !isLoading"
    >
      <SwipeItem v-for="(item, index) in videoList" :key="index" class="swipe-item">
        <VideoContent
          v-if="checkVisible(index)"
          :data="item"
          :isActive="activeIndex === index"
          :fetchData="fetchData"
          :shakaVideoPlayerRef="shakaVideoPlayerRef"
          shakaVideoPlayerId="shakaVideoPlayer"
          :shakaVideoPlayerWrapper="shakaVideoPlayerWrapper"
          :videoPlayerElement="videoPlayerElement"
          :isRealPlay="isRealPlay"
          @like="(status: boolean) => updateActionStatus(item, FeedAction.Like, status)"
          @favorite="(status: boolean) => updateActionStatus(item, FeedAction.Favorite, status)"
          @comment="() => updateActionStatus(item, FeedAction.Comment)"
          @share="() => updateActionStatus(item, FeedAction.Share)"
          @follow="() => updateActionStatus(item, FeedAction.Follow)"
          :isFollowingAuthor="
            followingMap[item.userId] !== undefined
              ? followingMap[item.userId]
              : item.isFollowingAuthor
          "
        ></VideoContent>
      </SwipeItem>
    </Swipe>
    <Loading v-if="isLoading" />
    <LazyShow :show="!isLoading && !videoList.length">
      <NoData text="暂无数据" />
    </LazyShow>
  </div>
</template>

<style scoped lang="less">
.video-list-container {
  height: 100%;
}
#shakaVideoPlayer {
  position: relative;
  z-index: 1;
}
.swipe-item {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.shaka-video-player-wrapper {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 0;
  width: 0;
  z-index: 10;
  display: none;
}

.no-data-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  .no-data-text {
    color: #fff;
    font-size: 16px;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@media screen and (min-width: 768px) {
  /** 當視窗寬度大於768px視頻寬度自動匹配 */
  :deep(div.van-swipe.video-swipe[style]) {
    width: auto !important;
  }
}
</style>
