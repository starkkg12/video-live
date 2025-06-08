<template>
  <div ref="observerRef" class="observed-component" />
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue'

  const emits = defineEmits<{
    change: [boolean]
  }>()

  const observerRef = ref<HTMLElement | null>(null)
  const parentContainer = ref<HTMLElement | null>(null)

  let lastScrollTop = 0 // 用于记录上次滚动的位置

  const onScroll = (event: Event) => {
    const scroller = event.target as HTMLElement
    const scrollTop = scroller.scrollTop

    // 判断是否向下滚动
    if (scrollTop > lastScrollTop) {
      emits('change', false)
    }
    // 判断是否接近最顶部
    if (scrollTop === 0) {
      emits('change', true) // 调用父组件传入的 @change 事件
    }
    lastScrollTop = scrollTop // 更新滚动位置
  }

  onMounted(() => {
    if (observerRef.value?.parentElement) {
      parentContainer.value = observerRef.value?.parentElement
      parentContainer.value.addEventListener('scroll', onScroll)
    }
  })
</script>

<style scoped>
  .observed-component {
    height: 0;
  }
</style>
