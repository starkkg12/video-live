<script setup lang="ts">
/**
 * 视频流组件
 * 用于展示视频列表，并提供视频预览功能
 *
 * @param {Array} videos - 视频列表
 * @param {Number} initialIndex - 初始视频索引
 */

import VideoContent from '@/components/Video/VideoContent.vue'
import ShakaVideoPlayer from '@/components/Video/VideoPlayerShaka.vue'
import { useFetchData } from '@/composables/useFetchData'
import { useShaka } from '@/composables/useShaka'
import { FeedAction } from '@/service/api'
import '@vant/touch-emulator'
import { Swipe, SwipeItem } from 'vant'
import { computed, nextTick, onBeforeUnmount, onMounted, provide, reactive, ref, watch } from 'vue'
import { Teleport } from 'vue'
import { useCacheData } from '@/composables/useCacheData'

interface VideoItem {
  id: string | number
  [key: string]: any
}

const props = defineProps({
  videos: {
    type: Array as () => VideoItem[],
    default: () => [],
  },
  initialIndex: {
    type: Number,
    default: 0,
  },
  visible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'index-change', 'video-action'])

// 初始化 Shaka 实例
const shakaInstance = useShaka()
const shakaVideoPlayerRef = ref<InstanceType<typeof ShakaVideoPlayer> | null>(null)

const isMuted = ref(true)
const toggleMuted = () => {
  isMuted.value = !isMuted.value
}
const { addUsersDictionary, usersDictionary } = useCacheData()
provide('isMuted', isMuted)
provide('toggleMuted', toggleMuted)
provide('addUsersDictionary', addUsersDictionary)
provide('usersDictionary', usersDictionary)

const swipeRef = ref<InstanceType<typeof Swipe> | null>(null)
const activeIndex = ref(props.initialIndex)
const followingMap = reactive<Record<string, boolean>>({})
const { fetchData } = useFetchData()

const resizeObserver = ref<ResizeObserver | null>(null)
const containerRef = ref<HTMLElement | null>(null)

// 视频播放器元素引用
const shakaVideoPlayerWrapper = ref<HTMLElement | null>(null)
const videoPlayerElement = ref<HTMLElement | null>(null)
const isRealPlay = ref(false)
const isInitialized = ref(false)

const size = reactive({
  width: window.innerWidth,
  height: window.innerHeight,
})

const updateSize = () => {
  if (containerRef.value) {
    const rect = containerRef.value.getBoundingClientRect()
    size.width = rect.width
    size.height = rect.height
  } else {
    size.width = window.innerWidth
    size.height = window.innerHeight
  }

  const swipeElement = swipeRef.value?.$el as HTMLElement
  if (swipeElement) {
    swipeElement.style.height = `${size.height}px`
  }

  if (swipeRef.value) {
    const swipeInstance = swipeRef.value as any
    swipeInstance?.resize()
  }
}

// 初始化视频播放器
const initializePlayer = () => {
  nextTick(() => {
    // 初始化视频播放器元素
    shakaVideoPlayerWrapper.value = document.getElementById('shakaVideoPlayerWrapper')
    videoPlayerElement.value = document.getElementById('shakaVideoPlayer')
    isInitialized.value = true

    // 设置真实播放状态，但确保组件可见
    if (props.visible) {
      setRealPlayState(true)
    }
  })
}

onMounted(() => {
  nextTick(() => {
    updateSize()

    if (window.ResizeObserver) {
      resizeObserver.value = new ResizeObserver(updateSize)
      if (containerRef.value) {
        resizeObserver.value.observe(containerRef.value)
      }
    } else {
      window.addEventListener('resize', updateSize)
    }

    // 初始化播放器
    initializePlayer()
  })

  watch(
    () => props.initialIndex,
    newVal => {
      activeIndex.value = newVal

      // 切换视频时，重置播放状态
      if (isInitialized.value && props.visible) {
        isRealPlay.value = false
        nextTick(() => {
          setRealPlayState(true)
        })
      }
    }
  )

  watch(
    () => props.visible,
    newVal => {
      if (newVal) {
        nextTick(() => {
          updateSize()
          // 如果尚未初始化，初始化播放器
          if (!isInitialized.value) {
            initializePlayer()
          } else {
            setRealPlayState(true)
          }
        })
      } else {
        isRealPlay.value = false
      }
    }
  )
})

onBeforeUnmount(() => {
  if (resizeObserver.value) {
    resizeObserver.value.disconnect()
    resizeObserver.value = null
  }
  window.removeEventListener('resize', updateSize)
})

const swipeStyle = computed(() => ({
  width: `${size.width}px`,
  height: `${size.height}px`,
}))

const onSwipeChange = (index: number) => {
  activeIndex.value = index

  // 重置真实播放状态，以触发视频切换
  isRealPlay.value = false

  // 使用nextTick确保DOM更新后再设置播放状态
  nextTick(() => {
    if (props.visible) {
      setRealPlayState(true)
    }
  })

  setTimeout(() => {
    emit('index-change', index)
  }, 0)
}

const handleClose = () => {
  emit('close')
}

const checkVisible = (index: number) => {
  const offset = index - activeIndex.value
  // 增加可见范围以确保更好的用户体验
  return offset >= -2 && offset <= 2 && props.visible
}

// 预加载辅助函数
const shouldPreload = (index: number) => {
  // 预加载当前视频前后三个视频
  const offset = index - activeIndex.value
  return offset >= -3 && offset <= 3 && props.visible
}

// 设置真实播放状态
const setRealPlayState = (isVisible: boolean) => {
  if (isVisible) {
    // 延迟设置播放状态，确保DOM和视频已准备好
    setTimeout(() => {
      isRealPlay.value = true

      // 尝试主动调用播放
      if (shakaVideoPlayerRef.value) {
        shakaVideoPlayerRef.value.play?.()
      }
    }, 800)
  } else {
    isRealPlay.value = false
  }
}

// 处理视频交互操作（点赞、收藏等）
const handleVideoAction = (video: VideoItem, action: string, value: boolean) => {
  // 发送事件通知父组件更新列表数据
  emit('video-action', {
    videoId: video.id,
    action,
    value,
    index: activeIndex.value,
  })
}

// 视频真实播放事件处理
const onRealPlay = () => {
  isRealPlay.value = true
}

const getVideoSrc = () => {
  const video = props.videos[activeIndex.value]
  const src = video?.videoPath || video?.videoUrl || video?.url
  return src
}

const getVideoPoster = () => {
  const video = props.videos[activeIndex.value]
  const poster = video?.poster || video?.preview
  return poster
}

const updateActionStatus = (item: any, action: FeedAction, status?: boolean) => {
  if (action === FeedAction.Like) {
    item.isLiked = status
    item.likeCount = status ? item.likeCount + 1 : item.likeCount - 1
    handleVideoAction(item, action, status || false) // 调用 handleVideoAction 方法
  } else if (action === FeedAction.Favorite) {
    item.isFavorite = status
    item.favoriteCount = status ? item.favoriteCount + 1 : item.favoriteCount - 1
    handleVideoAction(item, action, status || false) // 调用 handleVideoAction 方法
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
  <Teleport to="body">
    <div class="video-feed" v-show="visible" ref="containerRef">
      <!-- 共享视频播放器组件 -->
      <div class="shaka-video-player-wrapper" id="shakaVideoPlayerWrapper">
        <ShakaVideoPlayer
          id="shakaVideoPlayer"
          ref="shakaVideoPlayerRef"
          :src="getVideoSrc()"
          :poster="getVideoPoster()"
          :isActive="visible"
          :isMuted="isMuted"
          :shakaInstance="shakaInstance"
          @realPlay="onRealPlay"
        />
      </div>

      <Swipe
        ref="swipeRef"
        class="video-swipe"
        vertical
        :show-indicators="false"
        :style="swipeStyle"
        touchable
        :loop="false"
        :initial-swipe="initialIndex"
        @change="onSwipeChange"
      >
        <SwipeItem v-for="(video, index) in videos" :key="video.id" class="swipe-item">
          <VideoContent
            v-if="checkVisible(index)"
            :data="video"
            :isActive="activeIndex === index && visible"
            :fetchData="fetchData"
            :shakaVideoPlayerRef="shakaVideoPlayerRef"
            shakaVideoPlayerId="shakaVideoPlayer"
            :shakaVideoPlayerWrapper="shakaVideoPlayerWrapper"
            :videoPlayerElement="videoPlayerElement"
            :isRealPlay="isRealPlay && activeIndex === index"
            @like="(status: boolean) => updateActionStatus(video, FeedAction.Like, status)"
            @favorite="(status: boolean) => updateActionStatus(video, FeedAction.Favorite, status)"
            @comment="() => updateActionStatus(video, FeedAction.Comment)"
            @share="() => updateActionStatus(video, FeedAction.Share)"
            @follow="() => updateActionStatus(video, FeedAction.Follow)"
            :isFollowingAuthor="
              followingMap[video.userId] !== undefined
                ? followingMap[video.userId]
                : video.isFollowingAuthor
            "
          ></VideoContent>
          <!-- 预加载额外的视频但不激活它们 -->
          <template v-else-if="shouldPreload(index)">
            <div style="display: none">
              <VideoContent
                :data="video"
                :isActive="false"
                :fetchData="fetchData"
                :preload="true"
                :shakaVideoPlayerWrapper="shakaVideoPlayerWrapper"
                :videoPlayerElement="videoPlayerElement"
                :isRealPlay="false"
              ></VideoContent>
            </div>
          </template>
        </SwipeItem>
      </Swipe>

      <div class="close-button" @click="handleClose">
        <span class="material-icons">close</span>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="less">
.video-feed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background-color: #000;
  overflow: hidden;
}

.video-swipe {
  width: 100%;
  height: 100%;
  contain: strict;
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
}

.swipe-item {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  contain: content;
}

.close-button {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 10;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transform: translateZ(0);

  span {
    color: #fff;
    font-size: 24px;
  }
}

.shaka-video-player-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  z-index: 1;
  overflow: visible;
}

#shakaVideoPlayer {
  position: absolute;
  z-index: 11;
  // width: 100vw;
  // height: 100vh;
  top: 0;
  left: 0;
}

.loading-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 999;

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-text {
    color: #fff;
    margin-top: 16px;
    font-size: 16px;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
