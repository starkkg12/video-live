<script setup lang="ts">
import { ref, nextTick, computed, watch } from 'vue'
import { Popup, Button, showSuccessToast } from 'vant'
import { setFeedInteraction, FeedAction } from '@/service/api'
import Login from '@/components/Login.vue'
import InputUpload from '@/components/InputUpload.vue'
import { emojis } from '@/assets/data/emojis'
import utils from '@/utils'


const props = withDefaults(defineProps<{
  videoId?: string
  commentId?: string
  placeholder?: string
  addCommentBackgroundWhite: boolean
}>(), {
  addCommentBackgroundWhite: true
})

const emit = defineEmits<{
  (e: 'comment-added', comment: any): void
  (e: 'close'): void 
}>()

const showCommentInput = ref(false)
const showEmoji = ref(false)
const commentInput = ref<string>('')
const cursorPosition = ref<number>(0)
const inputRef = ref<HTMLTextAreaElement | null>(null)
const images = ref<File[]>([])
const imagesPath = ref<string[]>([])
const inputUploadInstance = ref<InstanceType<typeof InputUpload>>()
const showLoginModal = ref<boolean>(false)

// 计算placeholder
const actualPlaceholder = computed(() => props.placeholder || '说点什么呢？')

// 计算输入框显示内容
const inputText = computed(() => {
  return commentInput.value || actualPlaceholder.value
})

const saveCursorPosition = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  cursorPosition.value = target.selectionStart!
}

const insertEmoji = (emoji: string) => {
  const input = inputRef.value
  if (input) {
    const before = commentInput.value.slice(0, cursorPosition.value)
    const after = commentInput.value.slice(cursorPosition.value)
    const newText = `${before}${emoji}${after}`
    commentInput.value = newText

    const newCursorPosition = cursorPosition.value + emoji.length

    nextTick(() => {
      input.setSelectionRange(newCursorPosition, newCursorPosition)
      input.focus()
    })
  }
}

const toggleEmoji = () => {
  if (!showEmoji.value) {
    showEmoji.value = true
    inputRef.value?.focus()
  } else {
    showEmoji.value = false
  }
}

const handleImagesChange = (files: File[]) => {
  images.value = files
}

const triggerUpload = () => {
  inputUploadInstance.value?.chooseFile()
}

const uploadImages = async () => {
  await inputUploadInstance.value?.upload(sendImage)
}

const sendImage = (path: string) => {
  imagesPath.value.push(path)
}

const onPublishComments = async () => {
  
  if (utils.isLoggedIn() === 'not-logged-in') {
    showLoginModal.value = true
    return
  }
  if (images.value.length) {
    await uploadImages()
  } else if (!commentInput.value) {
    showSuccessToast('请输入评论内容')
    return
  }

  const id = props.videoId || props.commentId || ''
  const action = props.videoId ? FeedAction.Comment : FeedAction.ReplyComment
  const objectType = props.videoId ? 'video' : 'comment'

  const res = await setFeedInteraction(id, {
    action,
    objectType,
    metadata: {
      content: commentInput.value,
      images: imagesPath.value,
    },
  })

  if (res.data.success) {
    showSuccessToast('评论成功')

    // 将新评论发送给父组件
    emit('comment-added', {
      ...res.data.data,
      content: commentInput.value,
      userId: res.data.data.actorId,
      metadata: {
        content: commentInput.value,
        images: imagesPath.value,
      },
    })

    // 重置状态
    commentInput.value = ''
    images.value = []
    imagesPath.value = []
    handleClose()
  }
}

// 定义打开评论框的方法
const open = () => {
  showCommentInput.value = true
  nextTick(() => {
    inputRef.value?.focus()
  })
}

// 关闭时清空emoji状态
const handleClose = () => {
  showEmoji.value = false
  showCommentInput.value = false
  emit('close')
  // 添加延时确保键盘完全收起后再重置页面位置
  setTimeout(() => {
    window.scrollTo(0, 0)
  }, 100)
}

// 計算輸入字數
const isSendActive = computed(() => commentInput.value.trim().length > 0)

// 向外暴露方法
defineExpose({
  open,
})
</script>

<template>
  <Popup 
    class="loginModel"
    teleport="body"
     v-model:show="showLoginModal" v-if="showLoginModal">
        <Login 
          :size="'small'"
          :callback="true"
          @closeLoginModal="showLoginModal = false" 
          />
      </Popup>
  <Popup
    v-model:show="showCommentInput"
    position="bottom"
    teleport="body"
    @close="handleClose"
    class="popup-adaptive"
    overlay-class="popup-overlay"
  >
    <div 
      class="add-comment"
      :class="[{ 'white-background-set': addCommentBackgroundWhite }]"
      >
      <InputUpload
        label="相册"
        :auto="false"
        @change="handleImagesChange"
        :useCustomTrigger="true"
        ref="inputUploadInstance"
      />
      <textarea
        class="input-area"
        rows="3"
        v-model="commentInput"
        ref="inputRef"
        @focus="saveCursorPosition"
        @input="saveCursorPosition"
        @keyup="saveCursorPosition"
        @click="saveCursorPosition"
        :placeholder="actualPlaceholder"
      ></textarea>
      <div>
        <p>
          <span class="material-icons-outlined current-text-color" @click="triggerUpload"
            >image</span
          >
          <span class="material-icons-outlined current-text-color" @click="toggleEmoji()"
            >sentiment_satisfied_alt</span
          >
        </p>
        <Button 
          size="small" 
          :class="{ 'send-active': isSendActive }"
          plain 
          round 
          @click="onPublishComments">发送</Button>
      </div>
      <ul :class="`emoji-list ${showEmoji ? 'show' : ''}`">
        <li v-for="emoji in emojis" @click="insertEmoji(emoji)">
          {{ emoji }}
        </li>
      </ul>
    </div>
  </Popup>
  
</template>

<style scoped lang="less">
.add-comment {
  padding: 10px;
  .van-cell {
    border: solid 1px #ccc;
    border-radius: 5px;
    font-size: 14px;
    margin-bottom: 10px;
  }
  div {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .van-uploader {
    float: left;
  }
  span {
    margin-left: 10px;
  }
}
.emoji-list {
  height: 0;
  overflow-y: auto;
  scrollbar-width: none;
  transition: all 0.3s;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(36px, 1fr));
  &.show {
    height: 240px;
    @media (max-width: 768px) {
      height: 110px;
    }
  }
  li {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    aspect-ratio: 1 / 1;
  }
}
.input-area {
  width: 100%;
  border-radius: 10px;
  padding: 10px;
  font-size: 14px;
}
.popup-overlay {
  opacity: 0.2 !important;
}

.loginModel {
  overflow: visible!important;
}
.login-small {
  .logo {
    width: 100%;
    height: 12rem;
    display: flex;
    justify-content: center; // 水平置中
    align-items: end; // 底部對齊
    position: relative;
  }

  .logo-image {
    width: 1.5rem;
    height: 1.5rem;
    background-color: #000;
    border-radius: 2rem;
    box-shadow: 0 0 .36rem #898989;
    margin: 0 auto; // 保險置中
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .close-btn {
    position: fixed;
    top: 0.2rem;
    padding: .06rem;
    right: 0.2rem;
    border-radius: 50%;
    border: 1px solid #fff;
    color: #fff;
    font-size: 16px;
    background-color: transparent;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
    cursor: pointer;
  }
}
.send-active {
  background-color: #ee0a24 !important;
  color: #fff !important;
  border: none !important;
}
.white-background-set {
  background: white;
  .current-text-color {
    color: #000
  }
  .input-area {
    background: #f3f3f3;
    color: inherit;
    border: unset;
  }
}
</style>
