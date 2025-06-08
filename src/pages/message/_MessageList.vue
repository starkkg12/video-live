<script setup lang="ts">
import { computed, ref } from 'vue'
import service from '@/service'
import { showFailToast, NavBar, List, Divider, Icon } from 'vant'
import StateManager from '@/components/StateManager.vue'
import utils from '@/utils'
import dayjs from 'dayjs'

interface MessageItem {
  msgId: string
  type: string
  title: string
  content: string
  img: string
  msgTime: number
  isRead: boolean
  msgObj: {
    isSecretDesc: string
    announcementScope: string
    announcementId: string
    announcementTitle: string
    announcementDesc: string
    sourceType: string
    followerUserId: string
    url: string
    likeFlag: string
    favoriteFlag: string
  }
  userId: string
  roomId: string
  unreadCount: string
  totalCount: string
}

const props = defineProps<props>()

const isLoading = ref(false)
const isError = ref(false)
const isFinished = ref(false)

const configs = [
  {
    key: 'system',
    title: '系统公告',
    types: ['s'],
    getMessageList: async (page: number, size: number) =>
      service.message.getUserMessageList(page, size, 's'),
  },
  {
    key: 'voice',
    title: '语音房',
    types: ['r', 't'],
    getMessageList: async (page: number, size: number) =>
      service.message.getUserMessageList(page, size, 't'),
  },
  {
    key: 'activity',
    title: '活动',
    types: ['v'],
    getMessageList: service.message.getActivityMessageList,
  },
  {
    key: 'interaction',
    title: '互动消息',
    types: ['c', 'l', 'f', 'd', 'a'],
    getMessageList: service.message.getMessageFavoritesAndLikesList,
  },
  {
    key: 'collect',
    title: '喜欢和收藏',
    types: ['c', 'l'],
    getMessageList: service.message.getMessageFavoritesAndLikesList,
  },
  {
    key: 'follow',
    title: '关注',
    types: ['i'],
    getMessageList: service.message.getMessageFollowersList,
  },
  {
    key: 'comment',
    title: '评论和@',
    types: ['d', 'a'],
    getMessageList: service.message.getMessageCommentsAndMentionsList,
  },
]

interface props {
  msgKey: string
}

const config = computed(() => configs.find(c => c.key === props.msgKey)!)

const total = ref(0)
const page = ref(1)
const size = ref(10)

const messageList = ref<MessageItem[]>([])

function onBack() {
  window.history.back()
}

function flagToString(flag: string) {
  switch (flag) {
    case 'b':
      return 'bbs'
    case 'f':
      return '论坛'
    case 'm':
      return '主板'
    case 'p':
      return '帖子'
    case 't':
      return '图库｜期刊'
    case 'c':
      return '论坛评论'
    case 'u':
      return '图库评论'
    case 's':
      return '系列'
  }
}

async function onLoad() {
  if (isFinished.value || isError.value) {
    return
  }
  try {
    isLoading.value = true
    isError.value = false
    const response = await config.value.getMessageList(page.value, size.value)

    if (!response.data.success) {
      isError.value = false
      showFailToast(response.data.errMessage)
      return
    }
    total.value = Number(response.data.data.total)
    messageList.value.push(
      ...response.data.data.list.map((message: any) => {
        switch (message.type) {
          case 'f':
            message.content =
              `<span style='font-weight: bold'>${message.msgObj.nickname}</span>` + '关注了你'
            break
          case 'l':
            message.content =
              `<span style='font-weight: bold'>${message.msgObj.nickname}</span>` +
              '喜欢了你的' +
              flagToString(message.msgObj.likeFlag)
            break
          case 'c':
            message.content =
              `<span style='font-weight: bold'>${message.msgObj.nickname}</span>` +
              '收藏了你的' +
              flagToString(message.msgObj.favoriteFlag)
            break

          case 'd':
            message.content =
              `<span style='font-weight: bold'>${message.msgObj.nickname}</span>` +
              '评论了：' +
              message.msgObj.content

            break
        }
        return message
      })
    )
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

function onClickCell(message: MessageItem) {
  switch (message.type) {
    case 'f':
      utils.jumpToUser(message.msgObj.followerUserId)
      break
    case 'v':
      utils.jumpTo(message.msgObj.url)
      break
    case 't':
      utils.jumpToRoom(message.msgObj)
      break
    case 'c':
      switch (message.msgObj.favoriteFlag) {
        case 'c':
        case 'p':
          // 跳转到论坛
          // utils.jumpToBbs(message.msgObj.sourceId)
          break
        case 'u':
        case 't':
          // 跳转到图库
          // utils.jumpToDrawing(message.msgObj.sourceId)
          break
      }
      break
    case 'l':
      switch (message.msgObj.likeFlag) {
        case 'c':
        case 'p':
          // 跳转到论坛
          // utils.jumpToBbs(message.msgObj.sourceId)
          break

        case 'u':
        case 't':
          // 跳转到图库
          // utils.jumpToDrawing(message.msgObj.sourceId)
          break
      }
      break
    case 'd':
      if (message.msgObj.sourceType === 'drawing') {
        // 跳转到图库
        // utils.jumpToDrawing(message.msgObj.sourceId)
      }
      if (message.msgObj.sourceType === 'post') {
        // 跳转到帖子
        // utils.jumpToPost(message.msgObj.sourceId)
      }
      break
  }
}
</script>

<template>
  <StateManager
    :error="isError"
    @refresh="
      () => {
        isFinished = false
        isError = false
        page = 1
        messageList = []
        onLoad()
      }
    "
  >
    <div class="wrapper">
      <NavBar class="nav-bar" left-text="" left-arrow @click-left="onBack()">
        <template #title>
          {{ config.title }}
        </template>
      </NavBar>

      <List
        v-model:loading="isLoading"
        :finished="isFinished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div class="message-item" v-for="message of messageList" @click="onClickCell(message)">
          <div class="top">
            <div class="title">{{ message.title }}</div>
            <div class="time">{{ dayjs(message.msgTime).format('YYYY-MM-DD HH:mm:ss') }}</div>
          </div>
          <div class="content" v-html="message.content" />
          <Divider />
          <div class="more">
            查看更多
            <Icon name="arrow" />
          </div>
        </div>
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

.wrapper :deep(.van-nav-bar--fixed) {
  max-width: 600px;
  left: auto;
  z-index: 12; // 增加导航栏的 z-index 值，确保其高于蒙层和弹出层
}

.message-item {
  padding: 16px;
  background-color: var(--van-card-background);
  border: 1px solid var(--van-card-border-color);
  border-radius: 12px;
  margin: 8px;
  width: calc(100% - 16px);
  padding-bottom: 8px;
  user-select: none;
  cursor: pointer;

  .top {
    display: flex;
    justify-content: space-between;
    .title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .time {
      font-size: 12px;
      color: var(--van-text-color);
    }
  }

  .content {
    font-size: 14px;
    color: var(--van-text-color);
  }
}

.van-divider {
  margin-bottom: 8px;
}
</style>
