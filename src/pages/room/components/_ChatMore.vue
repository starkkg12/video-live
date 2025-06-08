<template>
  <div class="icon-wrapper"><van-icon :name="moreVerticalIcon.src" size="20px" @click="toggleShow" /></div>
  <van-popup
    v-model:show="showPopup"
    class="popup-for-global popup-for-more"
    position="bottom"
    :round="false"
    teleport="body"
  >
    <ChatMoreConfig v-if="scene === 'config'" :room="room" @close="close" @changeScene="changeScene" />
    <ChatMoreInfo v-else-if="scene === 'info'" :room="room" @close="close" @changeScene="changeScene" />
    <UserList v-else-if="scene === 'userList'" :room="room" @close="close" @changeScene="changeScene" />
    <UserList v-else-if="scene === 'batchKick'" is-batch-kick :room="room" @close="close" @changeScene="changeScene" />
    <InviteUsers v-else-if="scene === 'invite'" :room="room" @close="close" @changeScene="changeScene" />
  </van-popup>
</template>

<script lang="ts" setup>
  import { ref } from 'vue'
  import { Icon as VanIcon, Popup as VanPopup } from 'vant'
  import ChatMoreConfig from './_ChatMoreConfig.vue'
  import ChatMoreInfo from './_ChatMoreInfo.vue'
  import UserList from './_UserList.vue'
  import InviteUsers from './_InviteUsers.vue'
  import moreVerticalIcon from '@/assets/icons/room/more_vertical.svg'

  const props = withDefaults(
    defineProps<{
      room: any
    }>(),
    {
      room: null,
    }
  )

  export type ChatMoreSceneType = 'config' | 'info' | 'userList' | 'invite' | 'batchKick'

  const showPopup = ref<boolean>(false)
  const scene = ref<ChatMoreSceneType>('config')

  const toggleShow = () => {
    showPopup.value = !showPopup.value
  }

  const changeScene = (s: ChatMoreSceneType) => {
    scene.value = s
  }

  const close = () => {
    if (scene.value === 'config') {
      showPopup.value = false
    } else {
      scene.value = 'config'
    }
  }
</script>

<style scoped lang="less">
  @import '@/styles/variables.less';

  .icon-wrapper {
    cursor: pointer;
    width: 32px;
    min-width: 32px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .popup-for-more {
    .more-buttons {
      .group-title {
        font-size: 16px;
        color: @text-primary;
        padding: 16px 16px 8px;
        font-weight: 600;
      }
      & > div {
        background-color: transparent;
        padding-left: 24px;
        :deep(.van-cell__title) {
          color: @text-primary;
          font-size: 16px;
        }
      }
    }
    .nav-bar {
      :deep(.van-nav-bar__title) {
        color: @text-primary;
        font-size: 18px;
      }
      &::after {
        border-color: transparent;
      }
    }
  }
  .popup-for-more {
  }
</style>
