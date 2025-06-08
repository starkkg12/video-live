<script setup lang="ts">
  import { ref, watch, onMounted } from 'vue'
  import { Slider } from 'vant'

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
  })

  const emit = defineEmits(['play', 'pause'])
  const videoPlayer = ref<HTMLVideoElement | null>(null)
  const duration = ref(0)
  const sliderValue = ref(0)

  // 拖动状态
  const isDragging = ref(false)

  watch(
    () => props.isActive,
    newValue => {
      if (newValue) {
        playVideo()
      } else {
        pauseVideo()
      }
    }
  )
  watch(
    () => props.isMuted,
    newValue => {
      if (videoPlayer.value) {
        videoPlayer.value.muted = newValue
      }
    }
  )

  onMounted(() => {
    if (props.isActive) {
      playVideo()
    }
  })

  const playVideo = () => {
    if (videoPlayer.value && props.isActive) {
      videoPlayer.value.play()
      emit('play')
    }
  }

  const pauseVideo = () => {
    if (videoPlayer.value) {
      videoPlayer.value.pause()
      emit('pause')
    }
  }

  defineExpose({
    play: () => {
      playVideo()
    },
    pause: () => {
      pauseVideo()
    },
    isPlaying: () => {
      return videoPlayer.value?.paused === false
    },
  })

  const onLoadedMetadata = () => {
    if (videoPlayer.value) {
      duration.value = videoPlayer.value.duration
    }
  }

  const onTimeUpdate = () => {
    if (!isDragging.value && videoPlayer.value) {
      sliderValue.value = videoPlayer.value.currentTime
    }
  }

  const onSliderChange = (value: number) => {
    if (videoPlayer.value) {
      videoPlayer.value.currentTime = value
    }
  }

  const onDragStart = () => {
    isDragging.value = true
    pauseVideo()
  }

  const onDragEnd = () => {
    isDragging.value = false
    if (videoPlayer.value) {
      videoPlayer.value.currentTime = sliderValue.value
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
    <video
      ref="videoPlayer"
      :src="src"
      :autoplay="false"
      :playsinline="true"
      :poster="poster"
      loop
      :muted="isMuted"
      @play="onPlay"
      @pause="onPause"
      @loadedmetadata="onLoadedMetadata"
      @timeupdate="onTimeUpdate"
    ></video>
    <div class="video-slider">
      <Slider
        v-model="sliderValue"
        :max="duration"
        @change="onSliderChange"
        :bar-height="6"
        :button-size="10"
        @dragStart="onDragStart"
        @dragEnd="onDragEnd"
      />
      <div class="video-step">
        <span>{{ formatTime(sliderValue) }}</span>
        <span>{{ formatTime(duration) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
    padding: 10px;
    z-index: 10;
  }

  .video-step {
    display: flex;
    justify-content: space-between;
    color: #fff;
    font-size: 10px;
  }
</style>
