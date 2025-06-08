<template>
  <div class="join-animation-container">
    <div
      v-if="currentItem"
      ref="animatedElement"
      class="animated-item"
      :class="{ playing: isAnimating }"
      @animationend="onAnimationEnd"
    >
      <!-- 渲染当前正在动画的内容 -->
      <div class="content">
        <MessageContent :item="currentItem" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import MessageContent from './_MessageContent.vue'

// Props and emits for v-model
interface Props {
  modelValue: any[]
}

interface Emits {
  (e: 'update:modelValue', value: any[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 动画元素的引用
const animatedElement = ref<HTMLElement>()

// 当前动画的元素和索引
const currentItem = ref<any>(null)
const currentIndex = ref(0)
const isAnimating = ref(false)

// 内部数组副本
const itemQueue = ref<any[]>([...props.modelValue])

const startAnimation = () => {
  if (itemQueue.value.length === 0) {
    currentItem.value = null
    isAnimating.value = false
    return
  }

  // 获取下一个要动画的元素
  currentItem.value = itemQueue.value[0]

  nextTick(() => {
    // 触发CSS动画
    isAnimating.value = true
  })
}

const onAnimationEnd = () => {
  isAnimating.value = false

  // 从队列中移除已完成的元素
  const newQueue = [...itemQueue.value]
  newQueue.shift()
  itemQueue.value = newQueue

  // 更新v-model
  emit('update:modelValue', newQueue)

  // 开始下一个动画
  setTimeout(() => {
    startAnimation()
  }, 100) // 短暂延迟后开始下一个
}

// 监听v-model变化
watch(
  () => props.modelValue,
  newValue => {
    const oldLength = itemQueue.value.length
    itemQueue.value = [...newValue]

    // 如果有新元素加入且当前没有动画在进行，开始动画
    if (newValue.length > oldLength && !isAnimating.value) {
      startAnimation()
    }
  },
  { immediate: true }
)

onMounted(() => {
  // 如果有初始数据，开始动画
  if (itemQueue.value.length > 0) {
    setTimeout(() => {
      startAnimation()
    }, 100)
  }
})
</script>

<style scoped>
.join-animation-container {
  position: relative;
  width: 100%;
  height: 100px;
  overflow: hidden;
}

.animated-item {
  position: absolute;
  top: 50%;
  transform: translateY(-50%) translateX(100vw);
  /* 启用硬件加速 */
  will-change: transform;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.animated-item.playing {
  /* 触发CSS动画 */
  animation: flyInAndOut 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

/* 定义完整的动画关键帧 */
@keyframes flyInAndOut {
  /* 0-40%: 从右边快速进入，元素左边到达窗口左边，使用自定义贝塞尔曲线减速 */
  0% {
    transform: translateY(-50%) translateX(100vw);
  }
  40% {
    transform: translateY(-50%) translateX(12px);
  }
  /* 40-60%: 在窗口左边停留 */
  60% {
    transform: translateY(-50%) translateX(12px);
  }
  /* 60-100%: 慢慢加速离开视窗 */
  100% {
    transform: translateY(-50%) translateX(-100%);
  }
}

.content {
  font-size: 14px;
  padding: 0 8px;
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  backdrop-filter: blur(10px);
  white-space: nowrap;
  background-color: #6159d5;
}
</style>
