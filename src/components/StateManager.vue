<script setup lang="ts">
  import { Empty, Loading, Button } from 'vant'
  import { ref, watch, onBeforeUnmount } from 'vue'

  interface Props {
    loading?: boolean
    error?: boolean
  }
  const props = defineProps<Props>()

  const emit = defineEmits<{
    refresh: []
  }>()

  const showLoading = ref(false)
  let loadingTimeout: number | undefined

  // 监听 loading 属性变化，设置延迟
  watch(
    () => props.loading,
    newLoading => {
      if (newLoading) {
        // 如果 loading 为 true，设定延迟显示 loading
        loadingTimeout = window.setTimeout(() => {
          showLoading.value = true
        }, 300)
      } else {
        // 如果 loading 为 false，立即隐藏 loading 并清除定时器
        showLoading.value = false
        clearTimeout(loadingTimeout)
      }
    }
  )

  // 清理定时器
  onBeforeUnmount(() => {
    clearTimeout(loadingTimeout)
  })
</script>

<template>
  <Empty description="加载失败，请重试。" image="error" v-if="props.error">
    <Button round type="primary" @click="emit('refresh')">重新加载</Button>
  </Empty>
  <div class="wrapper--state-manager" v-else>
    <slot />
    <div class="loading-mask" :class="{ active: showLoading }">
      <loading class="loading" size="4rem" color="white" />
    </div>
  </div>
</template>

<style scoped>
  /* 全屏加载遮罩 */
  .loading-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: transparent;
    z-index: 999;
    display: flex;
    justify-content: center;
    align-items: center;

    /* 初始状态 */
    opacity: 0;
    visibility: hidden;

    /* 渐变效果 */
    transition:
      opacity 0.3s ease,
      visibility 0.3s ease;
  }

  /* 激活状态 */
  .loading-mask.active {
    opacity: 1;
    visibility: visible;
  }

  /* loading 样式 */
  .loading {
    background-color: rgba(0, 0, 0, 0.7);
    padding: 20px 17px;
    border-radius: 10px;
  }

  /* 内容区 */
  .wrapper--state-manager {
    height: 100%;
  }
</style>
