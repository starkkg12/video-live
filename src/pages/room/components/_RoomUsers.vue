<template>
  <div class="room-users">
    <div class="user-list" @click="toggleShowAllUsers">
      <div class="user-item"  v-for="(item, index) in room.viewers?.value.slice(0, 3)" :key="index">
        <AsyncImage
            class="user-avatar"
            :src="utils.getImageUrl(item?.userAvatar, 'avatar')"
            round
            alt=""
            :class="{ 'has-border': 'false' }"
            :style="{ 'width': '30px', 'height': '30px', 'min-width': '30px', 'min-height': '30px', 'border-color': 'transparent'}"
          />
      </div>
      <div class="show-all-users-button count" v-if="room.usersTotal.value > 0">
        {{ room.usersTotal }}
      </div>
    </div>
    <div class="operate-wrapper">
      <van-icon name="cross" size="24px" color="#fff" @click="handleLeaveRoom" />
    </div>
  </div>
  <ActionSheet v-model:show="showPopup" @close="toggleShowAllUsers">
    <div class="user-info-popup">
      <div class="content">
         <div class="content-title">
            在线观众
         </div>
         <RoomUserList 
           :room="room" 
           @changeScene="changeScene" 
           @close="closePopup" 
           @onFollowPopup="showFollowPopup"
           />
      </div>
    </div> 
  </ActionSheet>

</template>

<script lang="ts" setup>
  import { computed, onMounted, ref } from 'vue'
  import { ActionSheet, Icon as VanIcon, Popup as VanPopup } from 'vant'
  import AsyncImage from '@/components/AsyncImage.vue'

  import RoomUserList from './_RoomUserList.vue'
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
  const emit = defineEmits(['onFollowPopup', 'close'])
  const usersDictionary = computed(() => {
    return props.room?.usersDictionary.value || {}
  })
  const showPopup = ref(false)
  const scene = ref<string>('userList')

  const toggleShowAllUsers = async () => {
    if (showPopup.value) {
      showPopup.value = false
      return
    } else {
      await props.room.getUserList()
      showPopup.value = true
    }  
  }

  const changeScene = (s: string) => {
    scene.value = s
  }

  const closePopup = () => {
    if (scene.value === 'invite') {
      scene.value = 'userList'
    } else {
      showPopup.value = false
    }
  }

  const handleLeaveRoom = () => {
     emit('close')
    //window.history.back()
  }

  const showFollowPopup = (userId: string) =>{
    emit('onFollowPopup', userId)
  }
</script>

<style scoped lang="less">
  @import '@/styles/variables.less';
  .user-info-popup {
    background: #fff;
    padding: 10px 0;
    max-width: 100%;
    h3.comment-title {
      text-align: center;
      padding-bottom: 10px;
    }
    .content {
      // padding: 20px 0;
      color: #323233!important;
    }
    .content-title {
      font-size: 16px;
      text-align: center;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .personal-info {
      padding: 8px 0;
      border-bottom: 1px solid #eee;
      display: flex;
      align-items: center    
    }
    .padding-left-right {
      padding-left: 20px !important;
      padding-right: 20px !important;
    }
    .left-avatar {
      width: 68px;
      height: 68px;
      border-radius: 50%;
      overflow: hidden;
    }
    .right-info {
      margin-left: 12px;
    }
    .nickname-box {
      margin-bottom: 2px;
      align-items: center;
      display: flex;
    }
    .nickname-box .nickname {
      font-size: 16px;
      font-family: Arial Bold, Arial Normal, Arial, sans-serif;
      font-weight: 600;
      color: #333;
    }
    .user-id-box {
      margin-bottom: 2px;
      align-items: center;
      display: flex;
    }
    .user-id-box .user-id {
      font-size: 12px;
      color: #323233;
    }
    .sex-icon {
      font-size: 8px;
      padding: 1px 4px;
      width: fit-content;
      border-radius: 4px;
      background: #f0f0f0
    }
    .data-info-box {
      align-items: center;
      display: flex;
    }
    .data-info {
      padding: 8px 0;
      font-size: 14px;
    }
    .data-info-item {
      margin-right: 20px;
      display: flex;
    }
    .data-info .data-info-item .data {
      color: #333;
      font-weight: 700
    }
    .data-info .data-info-item .desc {
      margin-left: 2px;
      color: #797979
    }
    .remark-box {
      margin-top: 10px;
    }
    .remark-box .remark {
      font-size: 12px;
      white-space: pre-wrap;
    }
    .btn-box {
      margin-top: 12px;
      color: #000;
    }
    .btn-box .btn {
      display: flex;
      width: 100%;
      height: 28px;
      color: #fff;
      border-radius: 6px;
      background: rgb(235, 77, 96);
      border: none;
      align-items: center;
      justify-content: center;

    }
    .is-follow {
      background: rgb(240, 240, 240)!important;
    }
  }  
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
    background: var(--van-text-color);
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
  .count {
    font-weight: 500;
    font-size: 14px;
    color: #fff;
    background: #74747499;
    border-radius: 50%;
    line-height: 34px;
    text-align: center;
    width: 30px;
    height: 30px;
    line-height: 30px;
  }
  
</style>
