<script setup lang="ts">
import { inject, onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue'
import { Image, showSuccessToast } from 'vant'
import { useFetchData } from '@/composables/useFetchData'
import { getOtherUserInfo } from '@/service/bbs'
import { setFeedInteraction, FeedAction } from '@/service/api'
import { formatMessageTime } from '@/utils/formatDate'
import SvgIcon from '@/components/SvgIcon.vue'
import getImageUrl from '@/utils/getImageUrl'
import SharePopup from '@/components/Video/SharePopup.vue'
import VideoComment from '@/components/Video/VideoComment.vue'
import IconShare from '@/assets/icons/search/share.svg'
import IconMessage from '@/assets/icons/search/message.svg'
import IconHeart from '@/assets/icons/search/heart.svg'
import IconHeartLike from '@/assets/icons/search/heart-like.svg'
import IconVolumeOff from '@/assets/icons/short_video/volume_off.svg'
import IconEye from '@/assets/icons/search/eye.svg'
import { useVideoCommentStore } from '@/stores/useVideoCommentStore'
import jumpTo from '@/utils/jumpTo'
import search from '@/utils/search'

const props = defineProps(['data', 'videoList', 'index', 'activeIndex', 'isMuted'])
const emit = defineEmits(['showRenderPopup', 'comment', 'toggleMuted'])

const { fetchData } = useFetchData()
const userInfo = ref<Record<string, any>>({})
const sidebarData = ref(props.data)
const rootRef = ref<HTMLElement | null>(null)
const videoCommentRef = ref<InstanceType<typeof VideoComment> | null>(null)
const addUsersDictionary = inject('addUsersDictionary')
const usersDictionary = inject('usersDictionary')
const videoCommentStore = useVideoCommentStore()
const isLiked = ref<boolean>(false)
const showSharePopup = ref(false)
const showCommentFlag = ref(false)
const likeCount = ref<number>(props.data.likeCount)
const shareCount = ref<number>(props.data.shareCount)
const commentCount = ref<number>(props.data.commentCount)
const isPortrait = ref<boolean|null>(null)

// 更新點贊數、評論數(接收來自videoPlayerPopupe更新用)
const updateCount = (data: any) => {
  likeCount.value = data.likeCount
  isLiked.value = data.isLiked
  commentCount.value = data.commentCount
  sidebarData.value = {
    ...sidebarData.value,
    ...data
  }
}
// 公開化updateCount方法
defineExpose({
  el: rootRef,
  updateCount
})
// 打開評論或分享
const openPanel = (type: 'comment' | 'share') => {
  if (type === 'comment') {
    showSharePopup.value = false
    showCommentFlag.value = true
  } else if (type === 'share') {
    showSharePopup.value = true
    showCommentFlag.value = false
  }
}

const jumpToUser = (userId: string) => {
  jumpTo(`/user/${userId}`)
}
const showRenderPopup = (data: any, index: number) => {
  emit('showRenderPopup', data, index)
}
// 數字轉換為万
const formatToWan = (num: number) => {
  if (num < 10000) return `${num}`
  const value = num / 10000
  return Number.isInteger(value) ? `${value}万` : `${value.toFixed(1).replace(/\.0$/, '')}万`
}
// 點讚或取消讚
const handleToggleLike = async () => {
  const res = await setFeedInteraction(sidebarData.value.id, {
    action: isLiked.value ? FeedAction.Unlike : FeedAction.Like,
  })
  if (res.data.success) {
    isLiked.value = !isLiked.value
    likeCount.value += isLiked.value ? 1 : -1
    if (likeCount.value < 0) {
      likeCount.value = 0
    }
    sidebarData.value.isLiked = isLiked.value
    sidebarData.value.likeCount = likeCount.value
    props.data.isLiked = isLiked.value
    props.data.likeCount = likeCount.value
    showSuccessToast(isLiked.value ? '点赞成功' : '取消点赞')
  } else {
    console.error('VideoSidebar - like API request failed:', res.data)
  }
}
// 格式化時間
const formatTime = (timeString: string) => {
  const date = new Date(timeString)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return '刚刚'
  return formatMessageTime(date.getTime())
}
// 更新畫面上這物件的點讚數
const refreshCommentCount = (count: number) => {
  commentCount.value += 1
  sidebarData.value.commentCount = count
  emit('comment', sidebarData.value)
}

const getVideoPoster = () => props.data.poster || props.data.preview
onMounted(async () => {
  userInfo.value = await fetchData({ fetchFn: getOtherUserInfo, fetchParams: props.data.userId, openCache: true }) || {}
  sidebarData.value = {
    ...sidebarData.value,
    poster: userInfo.value.avatar,
    userId: userInfo.value.userId,
    nickName: userInfo.value.nickname,
  }
  isLiked.value = sidebarData.value.isLiked
  const img = new window.Image()
  img.src = getVideoPoster()
  img.onload = () => {
    isPortrait.value = img.naturalWidth < img.naturalHeight
  }
})
onBeforeUnmount(() => {
  videoCommentStore.release(props.data.id)
})
watch(() => props.data.likeCount, (newVal) => {
  likeCount.value = newVal
})
watch(() => showCommentFlag.value, async()=> {
  await nextTick();
  if (showCommentFlag.value && videoCommentRef.value) {
    videoCommentRef.value?.showComment?.()
  }
})
</script>

<template>
  <div class="search-video-content" ref="rootRef" :data-video-id="data.id">
    <div class="video-item-info">
      <div class="avatar">
        <Image
          :src="getImageUrl(sidebarData.poster, 'avatar')"
          round
          @click="jumpToUser(sidebarData.userId)"
          class="avatarImg"
        />
      </div>
      <div class="v-item-con">
        <div>{{ sidebarData.nickName }}</div>
        <div class="timestamp">{{ formatTime(sidebarData.createdAt) }}</div>
      </div>
    </div>

    <div class="v-item-content">
      {{ sidebarData.description }}
      <span class="tags">
        <span v-for="item2 in sidebarData.tags" :key="'tagsId' + item2.id" @click="search(item2.name, true)">#{{ item2.name }}</span>
      </span>
    </div>

    <div 
       class="video-data" 
       @click="showRenderPopup(data, index)
       ">
      <div 
        class="imgv"
        :class="{ portrait: isPortrait === true, landscape: isPortrait === false }"
        :style="{ backgroundImage: `url(${getVideoPoster()})` }"
        >
        <div 
          class="muted"
          v-if="isMuted"
          @click.stop="emit('toggleMuted')"
          >
          <div class="icon-wrapper-circle">
            <SvgIcon class="icon-button" :icon="IconVolumeOff.src" :color="'#fff'" size="16" />
          </div>
        </div>
      </div>
      
    </div>

    <ul class="actions side-bar">
      <li class="icon"><SvgIcon :icon="IconEye.src" :color="'#fff'" />{{ formatToWan(data.viewCount) }}</li>
      <li class="icon favorite" @click="handleToggleLike">
        <SvgIcon :icon="isLiked ? IconHeartLike.src : IconHeart.src" :color="'#fff'" />
        {{ likeCount > 0 ? formatToWan(likeCount) : '点赞' }}
      </li>
      <li class="icon comment" @click="openPanel('comment')">
        <SvgIcon :icon="IconMessage.src" :color="'#000'" size="23" :isSearchPage="true" />
        {{ commentCount > 0 ? formatToWan(Number(commentCount)) : '评论' }}
      </li>
      <li class="icon share" @click="openPanel('share')">
        <SvgIcon :icon="IconShare.src" :color="'#fff'" size="23" :isSearchPage="true" />
        {{ shareCount > 0 ? formatToWan(shareCount) : '分享' }}
      </li>
    </ul>
    <VideoComment
      ref="videoCommentRef"
      :id="sidebarData.id"
      v-model:visible="showCommentFlag"
      class="local-video-comment"
      :usersDictionary="usersDictionary"
      :searchPage="true"
      :addUsersDictionary="addUsersDictionary"
      @refreshCommentCount="refreshCommentCount"
      @close="showCommentFlag = false"
    />
    <SharePopup :id="data.id" :videoPath="data.videoPath" v-model:visible="showSharePopup" />
  </div>
</template>

<style scoped>
.comment {
  display: flex;
  align-items: center;
}

.share {
  display: flex;
  align-items: center;
}
.local-video-popup {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1001;
  background: #fff;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  overflow: hidden;
}
.local-video-comment {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1001;
  background: #fff;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  overflow: hidden;
  max-height: 70vh;
}
.search-video-content {
  height: 100%;
  width: 100%;
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

.timestamp {
  color: #888;
  font-size: 12px;
  margin: 4px 0 8px;
}

.tags span {
  margin-right: 7px;
  color: #57b6d3;
  font-weight: 500;
}

.thumb {
  width: 100%;
  margin-top: 8px;
  border-radius: 6px;
}
.video-item-info {
  display: flex;
  font-size: 15px;
}
.v-item-content {
  padding: 10px 0 0;
  font-size: 14px;
}
.video-data {
  padding: 10px 0 0;
  position: relative;
}
.imgv {
  width: 55%;
  aspect-ratio: 3 / 4;
  background-color: #000;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  border-radius: 5px;
  overflow: hidden;
  position: relative;
}
.imgv.portrait {
  width: 75%;
}
.imgv.landscape {
  width: 100%;
}
.imgv.hidden {
  display: none;
}
.actions {
  display: flex;
  justify-content: space-around;
  margin-top: 8px;
  font-size: 12px;
  color: #666;
}
.v-item-con {
  height: 50px;
  padding-left: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}
.video-item-info .avatar {
  width: 50px;
  height: 50px;
  position: relative;
}

.actions .icon {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 15px;
}

.overlay-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
}

.panel {
  background: #fff;
  border-radius: 16px 16px 0 0;
  width: 100%;
  max-height: 70vh;
  overflow-y: auto;
  z-index: 1000;
}

.panel-header {
  padding: 12px;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f2f2f2;
}
.panel-body {
  text-align: center;
  padding: 40px 0;
}
.comment-input {
  padding: 8px 12px;
  display: flex;
  align-items: center;
  background: #fff;
  border-top: 1px solid #eee;
  position: sticky;
  bottom: 0;
}
.comment-input input {
  flex: 1;
  padding: 10px;
  border-radius: 20px;
  border: 1px solid #eee;
  font-size: 14px;
}
.comment-actions {
  display: flex;
  gap: 8px;
  margin-left: 8px;
}
.action-icon {
  width: 20px;
  height: 20px;
}

.empty-icon {
  width: 60px;
  margin-bottom: 10px;
}
.share-options {
  display: flex;
  justify-content: space-around;
  padding: 20px 16px;
}
.share-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #333;
  font-size: 13px;
}
.share-item img {
  background: #f2f2f2;
  padding: 12px;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  margin-bottom: 6px;
}
.muted {
  position: absolute;
  z-index: 10;
  bottom: 0;
  right: 0;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  font-size: 20px;
  transform: translateZ(10px); 
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
.is-active-like {
  color: red;
}

:deep(.avatarImg) {
  width: 46px !important;
  height: 46px !important;
}
/* :deep(.video-comment.van-popup) {
  position: static !important;
} */
:deep(.actions .icon .van-image img) {
  width: 24px;
  height: 18px;
}
:deep(.avater .van-image__img) {
  width: 50px;
  height: 50px;
  position: relative;
}

:deep(body > .van-popup.video-comment) {
  position: fixed !important;
  bottom: 0 !important;
  top: auto !important;
  /* transform: none !important; */
  z-index: 2002 !important; /* 或依照你自己的設計 */
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  max-height: 70vh;
  overflow: hidden;
}
.video-data :deep(.video-slider) {
  display:none !important;
}

</style>
