<template>
  <NavBar safe-area-inset-top placeholder class="nav-bar" title="互动">
    <template #right>
      <van-icon name="cross" size="24" color="#434343" @click="emit('close', 'all')" />
    </template>
  </NavBar>
  <div class="interactive-home">
    <div class="interactive-buttons-item" @click="emit('changeScene', 'comment')">
      <van-icon :name="pictureComment.src" size="36px" />
      <span>看图解</span>
    </div>
    <div class="interactive-buttons-item" @click="emit('changeScene', 'history')">
      <van-icon :name="lottery.src" size="36px" />
      <span>历史开奖</span>
    </div>
    <div
      class="interactive-buttons-item"
      @click="emit('changeScene', 'picture')"
      v-if="room.isOwner.value || room.isUpSpeaker.value"
    >
      <van-icon :name="picture.src" size="40px" />
      <span class="big-icon-name-offset">讲图纸</span>
    </div>
    <div
      class="interactive-buttons-item"
      v-if="room.isOwner.value || room.isUpSpeaker.value"
      @click="emit('changeScene', 'changeVoice')"
    >
      <van-icon :name="changeVoice.src" size="40px" />
      <span class="big-icon-name-offset">变声器</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { Icon as VanIcon, NavBar } from 'vant'
  import pictureComment from '@/assets/icons/room/picture_comment.svg'
  import lottery from '@/assets/icons/room/lottery.svg'
  import picture from '@/assets/icons/room/picture.svg'
  import changeVoice from '@/assets/icons/room/change_voice.svg'

  const props = withDefaults(
    defineProps<{
      room: any
    }>(),
    {
      room: null,
    }
  )
  const emit = defineEmits<{
    close: [type?: 'all']
    changeScene: [scene: string]
  }>()
</script>

<style scoped lang="less">
  @import '@/styles/variables.less';

  .interactive-home {
    display: flex;
    gap: 16px;
    padding: 16px;
    .interactive-buttons-item {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 8px;
      color: @text-primary;
      font-size: 14px;
      width: 60px;
      .big-icon-name-offset {
        margin-top: -4px;
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
</style>
