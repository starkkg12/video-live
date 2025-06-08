<template>
  <div class="comment-item" @click="handleClickComment">
    <div class="comment-avatar">
      <img :src="getImageUrl(userInfo?.avatar, 'avatar')" alt="用户头像" class="avatar" />
    </div>
    <div class="comment-content">
      <div class="comment-header">
        <div>
          <span class="username">{{ userInfo?.nickname }}</span>
          <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
        </div>
        <span class="like-btn" @click="toggleLike">
          <span v-if="likeCount > 0">{{ likeCount }}</span>
          <i :class="['icon', isLiked ? 'icon-liked' : 'icon-like']"></i>
        </span>
      </div>
      <div class="comment-text">{{ comment.content }}</div>
      <div class="comment-images">
        <Image
          v-for="(image, index) in images"
          fit="cover"
          :src="image"
          alt="评论图片"
          @click="e => handleClickImage(e, index)"
        />
      </div>
      <div class="comment-actions" v-if="!hasLoaded">
        <span v-if="!isReply && replyCount > 0" class="reply-count" @click="toggleReplies">
          {{ replyCount }}条回复
          <span class="material-icons-outlined" v-if="!showReplies">expand_more</span>
          <span class="material-icons-outlined" v-else>expand_less</span>
        </span>
      </div>

      <!-- 回复评论区域 -->
      <div class="replies-container" v-if="showReplies && !isReply">
        <Comment
          :commentId="comment.id.toString()"
          ref="commentRef"
          :max-height="'200px'"
          :usersDictionary="usersDictionary"
          :addUsersDictionary="addUsersDictionary"
          @loaded="handleLoaded"
        />
      </div>
    </div>
    <ImagePreview
      v-model:show="showPreview"
      :images="images"
      :start-position="currentIndex"
      teleport="body"
      closeable
    />

    <!-- 使用新的CommentInput组件 -->
    <CommentInput
      ref="commentInputRef"
      :commentId="comment?.id"
      @comment-added="handleCommentAdded"
      :placeholder="`回复: ${userInfo?.nickname}`"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent, computed, onMounted } from 'vue'
import { Image, ImagePreview } from 'vant'
import getImageUrl from '@/utils/getImageUrl'
import CommentInput from './CommentInput.vue'
import { setFeedInteraction, FeedAction } from '@/service/api'
import { formatMessageTime } from '@/utils/formatDate'

const Comment = defineAsyncComponent(() => import('./Comment.vue'))

const props = defineProps<{
  comment: {
    id: string
    userId: string
    createdAt: string
    content: string
    isLiked: boolean
    likeCount: number
    replyCount?: number
    metadata: {
      content: string
      images: string[]
      replyCount?: number
    }
  }
  isReply: boolean
  usersDictionary: any
  addUsersDictionary: any
}>()

const showReplies = ref(false)
const showPreview = ref(false)
const images = ref<string[]>(props.comment.metadata.images?.map(image => getImageUrl(image)) || [])
const currentIndex = ref(0)
const commentRef = ref<InstanceType<typeof Comment>>()
const commentInputRef = ref<InstanceType<typeof CommentInput>>()
const isLiked = ref(props.comment.isLiked)
const likeCount = ref(props.comment.likeCount || 0)
const userInfo = computed(() => {
  if (props.comment.userId.length < 25) {
    return props.usersDictionary[props.comment.userId]
  } else {
    return {
      nickname: '匿名用户',
      avatar: '',
    }
  }
})
const replyCount = ref(props.comment.replyCount || props.comment.metadata.replyCount || 0)
const hasLoaded = ref(false)

const handleClickImage = (e: Event, index: number) => {
  e.stopPropagation()
  e.preventDefault()
  showPreview.value = true
  currentIndex.value = index
}

const handleLoaded = () => {
  hasLoaded.value = true
}

const handleClickComment = (e: Event) => {
  e.stopPropagation()
  e.preventDefault()
  commentInputRef.value?.open()
}

const handleCommentAdded = (comment: any) => {
  commentRef.value?.insertComment(comment)
  showReplies.value = true
}

// 格式化时间
const formatTime = (timeString: string) => {
  const date = new Date(timeString)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diff < 60) return '刚刚'

  return formatMessageTime(date.getTime())
}

// 切换回复显示状态
const toggleReplies = (e: Event) => {
  e.stopPropagation()
  e.preventDefault()
  showReplies.value = !showReplies.value
}

// 点赞功能
const toggleLike = (e: Event) => {
  e.stopPropagation()
  e.preventDefault()
  setFeedInteraction(props.comment.id, {
    objectType: 'comment',
    action: isLiked.value ? FeedAction.Unlike : FeedAction.Like,
  })
  isLiked.value = !isLiked.value
  likeCount.value = isLiked.value ? likeCount.value + 1 : likeCount.value - 1
}

onMounted(() => {
  if (props.comment.userId.length < 25 && !props.usersDictionary[props.comment.userId]) {
    props.addUsersDictionary([props.comment.userId])
  }
})
</script>

<style scoped lang="less">
.comment-item {
  display: flex;
  margin-bottom: 16px;
  position: relative;
}

.comment-avatar {
  margin-right: 12px;
  flex-shrink: 0;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
  background-color: #f0f0f0;
}

.comment-content {
  flex: 1;
  overflow: hidden;
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  justify-content: space-between;
}

.username {
  font-weight: bold;
  margin-right: 8px;
  font-size: 14px;
}

.comment-time {
  color: #999;
  font-size: 12px;
}

.comment-text {
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 8px;
  word-break: break-all;
}
.comment-images {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  .van-image {
    width: 100px;
    height: 100px;
    border-radius: 4px;
    object-fit: cover;
    overflow: hidden;
  }
}

.comment-actions {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #999;
  padding-top: 8px;
  .material-icons-outlined {
    font-size: 20px;
    line-height: 1;
  }
}

.like-btn {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--van-gray-3);
  span {
    font-size: 14px;
    color: #ff4757;
  }
  i {
    font-size: 18px;
  }
}

.icon {
  margin-right: 4px;
}

.icon-like:before {
  content: '♡';
}

.icon-liked:before {
  content: '♥';
  color: #ff4757;
}

.reply-count {
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  gap: 2px;
}

.reply-count:hover {
  color: #1890ff;
}

.replies-container {
  padding-left: 0;
  padding-top: 10px;
}
</style>
