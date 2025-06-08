<script setup lang="ts">
import { Icon, Popup } from 'vant'
import { computed, ref, reactive, watch, onMounted, onBeforeUnmount, nextTick, inject, toRef, provide } from 'vue'
import CommentInput from '@/components/Comment/CommentInput.vue'
import ShakaVideoPlayer from '@/components/Video/VideoPlayerShaka.vue'
import StateManager from '@/components/StateManager.vue'
import { useFetchData, type UseFetchDataInterface } from '@/composables/useFetchData'
import { useVideoCommentStore } from '@/stores/useVideoCommentStore'

import { useShaka } from '@/composables/useShaka'
import { Swipe, SwipeItem } from 'vant'
import type { SwipeInstance } from 'vant'

import {
  setFeedInteraction,
  FeedAction,
} from '@/service/api'
import VideoContent from '@/components/Video/VideoContent.vue'
const swipeRef = ref<SwipeInstance | null>(null)


const props = defineProps(['videoList', 'activeIndex','visible','isActive', 'addUsersDictionary', 'usersDictionary', 'isMuted'])
const emit = defineEmits(['update:visible', 'update:usersDictionary', 'change', 'like', 'favorite', 'comment', 'share', 'follow','reach-bottom',  'update:isMuted'])
const { fetchData }: UseFetchDataInterface = useFetchData()
const followingMap = reactive<Record<string, boolean>>({})
const usersDictionary = inject('usersDictionary')
// 视频播放器元素引用
const shakaVideoPlayerPopupWrapper = ref<HTMLElement | null>(null)
const isRealPlay = ref(false)
const shakaVideoPlayerPopupRef = ref<InstanceType<typeof ShakaVideoPlayer> | null>(null)
const videoPlayerElement = ref<HTMLElement | null>(null)
const commentInputRef = ref<InstanceType<typeof CommentInput>>()
const backIconZIndex = ref(1000)
const isLoading = ref<boolean>(true)
const activeIndex = ref(props.activeIndex)
const isCommentShown = ref(false)
const videoCommentStore = useVideoCommentStore()
let videoCommentData = videoCommentStore.getOrCreateVideoCommentData(props.videoList[props.activeIndex].id)

const shakaInstance = useShaka()
const enableTransition = ref(false)
provide('isMuted', toRef(props, 'isMuted'))
const handleCommentAdded = (comment: any) => {
  // 更新原 videoList 資料（確保是 reactive）
  videoCommentData.insertComment(comment)
  updateActionStatus(props.videoList[activeIndex.value], FeedAction.Comment)
  backIconZIndex.value = 1000;
}

const onBack = () => {
    emit('update:visible', false)
}  
const updateActionStatus = (item: any, action: FeedAction, status?: boolean) => {
  if (action === FeedAction.Like) {
    item.likeCount += status ? 1 :  - 1
    if (item.likeCount < 0) {
      item.likeCount = 0
    } 
    emit('like', item, activeIndex.value,  status)
  } else if (action === FeedAction.Favorite) {
    item.favoriteCount += status ? 1 :  - 1
    emit('favorite', item, activeIndex.value,  status)
  } else if (action === FeedAction.Comment) {
    item.commentCount += 1
    emit('comment',item, activeIndex.value, status)
  } else if (action === FeedAction.Share) {
    item.shareCount += 1
    emit('share', item, activeIndex.value, status)
  } else if (action === FeedAction.Follow) {
    followingMap[item.userId] = true
  }
}
// 打开评论输入框
const showCommentPop = () => {
  nextTick(() => {
    if (commentInputRef.value && typeof commentInputRef.value.open === 'function') {
      backIconZIndex.value = 1
      isCommentShown.value = true
      commentInputRef.value?.open()
    } 
  })
  
}
const onCommentInputClosed = () => {
  backIconZIndex.value = 1000
  isCommentShown.value = false
}

const onRealPlay = () => {
  isRealPlay.value = true
}
const size = reactive({
  width: window.innerWidth,
  height: window.innerHeight,
})
const updateSize = () => {
  size.width = window.innerWidth
  size.height = window.innerHeight
  const swipeElement = swipeRef.value?.$el as HTMLElement
  if (swipeElement) {
    swipeElement.style.height = `${size.height}px`
  }
  const swipeInstance = swipeRef.value as any
  swipeInstance?.resize()
}
const swipeStyle = computed(() => ({
  width: `${size.width}px`,
  height: `${size.height}px`,
}))

const onSwipeChange = (index: number) => {
  activeIndex.value = index
  enableTransition.value = true
  setFeedInteraction(props.videoList.at(index)?.id!, {
    action: FeedAction.View,
  })
  isRealPlay.value = false;
  videoCommentData = videoCommentStore.getOrCreateVideoCommentData(props.videoList[index].id)
  // 最后一条数据时加载更多
  // if (props.videoList.length == index + 1) {
  //   emit('reach-bottom')
  // }
}

watch(() => usersDictionary, (newVal) => {
  emit('update:usersDictionary', newVal)
}, { deep: true })


const getVideoSrc = () => {
  const video = props.videoList[activeIndex.value]
  const src = video?.videoPath || video?.videoUrl || video?.url
  return src
}
const getVideoPoster = () => {
  const video = props.videoList[activeIndex.value]
  const poster = video?.poster || video?.preview
  return poster
}

const handlePopupOpened = () => {
  const playerId = 'shakaVideoPlayer' + props.videoList[props.activeIndex].id
  const el = document.getElementById(playerId)
  if (el) {
    el.style.position = 'relative'
    el.style.zIndex = '1'
  }

  shakaVideoPlayerPopupWrapper.value = document.getElementById('shakaVideoPlayerPopupWrapper')
  videoPlayerElement.value = document.getElementById('shakaVideoPlayerPopup')
}
const onMetadataLoaded = () => {
  emit('update:isMuted',  false)
}
onMounted(() => {
  nextTick(() => {
    updateSize()
  }) 
  window.addEventListener('resize', updateSize)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateSize)
})
</script>
<template>
    <Popup
        class="video-popup"
        :show="visible" 
        @update:show="val => emit('update:visible', val)"
        round
        closeable
        position="bottom"
        :overlay="true"
        teleport="body"
        :style="{ width: '100%', height: '100%' }"
        @opened="handlePopupOpened"
        :destroy-on-close="true"
        >
      <div class="video-content">
        <StateManager :loading="isLoading">
          <div class="video-feed" v-show="visible" ref="containerRef">
            <!-- 浮在影片上的返回按鈕 -->
            <Icon
              name="arrow-left"
              @click="onBack"
              color="white"
              size="24px"
              class="back-icon"
              :style="{ zIndex: backIconZIndex }" 
            />
            <div class="shaka-video-player-wrapper" id="shakaVideoPlayerPopupWrapper">
              <ShakaVideoPlayer
                id="shakaVideoPlayerPopup"
                class="shakaVideoPlayerPopup"
                ref="shakaVideoPlayerPopupRef"
                :src="getVideoSrc()"
                :poster="getVideoPoster()"
                :isActive="true"
                :isMuted="isMuted"
                :shakaInstance="shakaInstance"
                 @metadataLoaded="onMetadataLoaded"
                @realPlay="onRealPlay"
              />
            </div>
            <Swipe
               v-if="videoList.length"
               ref="swipeRef"
               class="video-swipe safe-area-full"
               :class="{ 'with-transition': enableTransition }"               
               vertical
               :show-indicators="false"
               :style="swipeStyle"
               :loop="false"
               @change="onSwipeChange"
               :touchable="!isCommentShown"
                :initial-swipe="activeIndex" >
                <SwipeItem v-for="(item, index) in videoList" :key="index" class="swipe-item">
                  <VideoContent
                      v-if="visible"
                      :data="item"
                      :isActive="activeIndex === index"
                      :fetchData="fetchData"
                      :shakaVideoPlayerRef="shakaVideoPlayerPopupRef"
                      shakaVideoPlayerId="shakaVideoPlayerPopup"
                      :shakaVideoPlayerWrapper="shakaVideoPlayerPopupWrapper"
                      :videoPlayerElement="videoPlayerElement"
                      :isRealPlay="isRealPlay"
                      :isVideoSearchPopup="true"
                      @setSwipeTouchableLock="(isLocked: boolean) => isCommentShown = isLocked"
                      @like="(status: boolean) => updateActionStatus(videoList[activeIndex], FeedAction.Like, status)"
                      @favorite="(status: boolean) => updateActionStatus(videoList[activeIndex], FeedAction.Favorite, status)"
                      @comment="() => updateActionStatus(videoList[activeIndex], FeedAction.Comment)"
                      @share="() => updateActionStatus(videoList[activeIndex], FeedAction.Share)"
                      @follow="() => updateActionStatus(videoList[activeIndex], FeedAction.Follow)"
                      :isFollowingAuthor="
                          followingMap[videoList[activeIndex].userId] !== undefined
                          ? followingMap[videoList[activeIndex].userId]
                          : videoList[activeIndex].isFollowingAuthor
                      "
                      >
                    </VideoContent>
                    <div class="comment-action safe-area-inset-bottom">
                      <div class="comment-box" @click="showCommentPop()">
                        <p>说点什么呢？</p>
                        <span class="material-icons-outlined">image</span>
                        <span class="material-icons-outlined">sentiment_satisfied_alt</span>
                      </div>
                      
                    </div>
                </SwipeItem>
              </Swipe>  
              <!-- 使用新的CommentInput组件 -->
                <CommentInput 
                  :videoId="videoList[activeIndex].id" 
                  :addCommentBackgroundWhite="true"
                  @comment-added="handleCommentAdded"
                  @close="onCommentInputClosed"
                  ref="commentInputRef" />
          </div>
        </StateManager>
      </div> 
    </Popup>
  </template>
  
<style scoped>
.swipe-item {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}
.shakaVideoPlayerPopup {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover;
}
.video-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: calc(100% - 56px);
  .video-feed {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 999;
    background-color: #000;
    overflow: hidden;
  }
  .video-feed.slide-up {
    opacity: 1;
  }
  .shaka-video-player-popup-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    z-index: 1;
    overflow: visible;
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
}
.back-icon {
  position: absolute;
  top: 12px; 
  left: 12px; 
  background-color: rgba(0, 0, 0, 0.4); 
  border-radius: 50%;
  padding: 8px; 
  font-size: 24px;
}
.shakaVideoPlayerPopup {
  position: relative;
  z-index: 1;
}

.video-popup :deep(.van-nav-bar) {
  background: var(--custom-block-1);
}
.video-popup :deep(.van-nav-bar .van-icon) {
  color: #fff !important;
}
.shaka-video-player-wrapper {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 0;
  width: 0;
  z-index: 10;
  
}

.comment-action {
    position: absolute;
    bottom: 10px;
    height: 30px;
    left: 0px;
    right: 0;
    z-index: 1000;
    .comment-box {
      display: flex;
      justify-content: space-between;
      background: #262626!important ;
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
/* transition */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.5s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
.slide-up-enter-to,
.slide-up-leave-from {
  transform: translateY(0%);
  opacity: 1;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.8s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.video-popup {
  width: 100%;
  height: 100%;
  max-width: 100%;
}
:deep(.video-comment) {
  position: absolute !important;
  bottom: -56px !important;
  top: auto !important;
  /* transform: none !important; */
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  max-height: 70vh;
  overflow: hidden;
}

:deep(.side-bar) {
  position: absolute;
  z-index: 2000 !important;
  pointer-events: auto;
}
:deep(.with-transition .van-swipe__track) {
  transition: transform 0.4s ease-in-out !important;
}
:deep(.svg-icon svg path[filter]) {
  filter: none !important;
}
@media (min-width: 768px) {
  .video-popup {
    width: 480px;
    margin: 0 auto;
  }
  .video-popup .video-content,
  .video-popup .video-feed,
  .video-popup .shaka-video-player-popup-wrapper {
    max-width: 480px;
    margin: 0 auto;
  }
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@media screen and (min-width: 768px) {
  /** 當視窗寬度大於768px視頻寬度自動匹配 */
  :deep(div.van-swipe.video-swipe[style]) {
    width: auto !important;
  }
}

</style>