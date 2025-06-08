<template>
  <div class="chat-more-config">
    <NavBar safe-area-inset-top placeholder class="nav-bar" title="聊天室设置" left-arrow @click-left="emit('close')" />
    <div class="more-room-info">
      <div class="group-avatar-wrapper">
        <ChatRoomCard :data="room.info.value" :user-ids="userIds" :room="room" @click="emit('changeScene', 'info')" />
      </div>
      <div class="users-header">
        <div class="users-title">聊天室成员({{ room.usersTotal.value }})</div>
        <div class="users-all-button" @click="emit('changeScene', 'userList')">
          全部
          <van-icon :name="arrowRightIcon.src" size="20px" />
        </div>
      </div>
      <div class="users-list">
        <div v-for="(item, index) in userList" :key="index" class="user-item" @click="showUserInfo(item.userId)">
          <AvatarsPro :room="room" :user-id="item.userId" has-flag size="50px" />
          <div class="user-nickname">{{ utils.getNickname(item.nickname, item.userId) }}</div>
        </div>
        <div class="user-item batch-kick-button" @click="emit('changeScene', 'batchKick')" v-if="room.isOwner.value">
          <div class="icon-minus-wrapper"><van-icon name="minus" size="24px" color="#434343" /></div>
          <div class="user-nickname">移除</div>
        </div>
      </div>
      <div class="mute-cell">
        <van-cell center title="全员禁言">
          <template #right-icon>
            <van-switch
              v-model="muteStateChecked"
              @change="handleSilentSwitch"
              size="24"
              activeColor="#34C759"
              inactiveColor="#AEAEB1"
            />
          </template>
        </van-cell>
      </div>
    </div>
    <div class="bottom-buttons">
      <Button type="danger" block @click="leaveRoom" v-if="!room.isOwner.value">退出聊天室</Button>
      <Button type="success" block @click="emit('changeScene', 'invite')" v-else>邀请好友</Button>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, type Ref } from 'vue'
  import { Button, NavBar, Icon as VanIcon, Cell as VanCell, Switch as VanSwitch } from 'vant'
  import ChatRoomCard from './_ChatRoomCard.vue'
  import AvatarsPro from '@/pages/room/components/_AvatarsPro.vue'
  import { type RoomInterface } from 'src/composables/useRoom'
  import utils from '@/utils'
  import arrowRightIcon from 'src/assets/icons/arrow_right.svg'
  import service from '@/service'

  const props = withDefaults(
    defineProps<{
      room: RoomInterface
    }>(),
    {}
  )

  const emit = defineEmits<{
    close: []
    changeScene: [scene: 'config' | 'info' | 'userList' | 'invite' | 'batchKick']
  }>()

  const muteStateChecked = ref<boolean>(!props.room.canSend.value)

  const userIds: Ref<string[]> = computed(() => {
    return (props.room.userList.value ?? []).slice(0, 9).map((item: { userId: string }) => item?.userId)
  })

  const userList = computed(() => {
    const list = userIds.value.map((id: string) => props.room.usersDictionary.value[id] ?? { userId: id })
    return list
  })

  const showUserInfo = (userId: string) => {
    props.room.custom.value?.showUserInfo(userId)
  }

  const leaveRoom = () => {
    props.room.leaveRoom(() => {
      utils.jumpTo('/room/list?type=CHAT')
    })
  }

  const handleSilentSwitch = (checked: boolean) => {
    utils
      .chain()
      .fetch(
        service.room.toggleMute,
        {
          roomId: props.room.id.value,
          mute: checked,
        },
        `已经${checked ? '开启' : '关闭'}禁言`
      )
      .next(() => {
        muteStateChecked.value = checked
      })
  }
</script>

<style scoped lang="less">
  @import '@/styles/variables.less';

  .chat-more-config {
    display: flex;
    flex-direction: column;
    height: 100%;
    .more-room-info {
      background-color: #fff;
      height: 100%;
      .group-avatar-wrapper {
        padding: 8px;
      }
      .mute-cell {
        .van-cell {
          padding: 10px;
        }
      }
    }
    .users-header {
      padding: 8px;
      display: flex;
      justify-content: space-between;
      .users-title {
        font-size: 16px;
        font-weight: 600;
      }
      .users-all-button {
        font-size: 14px;
        color: @text-secondary;
        display: flex;
        align-items: center;
        line-height: 20px;
      }
    }
    .users-list {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      padding: 8px;
      .user-item {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 60px;
        gap: 4px;
        .user-nickname {
          font-size: 12px;
          color: @text-primary;
          width: 100%;
          text-align: center;
          .text-overflow;
        }
      }
      .batch-kick-button {
        .icon-minus-wrapper {
          width: 50px;
          height: 50px;
          border: 1px solid @text-grey;
          border-radius: 25px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
    }
  }
</style>
