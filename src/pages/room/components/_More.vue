<template>
  <div class="icon-wrapper"><van-icon :name="more.src" size="22px" color="#fff" @click="toggleShow" /></div>
  <van-popup
    v-model:show="showPopup"
    class="popup-for-more popup-for-global"
    position="bottom"
    :round="scene === 'home'"
    teleport="body"
    :class="{ 'height-auto': scene === 'home' }"
  >
    <div class="more-buttons" v-if="scene === 'home'">
      <NavBar safe-area-inset-top placeholder class="nav-bar" :title="sceneType">
        <template #right v-if="scene !== 'home'">
          <van-icon name="cross" size="24" @click="close" color="#434343" />
        </template>
      </NavBar>
      <h6 class="group-title">信息设置</h6>
      <van-field is-link readonly name="picker" label="语音房资料" placeholder="" @click="changeScene('info')" />
      <h6 class="group-title">功能设置</h6>
      <van-cell center title="开启连麦">
        <template #right-icon>
          <van-switch
            v-model="speakStateChecked"
            @change="(checked: boolean) => handleChecked(checked, 'speak')"
            size="24"
            activeColor="#34C759"
            inactiveColor="#AEAEB1"
          />
        </template>
      </van-cell>
      <van-cell center title="展示空麦位">
        <template #right-icon>
          <van-switch
            v-model="seatStateChecked"
            @change="(checked: boolean) => handleChecked(checked, 'seat')"
            size="24"
            activeColor="#34C759"
            inactiveColor="#AEAEB1"
          />
        </template>
      </van-cell>
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
    <MoreRoomInfo v-else-if="scene === 'info'" :room="room" @close="close" />
  </van-popup>
</template>

<script lang="ts" setup>
  import { ref, computed } from 'vue'
  import {
    Icon as VanIcon,
    Popup as VanPopup,
    NavBar,
    Field as VanField,
    Cell as VanCell,
    Switch as VanSwitch,
  } from 'vant'
  import MoreRoomInfo from './_MoreRoomInfo.vue'
  import utils from '@/utils'
  import service from '@/service'
  import more from '@/assets/icons/room/more.svg'

  const SCENE_TEXT_BOOK: any = {
    home: '更多',
    info: '语音房资料',
  }

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
  const speakStateChecked = ref<boolean>(props.room.info.value?.speakState === 1)
  const seatStateChecked = ref<boolean>(props.room.info.value?.seatState === 1)
  const muteStateChecked = ref<boolean>(!props.room.canSpeak.value)
  const sceneType = computed(() => {
    return SCENE_TEXT_BOOK[scene.value]
  })

  const toggleShow = () => {
    showPopup.value = !showPopup.value
  }

  const changeScene = (s: string) => {
    scene.value = s
  }

  const close = (type?: 'all') => {
    if (type === 'all' || scene.value === 'home') {
      showPopup.value = false
    } else {
      scene.value = 'home'
    }
  }

  const handleChecked = (checked: boolean, type: 'speak' | 'seat') => {
    utils
      .chain()
      .fetch(
        service.room.updateRoom,
        {
          roomId: props.room.id.value,
          type: props.room.type.value,
          title: props.room.type.title,
          note: props.room.type.note,
          ...(type === 'speak' ? { speakState: checked ? 1 : 0 } : { seatState: checked ? 1 : 0 }),
        },
        `已经${checked ? '开启' : '关闭'}${type === 'speak' ? '连麦' : '展示空麦位'}`
      )
      .next(() => {
        if (!checked && type === 'speak') {
          seatStateChecked.value = false
        }
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
</style>
