<template>
  <div class="icon-wrapper">
    <van-icon class="interactive-button" :name="interactive.src" size="20px" @click="toggleShow" />
  </div>
  <van-popup
    v-model:show="showPopup"
    class="popup-for-global"
    position="bottom"
    :round="scene !== 'picture'"
    teleport="body"
    :class="{ 'height-auto': scene !== 'picture' }"
  >
    <InteractiveHome v-if="scene === 'home'" :room="room" @close="close" @changeScene="changeScene" />
    <InteractiveComment v-else-if="scene === 'comment'" :room="room" @close="close" />
    <InteractiveLotteryHistory v-else-if="scene === 'history'" :room="room" @close="close" />
    <InteractivePicture v-else-if="scene === 'picture'" :room="room" @close="close" />
    <InteractiveChangeVoice v-else-if="scene === 'changeVoice'" :room="room" @close="close" />
  </van-popup>
</template>

<script lang="ts" setup>
  import { ref } from 'vue'
  import { Icon as VanIcon, Popup as VanPopup, NavBar } from 'vant'
  import InteractiveHome from './_InteractiveHome.vue'
  import InteractiveLotteryHistory from './_InteractiveLotteryHistory.vue'
  import InteractiveComment from './_InteractiveComment.vue'
  import InteractivePicture from './_InteractivePicture.vue'
  import InteractiveChangeVoice from './_InteractiveChangeVoice.vue'
  import interactive from '@/assets/icons/room/interactive.svg'

  const props = withDefaults(
    defineProps<{
      room: any
    }>(),
    {
      room: null,
    }
  )

  const showPopup = ref<boolean>(false)
  const scene = ref<string>('home')

  const toggleShow = () => {
    showPopup.value = !showPopup.value
    scene.value = 'home'
  }

  const changeScene = (s: string) => {
    scene.value = s
  }

  const close = (type?: 'all') => {
    if (type === 'all' || /^(home)$/.test(scene.value)) {
      showPopup.value = false
    }
    scene.value = 'home'
  }
</script>

<style scoped lang="less">
  @import '@/styles/variables.less';

  .popup-for-interactive {
    max-width: 600px;
    left: 50%;
    transform: translateX(-50%);
  }
  .icon-wrapper {
    cursor: pointer;
    width: 40px;
    min-width: 40px;
    height: 40px;
    border-radius: 20px;
    background-color: @bg-owner;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
