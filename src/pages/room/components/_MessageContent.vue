<template>
  <div class="message-content">
    <div
      v-if="item?.message.type === 'message' || item?.message.type === 'follow'"
      class="message-text"
    >
      <span class="user-name">{{ item.sender.username }}</span>
      <MsgCard :msg="item.message.content" />
    </div>
    <div v-else-if="item?.message.type === 'system_announcement'" class="system-message-text">
      {{ item.message.content }}
    </div>
    <div v-else-if="item?.message.type === 'user_join'" class="user-join-text">
      <span>{{ item.message.user.username }}</span>
      <span>加入房间</span>
    </div>
  </div>
  <IframeWrapper v-if="!!iframeSrc" :src="iframeSrc" @close="handleIframeShow('')" is-popup />
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import MsgCard from './_MsgCard.vue'
import IframeWrapper from './_IframeWrapper.vue'

const props = withDefaults(
  defineProps<{
    item?: any
  }>(),
  {
    item: null,
  }
)

const iframeSrc = ref<string>('')

const handleIframeShow = (src: string) => {
  iframeSrc.value = src
}
</script>

<style scoped lang="less">
@text-system: #cbd4ff;
.message-content {
  display: flex;
  .message-text {
    font-size: 14px;
    font-weight: 400;
    word-break: break-word;
    line-height: 16px;
    .user-name {
      color: #cbd4ff;
      font-size: 13px;
      margin-right: 4px;
    }
    &.has-room-card {
      margin-bottom: 8px;
    }
  }
  .message-image {
    padding: 4px 4px 4px 0;
    .van-image {
      border-radius: 8px;
      overflow: hidden;
      display: block;
    }
  }
  .system-message-text {
    color: @text-system;
    font-size: 14px;
  }
  .user-join-text {
    color: @text-system;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .message-card {
    padding: 4px 4px 4px 0;
    min-width: 160px;
    &.room {
      max-width: 100%;
    }
    &.picture {
      max-width: 60%;
    }
    &.creation {
      max-width: 60%;
    }
  }
}
</style>
