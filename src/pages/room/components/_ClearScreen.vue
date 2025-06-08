<template>
  <div class="icon-wrapper" @click="toggleClear">
    <van-icon :name="eye.src" size="24px" color="#fff" />
  </div>
  <van-popup
    teleport="body"
    position="bottom"
    :show="showPopup"
    class="popup-for-quit-clear"
    transition="none"
    :overlay="false"
  >
    <div class="quit-clear-screen" v-if="showPopup">
      <div class="quit-button" @click="toggleClear">
        <van-icon :name="closeEye.src" size="18px" color="#ccc" />
        退出清屏
      </div>
    </div>
  </van-popup>
</template>

<script lang="ts" setup>
  import { onBeforeUnmount, ref } from 'vue'
  import { Icon as VanIcon, Popup as VanPopup } from 'vant'
  import eye from '@/assets/icons/room/eye.svg'
  import closeEye from '@/assets/icons/room/close_eye.svg'

  const props = withDefaults(
    defineProps<{
      room: any
    }>(),
    {
      room: null,
    }
  )
  const showPopup = ref<boolean>(false)
  const toggleClear = () => {
    showPopup.value = !props.room.custom.value.clearScreen
    props.room.install('clearScreen', !props.room.custom.value.clearScreen)
  }

  onBeforeUnmount(() => {
    props.room.uninstall('clearScreen')
  })
</script>

<style scoped lang="less">
  @bg-color: #1a1b1c80;
  .icon-wrapper {
    cursor: pointer;
    width: 40px;
    min-width: 40px;
    height: 40px;
    border-radius: 20px;
    background-color: @bg-color;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .popup-for-quit-clear {
    background-color: transparent;
    max-width: 600px;
    left: 50%;
    transform: translateX(-50%);
    .quit-clear-screen {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding: 8px;
      height: 50px;

      .quit-button {
        font-size: 14px;
        color: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0 8px;
        border-radius: 20px;
        height: 36px;
        background-color: @bg-color;
      }
    }
  }
</style>
