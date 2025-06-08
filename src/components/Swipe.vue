<script setup lang="ts">
  // ! CSR
  import { Swipe, SwipeItem, Image } from 'vant'

  interface Props {
    images: ImageMetadata[]
  }

  defineProps<Props>()
</script>

<template>
  <div class="wrapper-swipe">
    <Swipe class="swipe" :autoplay="3000" indicator-color="white" lazy-render>
      <SwipeItem v-for="img of images" :key="img.src">
        <Image :src="img.src" />
      </SwipeItem>
    </Swipe>
  </div>
</template>

<style scoped>
  .wrapper-swipe {
    line-height: 0;
  }
  .swipe {
    width: 100%;
  }
</style>
