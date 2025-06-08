<template>
  <div class="wrapper">
    <div class="main-content" ref="mainContentRef">
      <div class="room-bar" v-if="!room.custom.value.clearScreen">
        <div class="room-left">
          <div class="room-owner">
            <WaveDance :has-voice="room?.micVoiceStatus.value[room.ownerId.value]">
              <AvatarsPro @click="showUserInfo" :room="room" :user-id="room.ownerId.value" size="30px" />
            </WaveDance>
            <div class="nickname-heat">
              <span class="nickname-text">
                {{ room.ownerId.value ? utils.getNickname(room.owner.value?.nickname, room.ownerId.value) : '' }}
              </span>
              <span>{{ utils.numberFormat(room.usersTotal.value ?? 0) }}人在看</span>
            </div>
            <Follow
              v-if="!room.isOwner.value && room.ownerId.value"
              :user-id="room.ownerId.value"
              cancelText="已关注"
              text="+关注"
              :is-follow="room.followedOwner.value"
              @change="room.getRelationWithOwner"
            />
          </div>
          <AddHeat v-if="room.info.value && room.isOwner.value" :room="room" />
        </div>
        <Users v-if="room.info.value" :room="room" />
      </div>
      <OnMicUsers
        v-if="room.info.value && !room.custom.value.clearScreen && !room.isAnonymous.value"
        :room="room"
        type="multiple"
      />
      <MessagesWindow v-if="room && !room.custom.value.clearScreen" :room="room" />
      <RoomFooter
        v-if="room.wsClient.value && room.isAllowed.value"
        v-show="!room.custom.value.clearScreen"
        :room="room"
        type="VOICE"
      />
    </div>
    <UserPanel :room="room" />
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, onUnmounted, watch } from 'vue'
  import utils from '@/utils'
  import { useRoom, type RoomInterface } from 'src/composables/useRoom'
  import Users from './components/_Users.vue'
  import OnMicUsers from './components/_OnMicUsers.vue'
  import MessagesWindow from './components/_MessagesWindow.vue'
  import RoomFooter from './components/_RoomFooter.vue'
  import AddHeat from './components/_AddHeat.vue'
  import Follow from '@/components/Follow.vue'
  import UserPanel from './components/_UserPanel.vue'
  import AvatarsPro from '@/pages/room/components/_AvatarsPro.vue'
  import WaveDance from '@/pages/room/components/_WaveDance.vue'

  const props = withDefaults(
    defineProps<{
      type: 'VOICE' | 'CHAT'
      roomId: string
    }>(),
    {
      type: 'VOICE',
    }
  )

  const room: RoomInterface = useRoom()

  const mainContentRef = ref<HTMLElement | null>(null)

  const showUserInfo = () => {
    room.custom.value?.showUserInfo(room.ownerId.value)
  }

  const setBg = async (url: string) =>
    mainContentRef.value?.style.setProperty(
      'background-image',
      url && url !== '/' ? `url(${await utils.getImageUrl(url)})` : ''
    )

  watch(
    () => room.info.value?.backgroundImg,
    async (value: string) => setBg(value)
  )

  onMounted(async () => {
    room.init(props.roomId, props.type)
    setBg(room.info.value?.backgroundImg)
  })

  onUnmounted(() => {
    room.wsClient.value?.destroy()
    console.log('WebSocket 已销毁')
  })
</script>
<style scoped lang="less">
  @bg-color: #33373a;
  @bg-owner: #1a1b1c80;
  @text-grey: #e0e0e0;

  .shadow-style {
    background-color: rgba(0, 0, 0, 0.3);
    border: 1px solid #a4a4a4;
  }
  .text-shadow {
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  }
  .wrapper {
    height: 100%;
    font-family: Noto Sans;
    color: #fff;
    .room-bar {
      position: fixed;
      z-index: 10;
      top: 0;
      left: 0;
      display: flex;
      justify-content: space-between;
      width: 100%;
      padding: 12px;
      color: #f1f1f1;
      max-width: 600px;

      @media (min-width: 600px) {
        left: calc((100vw - 600px) / 2);
      }
      .room-left {
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-width: 60%;
        .add-heat {
          position: absolute;
          top: 40px;
          left: -4px;
          z-index: 10;
        }
      }
    }
    .room-owner {
      display: flex;
      justify-content: center;
      gap: 8px;
      height: 32px;
      align-items: center;
      text-shadow: none;
      background-color: @bg-owner;
      padding: 2px 12px 2px 2px;
      border-radius: 16px;
      .btn-follow {
        height: 24px;
        background-color: transparent !important;
        border-color: transparent !important;
        font-size: 16px;
        padding: 0;
        :deep(.van-button__text) {
          background: linear-gradient(270deg, #ff3a75 0%, #f82430 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          font-weight: 600;
          white-space: nowrap;
        }
        &.is-follow {
          :deep(.van-button__text) {
            color: @text-grey;
          }
        }
      }
      .nickname-heat {
        display: flex;
        flex-direction: column;
        line-height: 12px;
        gap: 4px;
        font-size: 12px;
        font-weight: 600;
        span {
          font-size: 11px;
          line-height: 11px;
          font-weight: 400;
          color: @text-grey;
          &.nickname-text {
            display: -webkit-box;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            line-clamp: 1;
            -webkit-line-clamp: 1;
            width: 100%;
            word-break: break-word;
          }
        }
      }
    }
    .main-content {
      font-size: 14px;
      overflow-y: auto;
      overflow-x: hidden;
      background-color: transparent;
      padding: 60px 8px 80px;
      height: 100%;
      background-color: @bg-color;
      background-repeat: no-repeat;
      background-size: contain;
      background-position: center center;
      position: relative;
      // .text-shadow;
    }
  }
</style>
