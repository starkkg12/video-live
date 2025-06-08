<script setup lang="ts">
import IconHeart from '@/assets/icons/short_video/heart.svg'
import IconMessage from '@/assets/icons/short_video/message.svg'
import IconShare from '@/assets/icons/short_video/share.svg'
import IconStar from '@/assets/icons/short_video/star.svg'
import IconVolumeOff from '@/assets/icons/short_video/volume_off.svg'
import SvgIcon from '@/components/SvgIcon.vue'
import { useCurrentUser } from '@/composables/useCurrentUser'
import { FeedAction, setFeedInteraction } from '@/service/api'
import utils from '@/utils'
import { formatNumber } from '@/utils/format'
import getImageUrl from '@/utils/getImageUrl'
import { Image, showSuccessToast } from 'vant'
import { computed, inject, onMounted, ref, watch } from 'vue'
import SharePopup from './SharePopup.vue'

interface SidebarData {
  id: string
  avatar: string
  userId: string
  likeCount: number
  favoriteCount: number
  commentCount: number
  shareCount: number
  viewCount: number
  videoPath: string
  isLiked: boolean
  isFavorite: boolean
  isFollowingAuthor: boolean
}

const props = withDefaults(
  defineProps<{
    sidebarData: SidebarData
    isActive: boolean
    toggleMuted?: () => void
    isMuted?: boolean
    addUsersDictionary: (userIds: string[]) => void
    usersDictionary: Record<string, any>
    isFollowingAuthor?: boolean
  }>(),
  {
    sidebarData: {
      id: '',
      poster: '',
      userId: '',
      likeCount: 0,
      favoriteCount: 0,
      commentCount: 0,
      shareCount: 0,
      viewCount: 0,
      isLiked: false,
      isFavorite: false,
      isFollowingAuthor: false,
    },
    isActive: false,
  }
)
const { myId } = useCurrentUser()

const sidebarData = ref(props.sidebarData)
const isMuted = inject('isMuted', ref(true))
const toggleMuted = props.toggleMuted || inject('toggleMuted')
const isLiked = ref(sidebarData.value.isLiked)
const isFavorite = ref(sidebarData.value.isFavorite)
// const isFollowed = ref(props.isFollowingAuthor)
const handleMuteToggle = () => {
  toggleMuted()
}

const userInfo = computed(() => props.usersDictionary[props.sidebarData.userId])

const emit = defineEmits(['showComments', 'like', 'favorite', 'follow', 'share'])
const showSharePopup = ref(false)

const handleToggleLike = async () => {
  const res = await setFeedInteraction(props.sidebarData.id, {
    action: isLiked.value ? FeedAction.Unlike : FeedAction.Like,
  })

  if (res.data.success) {
    isLiked.value = !isLiked.value
    showSuccessToast(isLiked.value ? '点赞成功' : '取消点赞')
    emit('like', isLiked.value)
  } else {
    console.error('VideoSidebar - like API request failed:', res.data)
  }
}

const handleToggleFavorite = async () => {
  const res = await setFeedInteraction(props.sidebarData.id, {
    action: isFavorite.value ? FeedAction.Unfavorite : FeedAction.Favorite,
  })
  if (res.data.success) {
    isFavorite.value = !isFavorite.value
    showSuccessToast(isFavorite.value ? '收藏成功' : '取消收藏')
    emit('favorite', isFavorite.value)
  } else {
    console.error('VideoSidebar - favorite API request failed:', res.data)
  }
}

const handleFollow = async () => {
  const res = await setFeedInteraction(props.sidebarData.userId, {
    action: FeedAction.Follow,
    objectType: 'user',
  })
  if (res.data.success) {
    showSuccessToast('关注成功')
    // isFollowed.value = true
    emit('follow')
  }
}

const action = (type: string) => {
  // TODO actions
  switch (type) {
    case 'showComments':
      emit('showComments')
      break
    case 'share':
      showSharePopup.value = true
      break
    default:
      break
  }
}
const jumpToUser = () => {
  utils.jumpTo(`/user/${props.sidebarData.userId}`)
}

const getVideoCount = () => {
  console.log('TODO getVideoCount', props.sidebarData.id)
}

const handleShareChange = (type: string) => {
  if (type === 'copyLink' || type === 'useVideo') {
    emit('share')
  }
}

watch(
  () => props.isActive,
  newValue => {
    if (newValue) {
      getVideoCount()
    }
  }
)

watch(
  () => props.isMuted,
  newValue => {
    isMuted.value = newValue
  }
)
watch(
  () => props.sidebarData,
  newValue => {
    sidebarData.value = newValue
  }
)
onMounted(() => {
  if (props.sidebarData.userId.length < 25 && !props.usersDictionary[props.sidebarData.userId]) {
    props.addUsersDictionary([props.sidebarData.userId])
  }
})
</script>
<template>
  <ul class="side-bar safe-area-inset-bottom">
    <li class="avatar">
      <Image
        :src="getImageUrl(userInfo?.avatar, 'avatar')"
        width="52"
        height="52"
        object-fit="cover"
        round
        @click="jumpToUser()"
      />
      <span
        v-if="!isFollowingAuthor && myId !== sidebarData.userId"
        class="material-icons"
        @click="handleFollow"
        >add_circle</span
      >
    </li>
    <li class="favorite" @click="handleToggleLike">
      <div class="icon-wrapper">
        <SvgIcon :icon="IconHeart.src" :color="isLiked ? '#FE2C55' : '#fff'" size="40" />
      </div>
      {{ formatNumber(sidebarData.likeCount || 0) }}
    </li>
    <li class="comment" @click="action('showComments')">
      <div class="icon-wrapper">
        <SvgIcon :icon="IconMessage.src" :color="'#fff'" size="40" />
      </div>
      {{ formatNumber(sidebarData.commentCount || 0) }}
    </li>
    <li class="star" @click="handleToggleFavorite">
      <div class="icon-wrapper">
        <SvgIcon :icon="IconStar.src" :color="isFavorite ? '#FFD700' : '#fff'" size="40" />
      </div>
      {{ formatNumber(sidebarData.favoriteCount || 0) }}
    </li>
    <li class="share" @click="action('share')">
      <div class="icon-wrapper">
        <SvgIcon :icon="IconShare.src" :color="'#fff'" size="40" />
      </div>
      {{ formatNumber(sidebarData.shareCount || 0) }}
    </li>
    <li class="mute" @click="handleMuteToggle()" :class="{ 'is-muted': isMuted }">
      <div class="icon-wrapper-circle">
        <SvgIcon class="icon-button" :icon="IconVolumeOff.src" :color="'#000'" size="20" />
      </div>
    </li>
  </ul>

  <SharePopup
    :id="sidebarData.id"
    :videoPath="sidebarData.videoPath"
    v-model:visible="showSharePopup"
    @change="handleShareChange"
  />
</template>

<style scoped lang="less">
.side-bar {
  position: absolute;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.8);
  z-index: 99;
  right: 5px;
  bottom: 50px;
  color: #fff;
  text-align: center;
  li {
    margin-top: 20px;
    font-size: 14px;
    line-height: 1;
    &.avatar {
      .material-icons {
        color: red;
        position: relative;
        margin-top: -14px;
        font-size: 25px;
      }
      .van-image {
        border: 2px solid #fff;
        vertical-align: top;
      }
    }
    &.favorite {
      margin-top: 24px;
    }
    span {
      font-size: 30px;
      display: block;
      &.is-active-like {
        color: red;
      }
      &.is-active-favorite {
        color: rgb(247, 186, 42);
      }
    }
    &.mute {
      display: flex;
      align-items: center;
      justify-content: center;
      visibility: hidden;
      span {
        font-size: 30px;
        background-color: #fff;
        color: var(--van-border-color);
        height: 40px;
        width: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        text-shadow: none;
      }
      &.is-muted {
        visibility: visible;
      }
    }
    .icon-wrapper {
      opacity: 0.92;
      i {
        vertical-align: top;
      }
    }
    .icon-wrapper-circle {
      opacity: 0.92;
      border-radius: 42px;
      background-color: #fff;
      width: 42px;
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 1px 1px 3px 0 rgba(0, 0, 0, 0.3);
    }
  }
}
</style>
