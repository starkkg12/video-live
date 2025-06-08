<template>
  <div class="heart-container" @click="createFlyingHeart">
    <!-- 静态的爱心图片 -->
    <van-icon :name="Heart.src" size="26px" class="heart" :color="'#FF8F28'" />
    <!-- 动态生成的飞行爱心 -->
    <van-icon
      v-for="heart in flyingHearts"
      :key="heart.id"
      :name="heart.icon"
      size="24px"
      class="flying-heart"
      :style="{
        color: heart.color,
        '--angle': `${heart.angle}deg`,
        '--path-angle': `${heart.pathAngle}deg`,
      }"
    />

    <!-- 固定位置的缩放动画爱心 -->
    <van-icon
      v-for="heart in scalingHearts"
      :key="`scaling-${heart.id}`"
      :name="heart.icon"
      size="24px"
      class="scaling-heart"
      :style="{
        color: heart.color,
      }"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, inject } from 'vue'
import { Icon as VanIcon } from 'vant'
import { type LiveRoomInterface } from '@/composables/useLiveRoom'
import Confetti from '@/assets/icons/live_room/confetti.png'
import Flower from '@/assets/icons/live_room/flower.png'
import Like from '@/assets/icons/live_room/like.png'
import Smile from '@/assets/icons/live_room/smile.png'
import Star from '@/assets/icons/live_room/star.png'
import Heart from '@/assets/icons/live_room/heart.png'

const room: LiveRoomInterface | undefined = inject('liveRoom')

// 可用的图标列表
const availableIcons = [Confetti.src, Flower.src, Like.src, Smile.src, Star.src]
// 可用的颜色列表
const availableColors = ['#FF8F28', '#FF4D4F', '#FF85C0', '#FFD700', '#FF69B4']

interface FlyingHeart {
  id: number
  icon: string
  color: string
  angle: number
  pathAngle: number // 添加飞行轨迹角度
}

interface ScalingHeart {
  id: number
  icon: string
  color: string
}

const flyingHearts = ref<FlyingHeart[]>([]) // 动态爱心数组
const scalingHearts = ref<ScalingHeart[]>([]) // 缩放动画爱心数组
let heartId = 0 // 唯一标识 ID

/**
 * 获取随机元素
 */
const getRandomElement = <T,>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * 生成随机角度 (-45 到 45 度之间)
 */
const getRandomAngle = (): number => {
  return Math.random() * 90 - 45
}

/**
 * 生成随机飞行轨迹角度
 * 相对于正上方（-110度）的偏移，范围在 -120 到 -60 度之间
 * 这样会形成一个更偏向正上方的扇形区域
 */
const getRandomPathAngle = (): number => {
  return -110 + (Math.random() * 60 - 30) // -90度是正上方，在此基础上随机偏移±30度
}

/**
 * 生成缩放动画爱心
 */
const createScalingHeart = () => {
  const currentId = heartId++
  const heart: ScalingHeart = {
    id: currentId,
    icon: getRandomElement(availableIcons),
    color: getRandomElement(availableColors),
  }

  scalingHearts.value.push(heart)

  // 0.7 秒后移除缩放爱心
  setTimeout(() => {
    scalingHearts.value = scalingHearts.value.filter(h => h.id !== currentId)
  }, 700)
}

/**
 * 生成飞行爱心
 */
const createFlyingHeart = () => {
  const currentId = heartId++
  const heart: FlyingHeart = {
    id: currentId,
    icon: getRandomElement(availableIcons),
    color: getRandomElement(availableColors),
    angle: getRandomAngle(),
    pathAngle: getRandomPathAngle(),
  }

  flyingHearts.value.push(heart)

  // 同时触发缩放动画
  createScalingHeart()

  room?.sendFlyingHeart()

  // 2 秒后移除飞行爱心
  setTimeout(() => {
    flyingHearts.value = flyingHearts.value.filter(h => h.id !== currentId)
  }, 2000)
}
</script>

<style scoped>
/* 容器样式 */
.heart-container {
  position: relative;
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background: transparent;
}

/* 静态的爱心 */
.heart {
  width: 24px;
  height: 24px;
  animation: pulse 1.2s infinite;
  position: relative;
  z-index: 10;
}

/* 飞行爱心 */
.flying-heart {
  position: absolute;
  width: 30px;
  height: 30px;
  animation: fly-and-fade 2s forwards;
  top: -20px;
}

/* 固定位置的缩放爱心 */
.scaling-heart {
  position: fixed;
  bottom: 200px;
  right: 24px;
  width: 24px;
  height: 24px;
  animation: scale-and-fade 0.7s forwards;
  z-index: 1000;
}

/* 飞行动画 */
@keyframes fly-and-fade {
  0% {
    opacity: 1;
    transform: translate(0, 0) scale(1) rotate(var(--angle));
  }
  50% {
    transform: translate(calc(60px * cos(var(--path-angle))), calc(120px * sin(var(--path-angle))))
      scale(1.5) rotate(var(--angle));
  }
  100% {
    opacity: 0;
    transform: translate(calc(100px * cos(var(--path-angle))), calc(200px * sin(var(--path-angle))))
      scale(2) rotate(var(--angle));
  }
}

/* 缩放消失动画 */
@keyframes scale-and-fade {
  0% {
    opacity: 0;
    transform: scale(0.5) rotate(20deg);
  }
  15% {
    opacity: 0.3;
    transform: scale(0.8) rotate(-15deg);
  }
  30% {
    opacity: 0.5;
    transform: scale(1) rotate(20deg);
  }
  45% {
    opacity: 0.75;
    transform: scale(1.5) rotate(-15deg);
  }
  70% {
    opacity: 1;
    transform: scale(2) rotate(20deg);
  }
  85% {
    opacity: 0.7;
    transform: scale(2.5) rotate(-10deg);
  }
  100% {
    opacity: 0;
    transform: scale(3) rotate(15deg);
  }
}

/* 心跳动画 */
@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}
</style>
