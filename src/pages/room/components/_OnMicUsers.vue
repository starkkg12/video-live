<template>
  <div class="on-mic-users" :class="{ 'multiple': type === 'multiple', 'has-picture': hasPicture }">
    <template v-for="(item, index) in onMicUses" :key="index">
      <div class="user-item" :class="type" v-if="item.userId" @click="handleInSeat(item.userId)">
        <WaveDance :has-voice="room?.micVoiceStatus.value[item.userId]" :close-now="!room?.checkIfOn(item.userId)">
          <AvatarsPro
            :user-id="item.userId"
            :room="room"
            :size="hasPicture ? '40px' : '70px'"
            :has-flag="!hasPicture"
            has-mic
          />
        </WaveDance>
        <span class="user-nickname">
          {{
            room?.checkIfSelf(item.userId) && hasPicture
              ? '我'
              : utils.getNickname(room.usersDictionary.value[item.userId]?.nickname, item.userId)
          }}
        </span>
      </div>
      <template v-if="room.canSpeak.value && room?.info.value.speakState !== 0">
        <div
          class="user-item empty"
          :class="type"
          v-if="!item.userId && room?.info.value.seatState === 1 && room?.info.value.speakState === 1"
          @click="handleEmptySeat"
        >
          <van-icon name="plus" :size="hasPicture ? '30px' : '36px'" alt="" :color="hasPicture ? '#fff' : '#E0E0E0'" />
          <span>{{ room?.isOwner.value ? '邀请' : '' }}连麦</span>
        </div>
        <div class="user-item locked" :class="type" v-else-if="!item.userId && room?.info.value.seatState === 1">
          <van-icon name="lock" :size="hasPicture ? '30px' : '36px'" alt="" :color="hasPicture ? '#fff' : '#E0E0E0'" />
        </div>
      </template>
    </template>
    <van-popup
      teleport="body"
      position="bottom"
      :show="showPopup"
      :onClose="closePopup"
      class="popup-for-invite-speak popup-for-global"
      :overlay-style="{ background: 'none' }"
      transition="none"
      :closeable="popupScene === 'mute-kick'"
    >
      <InviteUsers v-if="popupScene === 'invite'" :room="room" @close="closePopup" isInviteUpSpeak />
      <div class="mute-kick-wrapper" v-else>
        <NavBar
          safe-area-inset-top
          placeholder
          class="nav-bar"
          title="连麦用户"
          right-arrow
          @click-right="closePopup"
        />
        <div class="mute-kick-buttons">
          <Button
            type="danger"
            v-if="room?.checkIfOn(currentUserId)"
            @click="room?.custom.value.closeSpeakByOwner(currentUserId)"
            block
          >
            关闭麦克风
          </Button>
          <Button type="success" v-else @click="room?.custom.value.openSpeakByOwner(currentUserId)" block>
            打开麦克风
          </Button>
          <Button type="danger" @click="room.kickOut([currentUserId])" block>踢出语音房</Button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script lang="ts" setup>
  import utils from '@/utils'
  import { computed, ref, type Ref } from 'vue'
  import { Image as VanImage, Icon as VanIcon, Popup as VanPopup, Button, NavBar } from 'vant'
  import service from '@/service'
  import InviteUsers from './_InviteUsers.vue'
  import { type RoomInterface } from 'src/composables/useRoom'
  import AvatarsPro from '@/pages/room/components/_AvatarsPro.vue'
  import WaveDance from '@/pages/room/components/_WaveDance.vue'

  export type showType = 'sigle' | 'multiple'
  type PopupScene = 'invite' | 'mute-kick'

  const props = withDefaults(
    defineProps<{
      room: RoomInterface
    }>(),
    {}
  )
  const params = {
    roomId: props.room?.id.value,
    userId: props.room?.myUserId.value,
  }
  const showPopup = ref<boolean>(false)
  const popupScene = ref<PopupScene>('invite')
  const currentUserId = ref<string>('')
  const type: Ref<showType> = computed(() => {
    return (props.room?.info.value.seatState === 0 || !props.room.canSpeak.value) &&
      props.room?.upUserList.value.length === 1
      ? 'sigle'
      : 'multiple'
  })
  const onMicUses = computed(() => {
    if (!props.room) return
    const upUserList = hasPicture.value
      ? props.room?.upUserList.value.filter(({ userId }: { userId: string }) => userId !== props.room?.ownerId?.value)
      : props.room?.upUserList.value
    const result = [
      ...upUserList,
      ...Array.from({ length: (hasPicture.value ? 3 : 4) - (upUserList.length ?? 0) }, () => ({})),
    ]
    return result
  })
  const hasPicture = computed(() => {
    return !!props.room?.info.value.backgroundImg && props.room?.info.value.backgroundImg !== '/'
  })

  const openPopup = (scene: PopupScene, userId?: string) => {
    showPopup.value = true
    popupScene.value = scene
    currentUserId.value = userId || ''
  }

  const closePopup = () => {
    showPopup.value = false
  }

  const handleEmptySeat = () => {
    if (props.room?.isOwner.value) {
      openPopup('invite')
    } else {
      applyOnMic()
    }
  }

  const handleInSeat = (userId: string) => {
    if (props.room?.isOwner.value && !props.room?.checkIfSelf(userId)) {
      openPopup('mute-kick', userId)
    } else if (!props.room?.isOwner.value && props.room?.checkIfSelf(userId)) {
      downMic()
    } else {
      props.room.custom.value?.showUserInfo(userId)
    }
  }

  // 上麦
  const applyOnMic = async () => {
    if (!props.room?.isUpSpeaker.value) {
      utils
        .chain()
        .ask({
          title: '上麦确认',
          message: '上麦一起语音聊天',
          messageSub: '上麦后麦克风变为开启即可语音聊天',
          confirmText: '确认上麦',
        })
        .fetch(service.room?.applySpeak, params, '申请上麦成功')
        .next(() => {
          props.room?.custom.value.toggleMicStream && props.room?.custom.value.toggleMicStream(true)
        })
    }
  }
  // 下麦
  const downMic = () => {
    utils
      .chain()
      .ask({
        title: '下麦确认',
        message: '下麦离开语音聊天座位',
        messageSub: '下麦后麦克风变为关闭',
        confirmText: '确认下麦',
        confirmColor: '#FC7E7E',
      })
      .fetch(service.room?.downSpeak, params, '申请下麦成功')
      .next(() => {
        props.room?.custom.value.toggleMicStream && props.room?.custom.value.toggleMicStream(false)
      })
  }
</script>

<style scoped lang="less">
  @import '@/styles/variables.less';

  .on-mic-users {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    position: relative;
    z-index: 2;
    .user-item {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 200px;
      background-color: @bg-owner;
      width: 100%;
      gap: 4px;
      border-radius: 8px;
      font-size: 14px;
      &.empty {
        color: @text-grey;
      }
      .user-nickname {
        align-items: center;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        line-clamp: 1;
        -webkit-line-clamp: 1;
        padding: 0 16px;
        width: 100%;
        word-break: break-word;
        text-align: center;
      }
      .user-avatar {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
    }
    &.multiple {
      .user-item {
        width: calc(50% - 2px);
        height: 130px;
      }
    }
    &.has-picture {
      position: fixed;
      right: 10px;
      bottom: 100px;
      width: 70px;
      @media (min-width: 600px) {
        right: calc(((100vw - 600px) / 2) + 10px);
      }
      .user-item {
        width: 100%;
        height: 70px;
        font-size: 12px;
      }
      .empty {
        color: #fff;
      }
    }
  }
  .popup-for-invite-speak {
    .mute-kick-buttons {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 32px;
      gap: 16px;
      button {
        border: none;
        border-radius: 8px;
        font-size: 16px;
        &:not(.van-button--success) {
          background-color: @text-red;
        }
      }
    }
    :deep(.van-popup__close-icon) {
      color: @text-primary;
      top: 10px;
      right: 10px;
    }
  }
</style>
