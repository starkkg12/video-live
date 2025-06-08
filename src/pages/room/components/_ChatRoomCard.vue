<template>
  <div class="chat-room-card" @click="handleClick">
    <div class="chat-room-avatars">
      <AvatarsPro class="group-avatar" size="60px" :userIds="realUserIds" :room="room" :cacheData="cacheData" />
    </div>
    <div class="chat-room-title-total-note">
      <div class="chat-room-title-total">
        <div class="chat-room-title">{{ data?.title }}</div>
        <div class="chat-room-total">({{ room?.usersTotal.value || data?.userNum }})</div>
      </div>
      <div class="chat-room-note">{{ data?.note }}</div>
    </div>
    <div class="chat-room-right">
      <Button round v-if="chatNow" size="small" type="success" :name="arrowRightIcon.src">去聊天</Button>
      <div class="chat-room-create-time" v-else-if="data?.createTime">
        {{ utils.displayTime(data?.createTime, 10, 'YYYY-MM-DD') }}
      </div>
      <van-icon v-else :name="arrowRightIcon.src" size="30px" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, getCurrentInstance, computed, type Ref } from 'vue'
  import utils from '@/utils'
  import { Icon as VanIcon, Button } from 'vant'
  import { type RoomInterface } from '../constants'
  import AvatarsPro from '@/pages/room/components/_AvatarsPro.vue'
  import arrowRightIcon from 'src/assets/icons/arrow_right.svg'

  const props = withDefaults(
    defineProps<{
      data: RoomInterface | null
      room?: any
      cacheData?: any
      chatNow?: boolean
      userIds?: string[]
    }>(),
    {
      data: null,
    }
  )
  const instance = getCurrentInstance()
  const url = ref<string>(`/room/chat?roomId=${props.data?.roomId}`)

  const realUserIds: Ref<any[]> = computed(() => {
    return props.userIds || props.data?.onlineUserList || []
  })

  const handleClick = () => {
    if (instance?.attrs.onClick) return
    utils.jumpTo(url.value)
  }
</script>

<style scoped lang="less">
  @import '@/styles/variables.less';

  .chat-room-card {
    width: 100%;
    padding: 8px 12px;
    color: #333;
    text-shadow: none;
    border-radius: 8px;
    box-shadow: 0px 0px 6px 0px #0000001a;
    display: flex;
    align-items: center;
    gap: 8px;
    .chat-room-title-total-note {
      width: calc(100% - 130px);
    }
    .chat-room-title {
      font-size: 18px;
      font-weight: 900;
      .text-overflow;
    }
    .chat-room-total {
      font-size: 16px;
      font-weight: 600;
    }
    .chat-room-note {
      font-size: 13px;
      color: #7f7f7f;
      .text-overflow;
    }
    .chat-room-title-total {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .van-button {
      white-space: nowrap;
      height: 24px;
    }
    .chat-room-right {
      max-width: 70px;
    }
    .chat-room-create-time {
      font-size: 12px;
      color: @text-grey;
      width: 100%;
      .text-overflow;
    }
  }
</style>
