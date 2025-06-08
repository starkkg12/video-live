<script setup lang="ts">
import { ref, watch, onMounted, watchEffect, onBeforeUnmount } from 'vue'
import { Slider, Icon } from 'vant'
import authRequestInterceptor from '@/utils/interceptor/authRequestInterceptor'
import clientIdRequestInterceptor from '@/utils/interceptor/clientIdRequestInterceptor'
import manageSiteIdRequestInterceptor from '@/utils/interceptor/manageSiteIdRequestInterceptor'
import IconPlay from '@/assets/icons/short_video/player-play.svg'

// 定义 shaka 请求的类型
interface ShakaRequest {
  uris: string[]
  headers: Record<string, string>
  // 其他可能的属性...
}

// 定义 Shaka Player 类型
type ShakaPlayerType = {
  getNetworkingEngine: () => {
    registerRequestFilter: (
      filterFn: (type: number, request: ShakaRequest) => Promise<void>
    ) => void
  } | null
}

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  poster: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
  },
  isMuted: {
    type: Boolean,
    required: true,
  },
  shakaInstance: {
    type: Object,
    required: true,
  },
  showPlayButton: {
    type: Boolean,
    required: false,
    default: true
  },
  isLive: {
    type: Boolean,
    default: false
  },
  inLiveRoom: {
    type: Boolean,
    default: false
  }
})
// metadataLoaded: 直播列表判斷直播是否結束用
const emit = defineEmits(['play', 'pause', 'realPlay', 'metadataLoaded'])
const videoRef = ref<HTMLVideoElement | null>(null)
const duration = ref(0)
const sliderValue = ref(0)
const isDragging = ref(false)
const timer = ref<any>(null)
const timerLazyIsPlaying = ref<any>(null)
const timerPlay = ref<any>(null)
const lazyIsPlaying = ref(true)

// 使用 useShaka composable
const { player, videoElement, playerState, init, load, play, pause, seek, unload } =
  props.shakaInstance

// 为请求添加头部
const addCustomHeaders = async () => {
  if (!player.value) return

  // 添加网络过滤器，为 .key 文件添加请求头
  const shakaPlayer = player.value as unknown as ShakaPlayerType
  shakaPlayer
    .getNetworkingEngine()
    ?.registerRequestFilter(async (_type: number, request: ShakaRequest) => {
      // 检查请求是否为 .key 文件
      if (request.uris[0].endsWith('.key')) {
        let axiosConfig = { headers: {} } as any
        axiosConfig = await authRequestInterceptor(axiosConfig, 'jwt')
        axiosConfig = await clientIdRequestInterceptor(axiosConfig)
        axiosConfig = await manageSiteIdRequestInterceptor(axiosConfig)
        request.headers = axiosConfig.headers
      }
    })
}

// 修改 watch isActive 中的逻辑
watchEffect(() => {
  if (props.isActive && videoRef.value && props.src) {
    clearTimeout(timer.value)
    timer.value = setTimeout(() => {
      initVideo()
    }, 0)
  }
})

watch(
  () => props.isMuted,
  newValue => {
    if (videoElement.value) {
      // 使用类型断言
      ;(videoElement.value as HTMLVideoElement).muted = newValue
    }
  }
)

// 监听播放器状态来更新进度条
watch(
  () => playerState.currentTime,
  newTime => {
    if (!isDragging.value) {
      sliderValue.value = newTime
    }
  }
)

watch(
  () => playerState.duration,
  newDuration => {
    duration.value = newDuration
  }
)

watch(
  () => playerState.isPlaying,
  newVal => {
    if (newVal) {
      // emit('play')
      clearTimeout(timerLazyIsPlaying.value)
      lazyIsPlaying.value = true
    } else {
      // emit('pause')
      timerLazyIsPlaying.value = setTimeout(() => {
        lazyIsPlaying.value = false
      }, 500)
    }
  }
)
// 直播時跳轉到hls(.m3u8) 目前尾端(不是最後畫面)
// 原因：Cloudflare Stream 提供的 HLS 是 Sliding Window + 延遲邊界所以可能延遲數十秒到兩三分鐘
const seekToLiveEdge = () => {
  const video = videoElement.value as HTMLVideoElement
  if (!props.isLive || !video) return

  let tries = 0
  const maxTries = 20 
  const interval = setInterval(() => {
    tries++
    if (video.seekable.length > 0) {
      // 跳到hls(.m3u8) 目前尾端
      const liveEdge = video.seekable.end(0)
      video.currentTime = liveEdge
      clearInterval(interval)
    } else if (tries >= maxTries) {
      clearInterval(interval)
    }
  }, 100)
}

const initVideo = async () => {
  if (!props.src) return
  
  if (!props.shakaInstance.isPlayerReady.value) {
    // 初始化播放器
    await init(videoRef.value)
    // 添加自定义请求头
    await addCustomHeaders()
  }

  await unload()

  // 加载视频
  try {
    const currentSrc = props.src
    const result = await load(currentSrc)
    if (currentSrc !== props.src) return
    if (!result) {
      initVideo()
      return
    }
    if (props.isLive) {
      seekToLiveEdge()
    }

    // 如果处于活动状态，则手动播放
    if (props.isActive) {
      // 设置静音状态
      if (videoElement.value) {
        // 使用类型断言
        ;(videoElement.value as HTMLVideoElement).muted = true
      }
      // 短暂延迟确保浏览器已准备好播放
      clearTimeout(timerPlay.value)
      timerPlay.value = setTimeout(async () => {
        await play()
        emit('realPlay')
        if (!props.isMuted && videoElement.value) {
          ;(videoElement.value as HTMLVideoElement).muted = props.isMuted
        }
      }, 50)
    }
  } catch (error) {
    console.error('Error loading video:', error)
  }
}

// 修改 onMounted 中的逻辑
onMounted(async () => {
  if (videoRef.value && props.isActive) {
    initVideo()
  }
})

onBeforeUnmount(() => {
  clearTimeout(timer.value)
})

const playVideo = () => {
  if (props.isActive) {
    if (videoElement.value) {
      // 使用类型断言
      ;(videoElement.value as HTMLVideoElement).muted = props.isMuted
    }
    play()
    // emit('play')
  }
}

const pauseVideo = () => {
  pause()
  emit('pause')
}

const togglePlay = () => {
  if (props.isLive || props.inLiveRoom) {
    playVideo()
    return
  }  
  if (playerState.isPlaying) {
    pauseVideo()
  } else {
    playVideo()
  }
}

// 在 defineExpose 中添加 switchVideo 方法
defineExpose({
  play: () => {
    playVideo()
  },
  pause: () => {
    pauseVideo()
  },
  isPlaying: () => {
    return playerState.isPlaying
  },
})

const onSliderChange = (value: number) => {
  seek(value)
}

const onDragStart = () => {
  isDragging.value = true
  pauseVideo()
}

const onDragEnd = () => {
  isDragging.value = false
  seek(sliderValue.value)
  if (props.isActive) {
    playVideo()
  }
}

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}
</script>

<template>
  <div class="video-container">
    <div class="mask" @click="togglePlay()">
      <Icon :name="IconPlay.src" size="80" v-if="!lazyIsPlaying && showPlayButton" />
    </div>
    <video
      ref="videoRef"
      :poster="poster"
      :loop="!props.isLive"
      autoplay
      playsinline
      webkit-playsinline
      :muted="isMuted"
      @loadedmetadata="$emit('metadataLoaded', $event)"
      @play="emit('play')"
      @pause="emit('pause')"
    ></video>
    <div class="video-slider" v-if="!props.isLive">
      <Slider
        v-model="sliderValue"
        :max="duration"
        @change="onSliderChange"
        :bar-height="2"
        :button-size="40"
        @dragStart="onDragStart"
        @dragEnd="onDragEnd"
        activeColor="#fff"
        :class="{ 'is-dragging': isDragging }"
      />
      <div class="video-step">
        <span>{{ formatTime(sliderValue) }}</span>
        <span>{{ formatTime(duration) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.video-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.video-slider {
  position: absolute;
  bottom: 0px;
  width: 100%;
  padding: 8px 10px;
  z-index: 10;
  :deep(.van-slider__bar) {
    transition: all 0.3s linear;
  }
  :deep(.van-slider__button) {
    position: relative;
    background-color: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: none;
    z-index: 10;
    &::before {
      content: '';
      background-color: #fff;
      width: 4px;
      height: 4px;
      border-radius: 20px;
    }
  }
  .van-slider.is-dragging {
    :deep(.van-slider__button) {
      background-color: rgba(255, 255, 255, 0.2);
      &::before {
        width: 8px;
        height: 8px;
      }
    }
  }
}
.video-step {
  display: flex;
  justify-content: space-between;
  color: #fff;
  font-size: 10px;
}
.mask {
  position: absolute;
  z-index: 10;
  top: 0;
  bottom: 50px;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  i {
    opacity: 0.5;
  }
}
</style>
