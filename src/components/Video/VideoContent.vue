<script setup lang="ts">
import VideoComment from '@/components/Video/VideoComment.vue'
import VideoDescription from '@/components/Video/VideoDescription.vue'
import VideoSidebar from '@/components/Video/VideoSidebar.vue'
import { type FetchDataInterface } from '@/composables/useFetchData'
import { getOtherUserInfo } from '@/service/bbs'
import { inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useVideoCommentStore } from '@/stores/useVideoCommentStore'
const videoCommentStore = useVideoCommentStore()
const props = defineProps<{
  data: any
  isActive: boolean
  fetchData: (config: FetchDataInterface) => Promise<any>
  isDetail?: boolean
  preload?: boolean
  shakaVideoPlayerWrapper?: HTMLElement | null
  videoPlayerElement?: HTMLElement | null
  isRealPlay?: boolean
  isFollowingAuthor?: boolean
}>()

const emit = defineEmits([
  'like',
  'favorite',
  'comment',
  'share',
  'follow',
  'setSwipeTouchableLock',
])

const sidebarData = ref(props.data)
const userInfo = ref<Record<string, any>>({})
const videoPlayerContainer = ref<HTMLElement | null>(null)
const timer = ref<any>(null)

const addUsersDictionary = inject(
  'addUsersDictionary',
  ref((userIds: string[]) => {})
)
const usersDictionary = inject('usersDictionary', ref<Record<string, any>>({}))
const isMuted = inject('isMuted', ref(true))

const videoCommentRef = ref<InstanceType<typeof VideoComment> | null>(null)

const toggleMuted = () => {
  isMuted.value = !isMuted.value
}
const handlerShowComment = () => {
  if (videoCommentRef.value) {
    videoCommentRef.value.showComment()
    // 開啟評論時將上層的swipe鎖住不讓其滑動用
    emit('setSwipeTouchableLock', true)
  }
}

const switchVideoStyle = (type: 'show' | 'hide') => {
  if (!props.videoPlayerElement) return
  if (type === 'show') {
    props.videoPlayerElement.style.zIndex = '11'
    props.videoPlayerElement.style.opacity = '1'
  } else {
    props.videoPlayerElement.style.zIndex = '1'
    props.videoPlayerElement.style.opacity = '0'
  }
}

const handlerPlay = () => {
  if (props.videoPlayerElement) {
    switchVideoStyle('hide')
    videoPlayerContainer.value?.appendChild(props.videoPlayerElement)
    clearTimeout(timer.value)
    timer.value = setTimeout(() => {
      switchVideoStyle('show')
    }, 300)
  }
}

watch(
  () => props.isActive,
  (newVal, oldVal) => {
    initVideo(newVal, oldVal)
  }
)

watch(
  () => props.isRealPlay,
  newVal => {
    if (newVal && props.isActive) {
      handlerPlay()
    }
  }
)

const initVideo = (newVal: boolean, oldVal?: boolean) => {
  if (!newVal && oldVal && props.shakaVideoPlayerWrapper && props.videoPlayerElement) {
    switchVideoStyle('hide')
    props.shakaVideoPlayerWrapper.appendChild(props.videoPlayerElement)
  }
}

// 处理视频互动事件
const handleLikeEvent = (isLiked: boolean) => {
  emit('like', isLiked)
}

const handleFavoriteEvent = (isFavorite: boolean) => {
  emit('favorite', isFavorite)
}

const handleCommentEvent = () => {
  emit('comment')
}

const handleShareEvent = () => {
  emit('share')
}

const handleFollowEvent = () => {
  emit('follow')
}

onMounted(async () => {
  if (!props.preload) {
    userInfo.value =
      (await props.fetchData({
        fetchFn: getOtherUserInfo,
        fetchParams: sidebarData.value.userId,
        openCache: true,
      })) || {}
    sidebarData.value = {
      ...sidebarData.value,
      poster: userInfo.value.avatar,
      userId: userInfo.value.userId,
    }
  }
  initVideo(props.isActive)
})

onBeforeUnmount(() => {
  clearTimeout(timer.value)
  videoCommentStore.release(props.data.id)
})
watch(
  () => props.data,
  newVal => {
    sidebarData.value = newVal
  },
  { immediate: true, deep: true }
)
</script>
<template>
  <div class="video-content safe-area-inset-bottom">
    <div class="video-player-container" ref="videoPlayerContainer">
      <!-- 插入VideoPlayerShaka元素 -->
      <div class="video-player-image-container">
        <img class="video-player-image" :src="data.poster" />
      </div>
    </div>
    <VideoDescription
      :auther="userInfo.nickname"
      :userId="data.userId"
      :time="data.createdAt"
      :content="data.description"
      :labels="data.tags"
      :gameTypeName="data.gameTypeName"
    ></VideoDescription>
    <VideoComment
      ref="videoCommentRef"
      :id="data.id"
      :addUsersDictionary="addUsersDictionary"
      :usersDictionary="usersDictionary"
      :searchPage="false"
      @comment="handleCommentEvent"
      @close="emit('setSwipeTouchableLock', false)"
    ></VideoComment>
    <VideoSidebar
      :sidebarData="sidebarData"
      :isActive="isActive"
      @showComments="handlerShowComment"
      @like="handleLikeEvent"
      @favorite="handleFavoriteEvent"
      :toggleMuted="isDetail ? toggleMuted : undefined"
      :isMuted="isDetail ? isMuted : undefined"
      :addUsersDictionary="addUsersDictionary"
      :usersDictionary="usersDictionary"
      @share="handleShareEvent"
      @follow="handleFollowEvent"
      :isFollowingAuthor="isFollowingAuthor"
    ></VideoSidebar>
  </div>
</template>

<style scoped lang="less">
.video-content {
  display: flex;
  align-items: center;
  position: absolute;
  top: 0;
  height: 100%;
  width: 100%;
  .video-player-container {
    position: relative;
    height: 100%;
    width: 100%;
    .video-player-image-container {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      object-fit: contain;
      z-index: 10;
      img.video-player-image {
        height: 100%;
        width: 100%;
        object-fit: contain;
      }
      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        z-index: 10;
      }
    }
  }
  .mask {
    position: absolute;
    z-index: 10;
    top: 0;
    bottom: 30px;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    span {
      color: #fff;
      font-size: 100px;
    }
  }
}
</style>
