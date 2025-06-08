<template>
  <van-image class="add-heat" :src="addHeatImg.src" @click="addHeat" height="24px" />
</template>

<script lang="ts" setup>
  import { Image as VanImage } from 'vant'
  import addHeatImg from '@/assets/images/room/add_heat.png'

  const props = withDefaults(
    defineProps<{
      room: any
    }>(),
    {
      room: null,
    }
  )

  const addHeat = async () => {
    props.room.addHeat()
  }
</script>

<style scoped lang="less">
  .add-heat {
    :deep(img) {
      object-fit: contain;
    }
  }
</style>
