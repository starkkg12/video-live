<template>
  <van-popup
    :show="true"
    class="popup-for-iframe-wrapper popup-for-global"
    position="bottom"
    teleport="body"
    transition="none"
    v-on:close="emit('close')"
    :closeable="false"
    v-if="isPopup && src"
  >
    <div class="iframe-wrapper">
      <Loading class="loading-center" v-if="isLoading" color="#34c759" size="40px" />
      <div @click="emit('close')" class="overwrite-back-button"></div>
      <iframe :src="src" class="iframe-for-content" :class="{ 'is-loading': isLoading }" />
    </div>
  </van-popup>
  <div class="iframe-wrapper">
    <Loading class="loading-center" v-if="isLoading" color="#34c759" size="40px" />
    <div @click="emit('close')" class="overwrite-back-button"></div>
    <iframe :src="src" class="iframe-for-content" :class="{ 'is-loading': isLoading }" />
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, ref } from 'vue'
  import { Popup as VanPopup, Loading } from 'vant'

  const props = withDefaults(
    defineProps<{
      src: string
      isPopup?: boolean
    }>(),
    {
      src: '',
      isPopup: false,
    }
  )

  const emit = defineEmits<{
    close: [type?: 'all']
  }>()

  const isLoading = ref<boolean>(true)

  onMounted(() => {
    setTimeout(() => (isLoading.value = false), 700)
  })
</script>

<style scoped lang="less">
  @import '@/styles/variables.less';

  .iframe-wrapper {
    position: relative;
    height: 100%;
    .overwrite-back-button {
      position: absolute;
      top: 2px;
      left: 4px;
      width: 40px;
      height: 40px;
      z-index: 10;
    }
    .iframe-for-content {
      height: 100%;
      width: 100%;
      border: none;
      &.is-loading {
        visibility: hidden;
      }
    }
    .loading-center {
      position: absolute;
      width: 100%;
      height: 100%;
      z-index: 10;
    }
  }
</style>
