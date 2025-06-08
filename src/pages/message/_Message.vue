<script lang="ts" setup>
// CSR
import { computed, onMounted, ref } from 'vue'
import { NavBar, showFailToast, CellGroup, Cell, Image, Badge } from 'vant'
import StateManager from '@/components/StateManager.vue'
import service from '@/service'
import activity_icon from '@/assets/images/messages/activity.svg'
import collect_icon from '@/assets/images/messages/collect.svg'
import comment_icon from '@/assets/images/messages/comment.svg'
import follow_icon from '@/assets/images/messages/follow.svg'
import system_icon from '@/assets/images/messages/system.svg'
import voice_icon from '@/assets/images/messages/voice.svg'
import utils from '@/utils'

const isLoading = ref(false)
const isError = ref(false)
const page = ref(1)
const size = ref(100)

const isSystemMessage = ref(false)
const isVoiceMessage = ref(false)
const isFollowMessage = ref(false)
const isActivityMessage = ref(false)
const systemMessage = ref('')
const voiceMessage = ref('')
const followMessage = ref('')
const activityMessage = ref('')

// 添加互动消息的状态和内容
const isInteractionMessage = ref(false)
const interactionMessage = ref('')

const isLoggedIn = ref(false)

function onBack() {
  window.history.back()
}

interface Message {
  msgId: string
  type: string
  title: string
  content: string
  img: string
  msgTime: number
  isRead: boolean
  msgObj: {
    targetRef: string
    vipLevel: number
    img: string
    attachments: any[]
    targetId: string
    sourceType: string
    nickname: string
    likeFlag: string
    relationFlag: string
    fromIp: string
    likeType: string
    userId: string
  }
  userId: string
  roomId: string
  unreadCount: string
  totalCount: string
}

function getMessageContent(message: Message) {
  return message.content === '' ? message.title : message.content
}

async function initData() {
  try {
    isLoading.value = true
    isError.value = false
    const response = await service.message.getUserMessageList(page.value, size.value)
    if (!response.data.success) {
      isError.value = true
      showFailToast(response.data.errMessage)
      return
    }

    for (let message of response.data.data.list) {
      switch (message.type) {
        case 's':
          isSystemMessage.value = true
          systemMessage.value = getMessageContent(message)
          break
        // 互动消息：收藏、喜欢、评论、@
        case 'l':
        case 'c':
        case 'd':
        case 'a':
          isInteractionMessage.value = true
          interactionMessage.value = getMessageContent(message)
          break
        case 'f':
          isFollowMessage.value = true
          followMessage.value = getMessageContent(message)
          break
        case 'v':
          isActivityMessage.value = true
          activityMessage.value = getMessageContent(message)
          break
        case 'r':
        case 't':
          isVoiceMessage.value = true
          voiceMessage.value = getMessageContent(message)
          break
      }
    }
  } catch (error) {
    isError.value = true
    showFailToast({
      message: '获取未读消息失败',
      duration: 2000,
    })
  } finally {
    isLoading.value = false
  }
}

const configs = computed(() =>
  [
    {
      key: 'system',
      unread: isSystemMessage.value,
      icon: system_icon.src,
      title: '系统消息',
      content: systemMessage.value,
      types: ['s'],
      show: true,
    },
    {
      key: 'interaction',
      unread: isInteractionMessage.value,
      icon: comment_icon.src,
      title: '互动消息',
      content: interactionMessage.value,
      types: ['c', 'l', 'd', 'a'],
      show: isLoggedIn.value,
    },
    {
      key: 'voice',
      unread: isVoiceMessage.value,
      icon: voice_icon.src,
      title: '语音房',
      content: voiceMessage.value,
      types: ['r', 't'],
      show: isLoggedIn.value,
    },
    {
      key: 'follow',
      unread: isFollowMessage.value,
      icon: follow_icon.src,
      title: '关注',
      content: followMessage.value,
      types: ['f'],
      show: isLoggedIn.value,
    },
    {
      key: 'activity',
      unread: isActivityMessage.value,
      icon: activity_icon.src,
      title: '活动',
      content: activityMessage.value,
      types: ['v'],
      show: true,
    },
  ].sort((a, b) => Number(b.unread) - Number(a.unread))
)

onMounted(() => {
  isLoggedIn.value = utils.isLoggedIn() === 'logged-in'
  initData()
})
</script>

<template>
  <StateManager :error="isError" :loading="isLoading" @refresh="initData">
    <div class="wrapper">
      <div class="nav-wrap">
        <NavBar
          class="nav-bar"
          title="消息中心"
          left-text=""
          left-arrow
          @click-left="onBack()"
          safe-area-inset-top
        />
      </div>
      <CellGroup class="cell-group" inset>
        <Cell
          v-for="config of configs.filter(config => config.show)"
          :key="config.key"
          @click="utils.jumpTo(`/message/${config.key}`)"
          class="message-cell"
        >
          <template #title>
            <div class="item-left">
              <Badge dot v-if="config.unread" :offset="[-3, 3]">
                <Image class="icon" :src="config.icon" width="45px" height="45px" />
              </Badge>
              <Image v-else class="icon" :src="config.icon" width="45px" height="45px" />
              <div class="content-wrapper">
                <div class="title">{{ config.title }}</div>
                <div class="content" v-html="config.content" />
              </div>
            </div>
          </template>
        </Cell>
      </CellGroup>
    </div>
  </StateManager>
</template>

<style lang="less" scoped>
.wrapper {
  background-color: var(--van-background-color);
  height: 100%;
  overflow-y: auto;
}

.cell-group {
  margin-top: env(safe-area-inset-top);

  :deep(.van-cell) {
    user-select: none;
    cursor: pointer;
    padding: 10px 10px;
  }
}

.item-left {
  display: flex;
  align-items: start;
}

.icon :deep(img) {
  border-radius: 50px;
  background-color: white;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  padding-left: 12px;
  padding-top: 4px;
  .title {
    font-weight: bold;
    font-size: 16px;
    color: #333;
  }

  .content {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    height: 100%;
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #888;
  }
}

.van-cell {
  display: flex;
  align-items: center;
}

:deep(.van-badge) {
  width: 10px;
  height: 10px;
}
</style>
