<script setup lang="ts">
import { computed, nextTick, onMounted, onBeforeUnmount, provide, ref, watch, onUnmounted } from 'vue'
import { Image, Popup, NavBar, showSuccessToast, showFailToast } from 'vant'
import { useShaka } from '@/composables/useShaka'
import ShakaVideoPlayer from '@/components/Video/VideoPlayerShaka.vue'
import StateManager from '@/components/StateManager.vue'
import { getOtherUserInfo } from '@/service/bbs'
import { useFetchData, type UseFetchDataInterface } from '@/composables/useFetchData'
import getImageUrl from '@/utils/getImageUrl'
import { fetchRoomInfo } from '@/service/api/live'
import service from '@/service'
import UserEngagementPanel from '@/components/User/UserEngagementPanel.vue'
import { useLiveRoom } from '@/composables/useLiveRoom'
import MessagesWindow from './components/_MessagesWindow.vue'
import RoomFooter from './components/_RoomFooter.vue'
import { useCacheData, type CacheDataInterface } from 'src/composables/useCacheData'
import FollowPopup from '@/components/FollowPopup.vue'
import Login from '@/components/Login.vue'
import utils from '@/utils'
import { getUserProfile, setFeedInteraction } from '@/service/api'
import { FeedAction } from '@/service/api/feed'
import constants from '@/constants'

const cacheData: CacheDataInterface = useCacheData()
provide('cacheData', cacheData)

const liveRoom = useLiveRoom()
provide('liveRoom', liveRoom)

const props = defineProps(['roomId', 'userId', 'inRoom', 'streamMuted'])
const emit = defineEmits(['update:visible', 'close'])
const shakaLivePlayerPopupWrapper = ref<HTMLElement | null>(null)
const livePlayerElement = ref<HTMLElement | null>(null)
const isLoading = ref<boolean>(false)
const shakaInstance = useShaka()
const { fetchData }: UseFetchDataInterface = useFetchData()
const myInfo = ref<Record<string, any>>({})
const userInfo = ref<Record<string, any>>({})
const roomInfo = ref<Record<string, any>>({})
const sidebarData = ref<any>({})
const likeImg =
  'data:image/webp;base64,UklGRh4DAABXRUJQVlA4WAoAAAAwAAAAEAAAFAAASUNDUMgBAAAAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADZWUDhMMAEAAC8QAAUQJ8KgbSNJ6ezefxSOy/FHtH9pzL8bSZKcqGrQ4PJB/u/DyWnGbRs5zo7szfvavXwBgoDE76qf08VN9aI7eL3pdjZq+DB8kc2HL2g3JWmHVYNK3nmpJKOXP4iDCsgqyU+LgsV6hhpWoJNwWSeUwS/ITNKCNkAMFhxCMooYFsOGVAiQpJlIsgUgGCCBBAwAIMAAAGIk26atebatb/P9921N/knde/dLIaL/jNy2jURUp64zzwAAAAAAAIDzyrba/2/duNxaX5uhsep1PqimyRhlKz2mHWdqvZh2RX4BTDTjktU7VD8Dh7mNcGpgfqaUfyNP/8qOqtEUe9vtJ/t+ppFlsu+Cu0DhS51R/8viSO3AOlC91wMofqS6BfoPboDBs/o5TH5q5eS7BzRudBc='
const token = utils.getLSItem(constants.localStorageKeys.ACCESS_TOKEN) ?? ''
const liveEnd = ref<boolean>(false);
const showFollowPopup = ref<boolean>(false)
const targetUserId = ref<string | null>(null)
const showLoginModal = ref<boolean>(false)
const viewerNumber = ref<number>(0)
const isMuted = ref<boolean>(true)
const isSafari = ref<boolean>(false)
const btnCallback = ref<boolean>(false)
const browserCheck = () =>  {
  const ua = navigator.userAgent
  const vendor = navigator.vendor || ''
  isSafari.value = vendor.includes('Apple') && ua.includes('Safari') && !ua.includes('Chrome') 
}
const getMyInfo = async () => {
  if (!token) return
  myInfo.value =
    (await fetchData({
      fetchFn: service.user.getUserInfo,
      fetchParams: '',
      openCache: true,
    })) || {}
}

const getOwnerInfo = async (userId: any) => {
  if (!userId) return
  userInfo.value =
    (await fetchData({
      fetchFn: getOtherUserInfo,
      fetchParams: userId,
      openCache: true,
    })) || {}
}

const getRoomInfo = async (roomId: string) => {
  if (!roomId) return
  roomInfo.value =
    (await fetchData({
      fetchFn: fetchRoomInfo,
      fetchParams: roomId,
      openCache: true,
    })) || {}
     
    // 不重複的直播觀看人數
    liveRoom.uniqueViewersCount.value = Number(roomInfo.value.unique_viewers_count ) || 0
    viewerNumber.value = liveRoom.uniqueViewersCount.value
    // 直播是否結束(true: 結束，false: 未結束)
    if (!liveRoom.liveEnd.value) {
       liveRoom.liveEnd.value = roomInfo.value.is_closed === undefined || roomInfo.value.is_closed ? true : false
       liveEnd.value = liveRoom.liveEnd.value
    }  
}

const getSidebarData = async () => {
  sidebarData.value = {
    ...roomInfo.value,
    poster: userInfo.value.avatar,
    userId: userInfo.value.userId,
  }
}
const openFollowPopup = (userId: string) => {
  targetUserId.value = userId
  showFollowPopup.value = true
}
const shouldShowFollowButton = computed(() => {
  return !liveRoom.checkIfOwner(liveRoom.myUserId.value) && !liveRoom.followedOwner.value
})
const followAction = async () => {
  try {
    const res = await setFeedInteraction(props.userId, {
      action: liveRoom.followedOwner.value ? FeedAction.Unfollow : FeedAction.Follow,
      objectType: 'user',
      clientType: 0,
    })
    if (res.data.success) {
      showSuccessToast(!liveRoom.followedOwner.value ? '关注成功' : '已取消关注')
      if (!liveRoom.followedOwner.value) {
        liveRoom?.sendFollow()
      }
      liveRoom.followedOwner.value = !liveRoom.followedOwner.value
    }
  } catch (error) {
    console.error(error)
    showFailToast({
      message: liveRoom.followedOwner.value ? '取消关注失败' : '关注失败',
      duration: 2000,
    })
  }
}
const changeFollowStatus = () => {
  if (utils.isLoggedIn() === 'not-logged-in') {
    showLoginModal.value = true
    return
  }
  followAction()
}
const getRelation = async () => {
  const results = await Promise.allSettled([getUserProfile(props.userId)])
  if (results[0].status === 'fulfilled' && results[0].value?.data) {
    liveRoom.followedOwner.value = results[0].value.data.isFollowing
  } else {
    console.warn('获取用户基本资料失败')
  }
}
const roomInit = async () => {
  await liveRoom.init(props.roomId, props.userId)
  getRelation()
}
const onVideoEnded = () => {
    // 這是播放完畢，例如直播轉為 VOD 或錄影檔
    liveRoom.liveEnd.value = true
  }
const onMetadataLoaded = (e: Event) => {
  const video = e.target as HTMLVideoElement
  if (video) {
    //if (!isSafari) {
      isMuted.value = false
    //}  
    video.addEventListener('canplay', () => {isMuted.value = false})
    video.addEventListener('ended', onVideoEnded)
  }
}

async function cleanUp() {
  shakaInstance.unload()
  emit('update:visible', false)
  emit('close')
  const div = document.querySelector('.top-menu') as HTMLElement
  if (div) div.style.display = ''
}

// 点击页面“返回”按钮用的
async function goBack() {
  if (props.inRoom) {
    btnCallback.value = true
    await cleanUp()
    history.back()
  } else {
    history.back()
  }
}


onMounted(async () => {
  const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  if (navEntry?.type === 'reload') {
    sessionStorage.removeItem('restoreTab')
  }

  // 加上 referrer 的判斷，避免外部網站進入誤還原
  if (!document.referrer || document.referrer.indexOf(location.host) === -1) {
    sessionStorage.removeItem('restoreTab')
  }
  const div = document.querySelector('.top-menu') as HTMLElement;
  if (div) {
    div.style.display = 'none'
  }
  browserCheck()
  await getMyInfo()
  await getOwnerInfo(props.userId)
  await getRoomInfo(props.roomId)
  await getSidebarData()
  await liveRoom.connectWebSocket(props.roomId, props.userId, myInfo.value.avatar)
  roomInit()
  // 判斷上下頁切換event
  // 這是為了在直播間時若沒用f5或網址列按enter刷新頁面時按上一頁能回到LiveList.vue
  // 若f5或網址列按enter刷新直播間頁面時時因為history state清空這時按上一頁則回到首頁
  window.addEventListener('popstate', e => {
    if (props.inRoom && e.state?.fromListLive) {
      cleanUp()
    } else if ( !props.inRoom && location.pathname === '/') {
      // 直接强制 reload，重新加载真正的首页
      window.location.reload();
    }
  })
})
const handleRealPlay = async () => {
  await nextTick()
  const video = document.querySelector('#shakaVideoPlayerPopup video') as HTMLVideoElement
  if (video instanceof HTMLVideoElement) {
    try {
     
      await video.play()
    } catch (err) {
      console.warn('video.play() failed:', err)
    }
  } 
}
watch(() => liveRoom.liveEnd.value , async() => {
  if (liveRoom.liveEnd.value) {
    await fetchData({
        fetchFn: fetchRoomInfo,
        fetchParams: props.roomId,
        openCache: false
      }).then(res => {
        roomInfo.value = res || {}
        // 更新 liveRoom 狀態
        liveRoom.liveEnd.value =
          roomInfo.value.is_closed === undefined || roomInfo.value.is_closed ? true : false
        liveRoom.uniqueViewersCount.value = Number(roomInfo.value.unique_viewers_count) || 0
        viewerNumber.value = liveRoom.uniqueViewersCount.value
        liveEnd.value = liveRoom.liveEnd.value
      })
  }
}, { immediate: true })
onUnmounted(async () => {
  await liveRoom.wsClient.value.destroy() 
  const video = document.querySelector('#shakaVideoPlayerPopup video') as HTMLVideoElement
  if (video instanceof HTMLVideoElement) {
    video.src = ''
  }
  await nextTick()
  window.removeEventListener('popstate',  e => {
    if (props.inRoom && e.state?.fromListLive) {
      cleanUp()
    }})
})
</script>
<template>
  <div class="live-content" v-if="!liveEnd">
    <StateManager :loading="isLoading">
      <div class="topinfo-anchar">
        <div class="info">
          <div class="mine-user flex-r-c-c" @click="openFollowPopup(userId)">
            <Image class="avatar" :src="getImageUrl(userInfo?.avatar, 'avatar')" round />
            <div class="mine-user-con">
              <div class="mine-user-name">{{ userInfo.nickname }}</div>
              <div class="mine-user-desc flex-r-c-c">
                <Image class="userImg" :src="likeImg" />
                {{ liveRoom.likeCount }} 次点赞
              </div>
            </div>
            <div class="focus-button" v-if="shouldShowFollowButton">
              <div class="focus-btn-detail" @click.stop="changeFollowStatus">关注</div>
            </div>
          </div>
          <div class="flex-r-c-c">
            <UserEngagementPanel
              v-if="liveRoom"
              :room="liveRoom"
              @onFollowPopup="openFollowPopup"
              @close="goBack"
            />
          </div>
        </div>
      </div>
      <div class="shaka-live-player-wrapper" id="shakaLivePlayerPopupWrapper">
        <ShakaVideoPlayer
          id="shakaVideoPlayerPopup"
          class="shakaVideoPlayerPopup"
          ref="shakaVideoPlayerPopupRef"
          :isLive="true"
          :inLiveRoom="true"
          :src="roomInfo.streamData?.playback?.hls || ''"
          :poster="''"
          :isActive="true"
          :isMuted="streamMuted !== undefined && streamMuted !== null ? streamMuted : isMuted"
          :shakaInstance="shakaInstance"
          @realPlay="handleRealPlay"
          @metadataLoaded="onMetadataLoaded"
        />
      </div>
    </StateManager>
    <MessagesWindow @onFollowPopup="openFollowPopup" />
    <RoomFooter />
    <FollowPopup
      v-model:visible="showFollowPopup"
      :userId="targetUserId"
      :liveRoom="liveRoom"
      @show-login="showLoginModal = true"
    />
    <Popup class="loginModel" teleport="body" v-model:show="showLoginModal" v-if="showLoginModal">
      <Login
        :size="'small'"
        :phoneCode="''"
        :callback="true"
        @closeLoginModal="showLoginModal = false"
        @loginSuccess="roomInit"
      />
    </Popup>
  </div>
  <div class="end-live" v-else>
    <NavBar class="nav-bar" placeholder  left-arrow @click-left="goBack"></NavBar>
    <div class="end-live-title-audience">直播已结束</div>
    <div class="stream-viewer-number">{{ viewerNumber }}人看过</div>
    <div class="host-avatar">
      <Image class="avatar" :src="getImageUrl(userInfo?.avatar, 'avatar')" round size="65px"/>
    </div>
    <div class="host-name">
      {{ userInfo.nickname }}
    </div>
  </div>
  <div class="no-auto-audio" v-if="isMuted">
    <div class="video-muted">
      <div class="content">
        <span>因浏览器限制，当前为静音</span>
        <span class="open-mute" @click="isMuted = false">开启声音</span>
        <span class="iconfont icon-guanbi"></span>
      </div>  
    </div>
  </div>
</template>
<style lang="scss" scoped>
.shaka-live-player-wrapper {
  top: 110px;
}
.topinfo-anchar {
  width: 100vw;
  position: fixed;
  top: 0;
  z-index: 199;
  padding: 10px;
}
.topinfo-anchar .info {
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.topinfo-anchar .info .mine-user {
  height: 34px;
  background: #74747499;
  border-radius: 17px;
  padding-left: 2px;
}
.flex-r-c-c {
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar {
  display: block;
  width: 30px;
  height: 30px;
  margin-right: 6px;
}
.mine-user-con {
  height: 100%;
  padding-right: 8px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
}
.mine-user-name {
  font-size: 12px;
  color: #fff;
  font-weight: 500;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 70px;
}
.mine-user-desc {
  font-size: 10px;
  color: #fffc;
}
.mine-user-desc .userImg {
  display: block;
  width: 8px;
  margin-right: 2px;
  transform: translateY(1px);
  vertical-align: 4px;
}
.focus-button {
  margin-right: 6px;
  padding: 6px 12px;
  background: linear-gradient(270deg, #ff1793, #ff6a32);
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.focus-button .focus-btn-detail {
  font-weight: 600;
  font-size: 10px;
  color: #fff;
}
.loginModel {
  overflow: visible !important;
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
    box-shadow: 0 0 0.36rem #898989;
    margin: 0 auto; // 保險置中
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .close-btn {
    position: fixed;
    top: 0.2rem;
    padding: 0.06rem;
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
.end-live {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: var(--van-background);
  z-index: 9999;
}
.end-live .end-live-title-audience {
    position: absolute;
    left: 50%;
    top: 172px;
    transform: translate(-50%);
    font-weight: 700;
    font-size: 16px;
    color: #fff;
    line-height: 22px;
}
.end-live .stream-viewer-number {
    position: absolute;
    left: 50%;
    top: 198px;
    transform: translate(-50%);
    font-weight: 700;
    font-size: 14px;
    color: #666;
    line-height: 22px;
}
.end-live .host-avatar {
    position: absolute;
    left: 50%;
    top: 253px;
    transform: translate(-50%);
}
.end-live .host-avatar .avatar {
  width: 65px;
  height: 65px;
}
.end-live .host-name {
    position: absolute;
    left: 50%;
    top: 327px;
    transform: translate(-50%);
    font-weight: 700;
    font-size: 16px;
    color: var(--van-text-color);
    line-height: 22px;
}
.no-auto-audio {
  touch-action: none;
  background: #0000;
  width: 100vw;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 8;
  display: flex;
  align-items: center;
  justify-content: center;
}
.no-auto-audio .video-muted {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  position: fixed;
  left: 50%;
  // bottom: calc(20% + 36px);
  transform: translate(-50%,-50%);
  font-size: 12px;
  color: var(--van-text-color);
  z-index: 9;
}
.video-muted .content {
  padding: 8px 16px;
  display: flex;
  align-items: center; 
  border-radius: 8px;
  background-color: var(--van-background);
}
.video-muted .content .open-mute {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 6px;
  width: 60px;
  height: 24px;
  line-height: 24px;
  border-radius: 6px;
  background-color: red;
}
.iconfont {
    font-family: iconfont !important;
    font-size: 16px;
    font-style: normal;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
.icon-guanbi:before {
    content: "\00D7";
    font-family: sans-serif;
    font-size: 16px;
}

@media (min-width: 768px) {
  .live-popup {
    width: 480px !important;
    left: 0;
    right: 0;
    margin: 0 auto;
  }
  .live-popup .live-content,
  .live-popup .shaka-live-player-wrapper {
    max-width: 480px !important;
    margin: 0 auto;
  }
  .topinfo-anchar .info {
    width: 480px !important;
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
