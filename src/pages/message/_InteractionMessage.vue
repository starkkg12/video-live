<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import service from '@/service'
import { NavBar, List, Divider, Icon, showFailToast, Cell } from 'vant'
import StateManager from '@/components/StateManager.vue'
import utils from '@/utils'
import dayjs from 'dayjs'
import { formatMessageTime } from '@/utils/formatDate'
import CustomImage from '@/components/CustomImage.vue'
import VideoThumbnail from '@/components/VideoThumbnail.vue'

// 定义消息类型接口，替代 any
interface MessageAttachment {
  url: string
  fileType: string
}

interface MessageObject {
  img?: string
  nickname: string
  attachments?: MessageAttachment[]
  followerUserId?: string
  favoriteFlag?: string
  likeFlag?: string
  sourceType?: string
  url?: string
  content?: string
}

interface Message {
  msgId: string
  type: string
  title: string
  content: string
  msgTime: number
  isRead?: boolean
  msgObj: MessageObject
}

// 页面加载状态
const isLoading = ref(false)
const isError = ref(false)
const isFinished = ref(false)

// 消息列表
const messageList = ref<Message[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)

// 互动消息类型
const interactionTypes = ['c', 'l', 'd', 'a']

// 消息类型映射表
const messageTypeMap = {
  c: '收藏',
  l: '喜欢',
  d: '评论',
  a: '@提及',
}

// 过滤器相关状态
const showFilterPopup = ref(false)
const activeFilter = ref('all') // 'all' 或 单个类型代码

// 打开/关闭过滤弹窗
function toggleFilterPopup() {
  showFilterPopup.value = !showFilterPopup.value
}

// 应用过滤器
function applyFilter(filter: string) {
  activeFilter.value = filter
  showFilterPopup.value = false
  resetAndRefresh()
}

// 获取当前过滤器显示名称
const activeFilterName = computed(() => {
  if (activeFilter.value === 'all') return '全部'
  return messageTypeMap[activeFilter.value as keyof typeof messageTypeMap] || '全部'
})

// 获取当前要使用的消息类型列表
const currentInteractionTypes = computed(() => {
  if (activeFilter.value === 'all') return interactionTypes
  return [activeFilter.value]
})

// 返回上一页
function onBack() {
  window.history.back()
}

// 辅助函数：根据flag返回对应的文本
function flagToString(flag?: string): string {
  if (!flag) return ''

  const flagMap: Record<string, string> = {
    b: 'bbs',
    f: '论坛',
    m: '主板',
    p: '帖子',
    t: '图库｜期刊',
    c: '论坛评论',
    u: '图库评论',
    s: '系列',
  }

  return flagMap[flag] || ''
}

// 辅助函数：判断消息是否有附件
function hasAttachments(message: Message): boolean {
  return Boolean(message.msgObj?.attachments?.[0])
}

// 辅助函数：判断是否为视频附件
function isVideoAttachment(message: Message): boolean {
  return hasAttachments(message) && message.msgObj.attachments![0].fileType === 'v'
}

// 辅助函数：获取第一个附件
function getFirstAttachment(message: Message): MessageAttachment | undefined {
  return message.msgObj?.attachments?.[0]
}

// 格式化消息内容
function formatMessageContent(message: Message): Message {
  const { type, msgObj } = message
  const nickname = msgObj.nickname || ''

  const boldName = `<span style='font-weight: bold'>${nickname}</span>`

  switch (type) {
    case 'f':
      message.content = `${boldName}关注了你`
      break
    case 'l':
      message.content = `${boldName}喜欢了你的${flagToString(msgObj.likeFlag)}`
      break
    case 'c':
      message.content = `${boldName}收藏了你的${flagToString(msgObj.favoriteFlag)}`
      break
    case 'd':
      message.content = `${boldName}评论了：${msgObj.content || ''}`
      break
    case 'a':
      message.content = `${boldName}@了你`
      break
  }

  return message
}

// 判断是否为互动消息
function isInteractionMessage(type: string): boolean {
  return interactionTypes.includes(type)
}

// 加载消息数据
async function onLoad() {
  if (isFinished.value || isError.value) {
    return
  }

  try {
    isLoading.value = true
    isError.value = false

    // 使用 getUserMessageList 接口替代 getMessageFavoritesAndLikesList
    const response = await service.message.getUserMessageList(
      page.value,
      size.value,
      currentInteractionTypes.value.join(',')
    )

    if (!response.data.success) {
      isError.value = true
      showFailToast(response.data.errMessage)
      return
    }

    // 过滤出互动类消息（喜欢、收藏、评论和@）
    const interactionMessages = response.data.data.list
      .filter((msg: Message) => isInteractionMessage(msg.type))
      .map(formatMessageContent)

    total.value = interactionMessages.length // 这里可能需要调整，取决于API是否返回过滤后的总数
    messageList.value.push(...interactionMessages)

    if (messageList.value.length >= total.value) {
      isFinished.value = true
    }
    page.value++
  } catch (error) {
    console.error(error)
    isError.value = true
    isFinished.value = true
  } finally {
    isLoading.value = false
  }
}

// 处理消息点击
function onClickCell(message: Message) {
  const { type, msgObj } = message

  switch (type) {
    case 'f':
      if (msgObj.followerUserId) {
        utils.jumpToUser(msgObj.followerUserId)
      }
      break

    case 'v':
      if (msgObj.url) {
        utils.jumpTo(msgObj.url)
      }
      break

    case 'c':
    case 'l':
      // 优化嵌套switch
      const flag = type === 'c' ? msgObj.favoriteFlag : msgObj.likeFlag
      handleResourceNavigation(flag)
      break

    case 'd':
    case 'a':
      if (msgObj.sourceType === 'drawing') {
        // utils.jumpToDrawing(msgObj.sourceId)
      } else if (msgObj.sourceType === 'post') {
        // utils.jumpToPost(msgObj.sourceId)
      }
      break
  }
}

// 处理资源跳转逻辑
function handleResourceNavigation(flag?: string) {
  if (!flag) return

  const isForum = ['c', 'p'].includes(flag)
  const isGallery = ['u', 't'].includes(flag)

  if (isForum) {
    // utils.jumpToBbs(sourceId)
  } else if (isGallery) {
    // utils.jumpToDrawing(sourceId)
  }
}

// 重置列表并刷新
function resetAndRefresh() {
  isFinished.value = false
  isError.value = false
  page.value = 1
  messageList.value = []
  onLoad()
}

onMounted(() => {
  onLoad()
})
</script>

<template>
  <StateManager :error="isError" @refresh="resetAndRefresh">
    <div class="wrapper">
      <NavBar class="nav-bar" left-text="" left-arrow @click-left="onBack()">
        <template #title>
          <div class="nav-title" @click="toggleFilterPopup">
            互动消息 - {{ activeFilterName }}
            <Icon name="arrow-down" :class="{ 'arrow-up': showFilterPopup }" />
          </div>
        </template>
      </NavBar>

      <!-- 添加背景蒙层 -->
      <div v-if="showFilterPopup" class="filter-overlay" @click="showFilterPopup = false"></div>

      <!-- 过滤器弹窗 -->
      <div v-if="showFilterPopup" class="filter-popup">
        <div
          class="filter-option"
          @click="applyFilter('all')"
          :class="{ active: activeFilter === 'all' }"
        >
          全部
        </div>
        <div
          v-for="type in interactionTypes"
          :key="type"
          class="filter-option"
          :class="{ active: activeFilter === type }"
          @click="applyFilter(type)"
        >
          {{ messageTypeMap[type as keyof typeof messageTypeMap] }}
        </div>
      </div>

      <List
        v-model:loading="isLoading"
        :finished="isFinished"
        finished-text="没有更多了"
        class="message-list"
        @load="onLoad"
      >
        <Cell
          v-for="(message, messageIndex) of messageList"
          :key="message.msgId"
          @click="onClickCell(message)"
          class="message-cell"
        >
          <!-- 头像 -->
          <template #icon>
            <CustomImage
              :src="message.msgObj?.img"
              avatar
              width="40"
              height="40"
              class="avatar-image"
            />
          </template>

          <!-- 标题区域 -->
          <template #title>
            <div class="title-container">
              <div class="nickname">{{ message.msgObj.nickname }}</div>
              <div class="time">{{ formatMessageTime(message.msgTime) }}</div>
            </div>
          </template>

          <!-- 标签区域 -->
          <template #label>
            <div class="label">{{ message.title }}</div>
          </template>

          <!-- 附件区域 -->
          <template #value>
            <template v-if="hasAttachments(message)">
              <VideoThumbnail
                v-if="isVideoAttachment(message)"
                :src="getFirstAttachment(message)?.url"
                width="120"
                height="120"
              />
              <CustomImage
                v-else
                :src="getFirstAttachment(message)?.url"
                maxWidth="80px"
                maxHeight="60px"
                class="attachment-image"
              />
            </template>
          </template>

          <Divider v-if="messageIndex !== messageList.length - 1" />
        </Cell>
      </List>
    </div>
  </StateManager>
</template>

<style scoped lang="less">
.wrapper {
  background-color: var(--van-background);
  height: 100%;
  overflow-y: auto;
  color: var(--van-text-color);
}

.nav-bar {
  position: fixed;
  width: 100%;
  max-width: 480px;
  top: 0;
  left: auto;
  z-index: 12;
}

.message-list {
  margin-top: 46px;
  padding: 10px 0;
}

.message-cell {
  background-color: var(--van-card-background);
  transition: background-color 0.2s;

  &:active {
    background-color: var(--van-active-color);
  }

  .title-container {
    display: flex;
    gap: 10px;
  }

  .nickname {
    font-size: 12px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 70%;
  }

  .time {
    font-size: 10px;
    color: var(--van-gray-5);
    font-weight: 500;
  }

  .label {
    font-size: 10px;
    color: var(--van-gray-5);
    font-weight: 500;
  }
}

.van-divider {
  margin-bottom: 8px;
}

.avatar-image {
  margin-right: 10px;
}

.nav-title {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;

  .van-icon {
    margin-left: 5px;
    transition: transform 0.3s;
  }

  .arrow-up {
    transform: rotate(180deg);
  }
}

.filter-popup {
  position: fixed;
  top: 46px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  background-color: var(--van-background);
  z-index: 11;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  animation: slideDown 0.5s ease-out;
}

@keyframes slideDown {
  from {
    transform: translateX(-50%) translateY(-20%);
    opacity: 0.5;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}

.filter-option {
  padding: 12px 20px;
  font-size: 14px;
  border-bottom: 1px solid var(--van-border-color);
  transition: background-color 0.2s;

  &:active {
    background-color: var(--van-active-color);
  }

  &.active {
    color: var(--van-primary-color);
    font-weight: 500;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      width: 16px;
      height: 16px;
      background-color: var(--van-primary-color);
      mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>');
      mask-size: cover;
    }
  }
}

.filter-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
