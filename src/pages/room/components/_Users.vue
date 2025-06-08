<template>
  <div class="room-users">
    <div class="user-list">
      <div class="user-item" v-for="(item, index) in room.userList?.value.slice(0, 3)" :key="index">
        <AvatarsPro :room="room" :user-id="item.userId" size="20px" />
      </div>
      <div class="show-all-users-button" @click="toggleShowAllUsers">更多</div>
    </div>
    <div class="operate-wrapper">
      <van-icon v-if="room.isOwner.value" name="cross" size="24px" color="#fff" @click="handleDeleteRoom" />
      <van-icon v-else name="cross" size="24px" color="#fff" @click="handleLeaveRoom" />
    </div>
  </div>

  <van-popup
    teleport="body"
    position="bottom"
    :show="showPopup"
    :onClose="toggleShowAllUsers"
    class="popup-for-global user-list-all-van-popup"
    :overlay-style="{ background: 'none' }"
    transition="none"
  >
    <UserList v-if="scene === 'userList'" :room="room" @changeScene="changeScene" @close="closePopup" />
    <InviteUsers v-else :room="room" @close="closePopup" @changeScene="changeScene" />
  </van-popup>
</template>

<script lang="ts" setup>
  import { ref } from 'vue'
  import { Icon as VanIcon, Popup as VanPopup } from 'vant'
  import InviteUsers from './_InviteUsers.vue'
  import UserList from './_UserList.vue'
  import AvatarsPro from '@/pages/room/components/_AvatarsPro.vue'
  import utils from '@/utils'

  const props = withDefaults(
    defineProps<{
      room: any
    }>(),
    {
      room: null,
    }
  )
  const showPopup = ref(false)
  const forceClose = ref(false)
  const scene = ref<string>('userList')

  const toggleShowAllUsers = () => {
    if (!props.room.userList?.value.length || forceClose.value) {
      forceClose.value = false
      return
    }
    showPopup.value = !showPopup.value
  }

  const changeScene = (s: string) => {
    scene.value = s
  }

  const closePopup = () => {
    if (scene.value === 'invite') {
      scene.value = 'userList'
    } else {
      forceClose.value = true
      showPopup.value = false
    }
  }

  const handleLeaveRoom = () => {
    props.room.leaveRoom(() => {
      utils.jumpTo('/room/list')
    })
  }

  const handleDeleteRoom = () => {
    props.room.deleteRoom(() => {
      utils.jumpTo('/room/list')
    })
  }
</script>

<style scoped lang="less">
  @import '@/styles/variables.less';

  .text-shadow {
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  }
  .room-users {
    display: flex;
    gap: 8px;
    align-items: center;
    .user-list {
      display: flex;
      gap: 4px;
      height: 32px;
      align-items: center;
      text-shadow: none;
      background-color: @bg-owner;
      border-radius: 16px;
      padding: 0 2px;
      .show-all-users-button {
        font-size: 12px;
        font-weight: 900;
        cursor: pointer;
        padding: 0 4px;
      }
      .user-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 8px;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
      }
    }
    .operate-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      .text-shadow;
    }
  }
  .user-list-all-van-popup {
    .user-list-all {
      overflow-y: auto;
      overflow-x: hidden;
      padding: 8px;
      max-height: calc(100vh - 120px);
      .user-big-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px;
        border-bottom: 1px solid @border-color;
        .danger-button {
          // height: 24px;
          font-size: 16px;
          background-color: @text-red;
          border: none;
          min-width: 60px;
        }
      }
    }
    .bottom-buttons {
      position: absolute;
      bottom: 8px;
      width: 100%;
      padding: 0 32px;
      .button-invite {
        :deep(.van-button__text) {
          font-size: 18px;
          font-weight: 600;
        }
      }
    }
  }
</style>
