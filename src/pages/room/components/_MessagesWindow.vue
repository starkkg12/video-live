<template>
  <div class="join-animation-wrapper" v-if="joinMessagesList.length > 0">
    <JoinAnimation v-model="joinMessagesList" />
  </div>
  <div
    class="message-wrapper is-live"
    ref="chatContainer"
    :class="{ 'more-items': lastestMessages.length > 5 }"
    @scroll="onScroll"
  >
    <!-- <MessageWelcome :room="room" /> -->
    <div
      class="message-item"
      :class="{ mine: false }"
      v-for="(item, index) in lastestMessages"
      :key="index"
    >
      <template v-if="item.message.type !== 'system_announcement'">
        <AvatarsPro
          :room="room"
          :userId="item.sender.sub"
          @click="showUserInfo(item.sender.sub, item.sender.isAnonymous)"
          size="16px"
          border-color="#f2f2f2"
          :src="item.sender.userAvatar"
          v-if="item.sender.sub !== 'system'"
        />
        <div class="message-user-content" :class="{ 'is-system': item.sender.sub === 'system' }">
          <!-- <MessageUserInfo v-if="item.sender.sub !== 'system'" :item="item" /> -->
          <MessageContent :item="item" />
        </div>
      </template>
      <template v-else>
        <MessageContent :item="item" />
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, nextTick, watch, computed, inject, type Ref, toRef } from 'vue'
import MessageUserInfo from './_MessageUserInfo.vue'
import MessageContent from './_MessageContent.vue'
// import MessageWelcome from './_MessageWelcome.vue'
import AvatarsPro from '@/pages/room/components/_AvatarsPro.vue'
import { type LiveRoomInterface, type MessageItemInterface } from '@/composables/useLiveRoom'
import JoinAnimation from './_JoinAnimation.vue'

const room: LiveRoomInterface | undefined = inject('liveRoom')

const joinMessagesList = ref<any[]>([])
const emit = defineEmits(['onFollowPopup'])

// 引用聊天容器 DOM
const chatContainer = ref<HTMLElement | null>(null)

// 自动滚动标志
const autoScroll = ref(true)

// 防抖定时器
let debounceTimer: NodeJS.Timeout | null = null

const lastestMessages = computed(() => {
  return room?.messageList.value.slice(-100) ?? []
})
const showUserInfo = (userId: string, isAnonymous: boolean) => {
  if (isAnonymous) return
  emit('onFollowPopup', userId)
}

// 滚动到最新消息（防抖）
const scrollToBottom = () => {
  if (!chatContainer.value) return

  // 清除上一次定时器
  if (debounceTimer) clearTimeout(debounceTimer)

  // 延迟执行滚动操作
  debounceTimer = setTimeout(() => {
    chatContainer.value!.scrollTop = chatContainer.value!.scrollHeight
  }, 300) // 延迟 300ms，避免频繁触发
}

// 监听消息列表变化
watch(lastestMessages, async () => {
  if (autoScroll.value) {
    await nextTick() // 确保 DOM 更新完成
    scrollToBottom()
  }
})

watch(
  () => room?.joinMessage.value,
  async () => {
    if (room?.joinMessage.value) {
      joinMessagesList.value = [...joinMessagesList.value, room?.joinMessage.value]
    }
  }
)

// 滚动事件处理
const onScroll = () => {
  if (!chatContainer.value) return

  // 判断用户是否滚动到接近底部
  const isNearBottom =
    chatContainer.value.scrollTop + chatContainer.value.clientHeight >=
    chatContainer.value.scrollHeight - 60

  autoScroll.value = isNearBottom
}
</script>

<style scoped lang="less">
@bg-message: #1a1b1c80;
@bg-mine: #b1ff95;
@text-primary: #434343;
@text-secondary: #656565;
.message-wrapper {
  position: fixed;
  left: 0;
  width: 100%;
  padding: 0 8px;
  overflow-y: auto;
  overflow-x: hidden;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  &.is-live {
    @media (min-width: 480px) {
      left: calc((100vw - 480px) / 2);
    }
  }

  .message-item {
    display: flex;
    align-items: start;
    margin-top: 12px;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 12px;
    text-shadow: none;
    .message-user-content {
      border-radius: 10px;
      position: relative;
      display: flex;
      color: #fff;
      align-items: flex-start;
      :deep(img) {
        display: block;
      }
      &.flex {
        display: flex;
        gap: 8px;
      }
    }
  }

  &.is-live {
    max-height: 30%;
    bottom: 60px;
    &.more-items {
      mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 30%);
      -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 30%);
    }
    .message-item {
      max-width: 75%;
      background-color: #74747499;
    }
    &.is-sigle {
      max-height: calc(100vh - 330px);
    }
    &.has-picture {
      max-height: 260px;
    }
  }
}
.join-animation-wrapper {
  position: fixed;
  bottom: 36%;
  width: 100%;
  max-width: 480px;
  &.is-live {
    @media (min-width: 480px) {
      left: calc((100vw - 480px) / 2);
    }
  }
}
</style>
