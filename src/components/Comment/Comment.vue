<template>
  <div class="comment-list" :style="{ maxHeight: maxHeight }">
    <List
      :loading="loading"
      :finished="currentPage >= totalPages"
      :finished-text="hiddenTips || comments.length === 0 ? '' : ''"
      @load="loadMoreComments"
    >
      <div v-if="comments.length === 0 && !loading" class="empty-comment">暂无评论</div>
      <template v-else>
        <CommentItem
          v-for="comment in comments"
          :key="comment.id"
          :comment="comment"
          :isReply="!!commentId"
          :usersDictionary="usersDictionary"
          :addUsersDictionary="addUsersDictionary"
        />
      </template>
    </List>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { List } from 'vant'
import CommentItem from './CommentItem.vue'
import useVideoCommentData from './useVideoCommentData'

const props = withDefaults(
  defineProps<{
    videoId?: string
    commentId?: string
    videoCommentData?: any
    maxHeight?: string
    hiddenTips?: boolean
    usersDictionary?: any
    addUsersDictionary?: any
  }>(),
  {
    maxHeight: '50vh',
    hiddenTips: false,
  }
)

const {
  comments,
  loading,
  error,
  currentPage,
  pageSize,
  totalPages,
  fetchComments,
  fetchReplies,
  insertComment,
} = props.videoCommentData || useVideoCommentData(props.videoId || '', props.commentId || '')

const emit = defineEmits(['loaded'])

const fetchNow = () => {
  if (props.videoId) {
    fetchComments()
  } else if (props.commentId) {
    fetchReplies()
  }
}
// 加载更多评论
const loadMoreComments = () => {
  if (!loading.value && currentPage.value < totalPages.value && !error.value) {
    fetchNow()
  }
}

// 监听属性变化，重新获取评论
watch(
  () => props.videoId,
  newVal => {
    if (newVal) {
      comments.value = [] // 清空原有评论
      currentPage.value = 0 // 重置为0，这样第一次加载会获取第1页
      fetchNow()
    }
  }
)

watch(
  () => props.commentId,
  newVal => {
    if (newVal) {
      comments.value = [] // 清空原有评论
      currentPage.value = 0 // 重置为0，这样第一次加载会获取第1页
      fetchNow()
    }
  }
)

watch(
  () => comments.value,
  newVal => {
    if (newVal.length > 0) {
      emit('loaded')
    }
  }
)

// 组件挂载时获取评论
onMounted(() => {
  if (props.videoId || props.commentId) {
    fetchNow()
  }
})

defineExpose({
  insertComment,
})
</script>

<style scoped>
.comment-list {
  overflow-y: auto;
}

.empty-comment {
  text-align: center;
  padding: 20px 0;
  color: #999;
  font-size: 14px;
}
</style>
