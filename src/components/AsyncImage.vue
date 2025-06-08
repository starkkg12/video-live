<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { Image, Loading, type ImageProps } from 'vant'

  interface Props extends Omit<Partial<ImageProps>, 'src'> {
    src: string | (() => Promise<string>) | Promise<string>
    isBg?: boolean | null
  }

  const props = withDefaults(defineProps<Props>(), {
    isBg: false,
  })

  const emit = defineEmits<{ complete: [] }>()

  const isLoading = ref(false) // 是否正在加载图片

  const resolvedSrc = ref('') // 保存解析后的 src

  let currentRequestId = 0 //  用于追踪当前的加载请求

  const loadImage = async () => {
    const requestId = ++currentRequestId // 为每次加载生成唯一的请求 ID
    isLoading.value = true
    try {
      let src
      if (typeof props.src === 'function') {
        src = await props.src()
      } else if (props.src instanceof Promise) {
        src = await props.src
      } else {
        src = props.src
      }
      emit('complete') // 触发 complete 事件
      // 确保当前请求是最新的
      if (requestId === currentRequestId) {
        resolvedSrc.value = src
      }
    } catch (error) {
      console.group('图片加载失败')
      console.error('src:', props.src)
      console.error(error)
      console.groupEnd()
      if (requestId === currentRequestId) {
        resolvedSrc.value = '' // 出错时清空 src
      }
    } finally {
      isLoading.value = false
    }
  }

  watch(() => props.src, loadImage, { immediate: true })
</script>

<template>
  <Loading v-if="isLoading" class="loading" type="spinner" />
  <div v-else-if="props.isBg" :style="`background-image: url(${resolvedSrc})`" />
  <Image v-else v-bind="props" :src="resolvedSrc">
    <template #loading>
      <Loading class="loading" type="spinner" />
    </template>
  </Image>
</template>

<style scoped lang="less">
  .loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    justify-content: center;
    align-items: center;
    :deep(.van-loading__spinner) {
      max-width: 80%;
      max-height: 80%;
      min-width: 16px;
      min-height: 16px;
    }
  }
</style>
