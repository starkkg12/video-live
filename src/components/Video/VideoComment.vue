<script setup lang="ts">
import { ref, inject, watch, onMounted } from 'vue'
import { Popup } from 'vant'
import Comment from '@/components/Comment/Comment.vue'
import CommentInput from '@/components/Comment/CommentInput.vue'
import { useVideoCommentStore } from '@/stores/useVideoCommentStore'
const showCommentFlag = ref(false)
const props = defineProps<{
  id: string
  addUsersDictionary: (userIds: string[]) => void
  usersDictionary: Record<string, any>
  searchPage: boolean,
  commentCount: number
}>()
const emit = defineEmits(['refreshCommentCount', 'comment'])
const videoCommentStore = useVideoCommentStore()
const videoCommentData = videoCommentStore.getOrCreateVideoCommentData(props.id)

const showComment = async () => {
  showCommentFlag.value = true
 
}
const handleClose = () => {}

const total = ref(0)
const commentInputRef = ref<InstanceType<typeof CommentInput>>()
const searchPage = ref<boolean>(props.searchPage ? props.searchPage : false)
defineExpose({
  showComment,
})
const commentRef = ref<InstanceType<typeof Comment>>()

// 打开评论输入框
const showCommentPop = () => {
  commentInputRef.value?.open()
}

// 处理新评论添加
const handleCommentAdded = (comment: any) => {
     videoCommentData.insertComment(comment)
     emit('comment')
     // 更新目前評論數到父component
     emit('refreshCommentCount', videoCommentData.total.value)
}
onMounted(() => {
  console.log('✅ VideoComment mounted')
})
</script>
<template>
  <Popup
    class="video-comment"
    :class="[searchPage ? 'positionFixed' : '']"
    id="comment"
    v-model:show="showCommentFlag"
    round
    closeable
    @closed="handleClose"
    position="bottom"
    :style="{ width: '100%', height: `${total > 0 ? '70%' : ''}` }"
    :destroy-on-close="true"
  >
    <h3 class="comment-title">{{ videoCommentData.total }}条评论</h3>
    <!-- 评论部分 -->
    <div class="comment-wrapper safe-area-inset-bottom" id="commentRef">
      <Comment
        :videoId="props.id"
        ref="commentRef"
        :videoCommentData="videoCommentData"
        :usersDictionary="usersDictionary"
        :addUsersDictionary="addUsersDictionary"
      />
    </div>
    <div class="comment-action safe-area-inset-bottom">
      <div class="comment-box" @click="showCommentPop()">
        <p>说点什么呢？</p>
        <span class="material-icons-outlined">image</span>
        <span class="material-icons-outlined">sentiment_satisfied_alt</span>
      </div>
      <!-- 使用新的CommentInput组件 -->
      <CommentInput :videoId="props.id" @comment-added="handleCommentAdded" ref="commentInputRef" />
    </div>
  </Popup>
</template>

<style scoped lang="less">
.video-comment {
  background: #fff;
  padding: 10px;
  max-width: 100%;
  position: absolute;
  h3.comment-title {
    text-align: center;
    padding-bottom: 10px;
  }
  .comment-wrapper {
    height: calc(100% - 70px);
    -webkit-overflow-scrolling: touch;
    overflow-y: auto;
    scrollbar-width: none;
    padding-bottom: 30px;
    li {
      margin-bottom: 10px;
      .comment-top {
        display: flex;
        justify-content: space-between;
        .user {
          display: flex;
          font-size: 14px;
          line-height: 30px;
          .avatar {
            margin-right: 5px;
          }
          .name {
            font-weight: bold;
            margin-right: 5px;
          }
          .time {
            font-size: 12px;
          }
        }
        .like {
          display: flex;
          align-items: center;
          font-size: 14px;
          span {
            font-size: 16px;
            margin-left: 5px;
          }
          .red {
            color: #f00;
          }
        }
      }
      .comment-content {
        padding: 5px 5px 5px 30px;
        font-size: 13px;
      }
    }
  }
  .comment-action {
    position: absolute;
    bottom: 10px;
    height: 30px;
    left: 0px;
    right: 0;
    .comment-box {
      display: flex;
      justify-content: space-between;
      border: solid 1px #ccc;
      border-radius: 10px;
      padding: 5px 10px;
      margin: 0 10px;
      background: #fff;
      align-items: center;
      p {
        flex: 1;
        font-size: 13px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #999;
      }
      span {
        font-size: 22px;
        margin-left: 5px;
        color: #999;
      }
    }
  }
}
.nodata {
  text-align: center;
  font-size: 14px;
  color: #999;
  padding: 30px 0 50px;
  .van-image {
    width: 60px;
    margin: 0 auto;
    display: block;
  }
}
.positionFixed {
  position: fixed !important;
}

.safe-area-inset-bottom {
  margin-bottom: constant(safe-area-inset-bottom);
  margin-bottom: env(safe-area-inset-bottom);
}
@media screen and (min-width: 768px) {
  .video-comment {
    width: var(--custom-max-width) !important;
    margin: 0 auto;
    left: 0;
    right: 0;
  }
}
</style>
