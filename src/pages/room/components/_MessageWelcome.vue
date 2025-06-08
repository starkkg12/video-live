<template>
  <div class="message-welcome-wrapper">
    <div class="message-welcome">
      <div class="message-welcome-title">群聊创建成功</div>
      <div class="message-welcome-text">恭喜你建群成功，点击下方按钮邀请更多好友入群</div>
      <div class="bottom-buttons">
        <Button type="success" plain class="button-invite" @click="handleInviteUsers">邀请好友</Button>
        <Button type="success" class="button-invite" @click="addHeat">热门推荐</Button>
      </div>
    </div>
  </div>
  <van-popup
    v-model:show="showPopup"
    class="popup-for-message-welcome popup-for-global"
    position="bottom"
    :round="false"
    teleport="body"
    transition="none"
  >
    <InviteUsers :room="room" @close="close" />
  </van-popup>
</template>

<script lang="ts" setup>
  import { ref } from 'vue'
  import { Popup as VanPopup, Button } from 'vant'
  import InviteUsers from './_InviteUsers.vue'

  const props = withDefaults(
    defineProps<{
      room?: any
    }>(),
    {}
  )
  const showPopup = ref<boolean>(false)

  const handleInviteUsers = () => {
    showPopup.value = true
  }
  const addHeat = async () => {
    props.room.addHeat()
  }
  const close = () => {
    showPopup.value = false
  }
</script>

<style scoped lang="less">
  @import '@/styles/variables.less';

  .message-welcome-wrapper {
    width: 100%;
    padding: 8px;
    .message-welcome {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: #fff;
      border-radius: 8px;
      padding: 30px 0;
      .message-welcome-title {
        font-size: 16px;
        font-weight: 600;
        color: @text-secondary;
      }
      .message-welcome-text {
        font-size: 14px;
        color: @text-grey;
      }
      .bottom-buttons {
        padding-top: 30px;
        gap: 20px;
      }
    }
  }
</style>
