<template>
  <div class="vip-level-wrapper">
    <van-image :src="vipBg.src" :height="`${size}px`" />
    <div class="vip-level">
      <van-image v-if="vipLevel === 1" :src="vip1.src" :height="`${size * 0.7}px`" />
      <van-image v-if="vipLevel === 2" :src="vip2.src" :height="`${size * 0.7}px`" />
      <van-image v-if="vipLevel === 3" :src="vip3.src" :height="`${size * 0.7}px`" />
      <van-image v-if="vipLevel === 4" :src="vip4.src" :height="`${size * 0.7}px`" />
      <van-image v-if="vipLevel === 5" :src="vip5.src" :height="`${size * 0.7}px`" />
      <van-image v-if="vipLevel === 6" :src="vip6.src" :height="`${size * 0.7}px`" />
      <van-image v-if="vipLevel === 7" :src="vip7.src" :height="`${size * 0.7}px`" />
      <van-image v-if="vipLevel === 8" :src="vip8.src" :height="`${size * 0.7}px`" />
      <van-image v-if="vipLevel === 9" :src="vip9.src" :height="`${size * 0.7}px`" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { Image as VanImage } from 'vant'
  import vipBg from '@/assets/icons/room/vip_bg.svg'
  import vip1 from '@/assets/icons/room/vip_1.svg'
  import vip2 from '@/assets/icons/room/vip_2.svg'
  import vip3 from '@/assets/icons/room/vip_3.svg'
  import vip4 from '@/assets/icons/room/vip_4.svg'
  import vip5 from '@/assets/icons/room/vip_5.svg'
  import vip6 from '@/assets/icons/room/vip_6.svg'
  import vip7 from '@/assets/icons/room/vip_7.svg'
  import vip8 from '@/assets/icons/room/vip_8.svg'
  import vip9 from '@/assets/icons/room/vip_9.svg'

  const props = withDefaults(
    defineProps<{
      vipLevel: number
      size?: number
    }>(),
    {
      vipLevel: 1,
      size: 24,
    }
  )
</script>

<style scoped lang="less">
  .vip-level-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    :deep(.van-image) {
      .van-image__img {
        width: auto;
        display: inline-block;
        vertical-align: top;
      }
    }
    .vip-level {
      position: absolute;
      right: 8%;
      top: 50%;
      transform: translateY(-49%);
      display: flex;
      align-items: center;
    }
  }
</style>
