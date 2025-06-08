<script setup lang="ts">
import { computed } from 'vue'
import { Image } from 'vant'

const BASE_URL = 'https://devmedia0.s3.ap-northeast-1.amazonaws.com/'

// 添加类型定义解决 fit 属性报错
type ObjectFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'

const props = defineProps({
  src: {
    type: String,
    default: '',
  },
  round: {
    type: Boolean,
    default: false,
  },
  avatar: {
    type: Boolean,
    default: false,
  },
  width: {
    type: [Number, String],
    default: '100%',
  },
  height: {
    type: [Number, String],
    default: 'auto',
  },
  maxWidth: {
    type: [Number, String],
    default: '100%',
  },
  maxHeight: {
    type: [Number, String],
    default: 'none',
  },
  fit: {
    type: String as () => ObjectFit,
    default: 'cover',
  },
  errorImage: {
    type: String,
    default: '',
  },
})

const isRound = computed(() => props.round || props.avatar)

const fullSrc = computed(() => {
  if (!props.src) return ''

  if (props.src.startsWith('http')) {
    return props.src
  }

  return BASE_URL + props.src
})

// 计算容器样式
const containerStyle = computed(() => {
  return {
    maxWidth: typeof props.maxWidth === 'number' ? `${props.maxWidth}px` : props.maxWidth,
    maxHeight: typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight,
    display: 'inline-block',
    overflow: 'hidden',
  }
})
</script>

<template>
  <div :style="containerStyle">
    <Image
      :src="fullSrc"
      :round="isRound"
      :width="width"
      :height="height"
      :fit="fit"
      :class="{ 'avatar-style': avatar }"
      v-bind="$attrs"
    />
  </div>
</template>

<style scoped>
.avatar-style {
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
</style>
