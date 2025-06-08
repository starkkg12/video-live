<script lang="ts" setup>
  import { onBeforeUnmount, onMounted, ref } from 'vue'

  // 定义组件的 props
  const props = defineProps<{
    parent: HTMLElement // 滚动的父容器
    offset?: number // 滚动时的偏移量，默认 0
  }>()

  // 组件根节点的引用
  const rootElement = ref<HTMLElement | null>(null)
  const timer = ref<any>()

  const scrollToNow = () => {
    if (rootElement.value && props.parent) {
      const { top: parentTop, left: parentLeft } = props.parent.getBoundingClientRect()
      const { top: childTop, left: childLeft } = rootElement.value.getBoundingClientRect()

      // 计算滚动位置
      const verticalScroll = props.parent.scrollTop + (childTop - parentTop) - (props.offset || 0)
      const horizontalScroll = props.parent.scrollLeft + (childLeft - parentLeft) - (props.offset || 0)

      // 平滑滚动到目标位置
      props.parent.scrollTo({
        top: verticalScroll,
        left: horizontalScroll,
        behavior: 'smooth',
      })
    } else {
      console.warn('Missing rootElement or parent container')
    }
  }

  // 在组件挂载时滚动到自己
  onMounted(() => {
    timer.value = setTimeout(scrollToNow, 300)
  })

  onBeforeUnmount(() => {
    timer.value && clearTimeout(timer.value)
  })
</script>

<template>
  <div ref="rootElement">
    <!-- 可直接放入内容 -->
  </div>
</template>

<style scoped>
  /* 自定义样式 */
</style>
