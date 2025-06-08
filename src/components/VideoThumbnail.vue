<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const BASE_URL = 'https://devmedia0.s3.ap-northeast-1.amazonaws.com/'

const props = defineProps({
  src: {
    type: String,
    default: '',
  },
  width: {
    type: [Number, String],
    default: '20px',
  },
  height: {
    type: [Number, String],
    default: '20px',
  },
  borderRadius: {
    type: [Number, String],
    default: '4px',
  },
})

const videoRef = ref<HTMLVideoElement | null>(null)
const isLoaded = ref(false)

const fullSrc = computed(() => {
  if (!props.src) return ''

  if (props.src.startsWith('http')) {
    return props.src
  }

  return BASE_URL + props.src
})

onMounted(() => {
  if (videoRef.value) {
    // 确保只加载第一帧
    videoRef.value.addEventListener('loadeddata', () => {
      if (videoRef.value) {
        videoRef.value.currentTime = 0
        isLoaded.value = true
      }
    })
  }
})
</script>

<template>
  <div
    :style="{
      width: typeof props.width === 'number' ? `${props.width}px` : props.width,
      height: typeof props.height === 'number' ? `${props.height}px` : props.height,
      borderRadius:
        typeof props.borderRadius === 'number' ? `${props.borderRadius}px` : props.borderRadius,
    }"
  >
    <video
      ref="videoRef"
      :src="fullSrc"
      preload="metadata"
      muted
      playsinline
      :style="{
        opacity: isLoaded ? 1 : 0,
        width: '80px',
        height: '100%',
        objectFit: 'cover',
      }"
    ></video>
  </div>
</template>

<style scoped>
video {
  pointer-events: none; /* 禁止交互 */
  transition: opacity 0.3s;
}
</style>
