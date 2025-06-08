<script setup lang="ts">
  import { computed, nextTick, onMounted, onBeforeUnmount, ref, reactive, watch } from 'vue'
  import ShakaVideoPlayer from '@/components/Video/VideoPlayerShaka.vue'
  import { Swipe, SwipeItem } from 'vant'
  import { useShaka } from '@/composables/useShaka'
  import LazyShow from '@/components/LazyShow.vue'
  import { useFetchData, type UseFetchDataInterface } from '@/composables/useFetchData'
  import { getUserBatchList } from '@/service/user'
  import type { UserBatchResponse } from '@/service/userEnhanced'
  import Live from '@/pages/room/_Live.vue'

  import {
    getLiveListData,
  } from '@/service/api'
  const { fetchData }: UseFetchDataInterface = useFetchData()
  
  import Loading from '@/components/Loading.vue'
  import LiveContent from './LiveContent.vue'
  import jumpTo from '@/utils/jumpTo'

  const liveList = ref<any[]>([])
  const activeIndex = ref<number>(0)
  const isMuted = ref<boolean>(true)
  const isRealPlay = ref<boolean>(false)
  const isLoading = ref<boolean>(false)
  const page = ref<number>(1)
  /** shaka player */
  const shakaLivePlayerRef = ref<InstanceType<typeof ShakaVideoPlayer> | null>(null)
  const shakaInstance = useShaka()  
  const shakaLivePlayerWrapper = ref<HTMLElement | null>(null)
  const videoPlayerElement = ref<HTMLElement | null>(null)
  const cursor = ref<string | null>(null)
  const streamUrl = ref<string | null>(null)
  const inRoom = ref<boolean>(false)
  const pageSize = 20
  const swipeRef = ref<InstanceType<typeof Swipe> | null>(null)
  const size = reactive({
    width: window.innerWidth,
    height: window.innerHeight,
  })
  const swipeStyle = computed(() => ({
    width: `${size.width}px`,
    height: `${size.height}px`,
  }))
  const onRealPlay = () => {
    isRealPlay.value = true 
  }

 
  const loadData = async () => {
    isLoading.value = true
    const res = await getLiveListData({ cursor: cursor.value, keyword: null, limit: pageSize})
    if (res.data.errorMessage === 'Success') {
      if (cursor.value === null) {
        cursor.value = res.data.cursor
      }  
      const lives = res.data.data.rooms
      .map((room: any) => ({
        ...room,
        _isLive: true  // 後面判斷直播是否結束用
      }))
      let userIds: string[] = [];
      await lives.forEach((item: any) => {
        userIds.push(item.owner);
      })
      const userBatchResponse = await getUserBatchList(userIds) as UserBatchResponse;
      
      if (userBatchResponse?.data) {
        userBatchResponse.data.forEach((user: { userId: string | number,  [key: string]: any }) => {
          lives.forEach((item: any) => {
            if (item.owner === user.userId) {
              item.nickname = user.nickname
            }
          })
        })
      } 
      // 如果已经有分享视频，过滤掉相同的视频（防止重复）
      if (liveList.value.length > 0) {
        const liveId = liveList.value[0].id
        const filteredLives = lives.filter((item: any) => item.id !== liveId)
        liveList.value.push(...filteredLives)
      } else {
        liveList.value.push(...lives)
      }
    }
    isLoading.value = false
  }
  const onVideoEnded = () => {
    // 這是播放完畢，例如直播轉為 VOD 或錄影檔
    liveList.value[activeIndex.value]._isLive = false
  }
  const onMetadataLoaded = (e: Event) => {
    const video = e.target as HTMLVideoElement
    if (video) {
      isMuted.value = false
      video.addEventListener('ended', onVideoEnded)
    }
  }
  const onSwipeChange = (index: number) => {
    activeIndex.value = index
    // 最后一条数据时加载更多
    if (liveList.value.length == index) {
        page.value +=1
        loadData()
    }
    isRealPlay.value = false

  }
  async function openRoomUI() {
    // 设置要播放的流地址
    streamUrl.value = liveList.value[activeIndex.value]?.streamData.playback.hls;
    // 卸载旧的 player（确保下次能正常 load）
    shakaInstance.unload();
    // 切换到直播间
    inRoom.value = true;
    // 缓存 Tab 状态
    sessionStorage.setItem('restoreTab', 'live');
    
    // 重置自动播放标志
    isRealPlay.value = false;
    await nextTick()
  
  }
  const openRoom = (useHistory: boolean) => {
    if (useHistory) {
        history.replaceState({ fromListLive: true }, '', location.pathname);
        history.pushState({ fromListLive: true }, '', `/room/${liveList.value[activeIndex.value].room_id}?owner=${liveList.value[activeIndex.value].owner}`)
    }
    // streamUrl.value = liveList.value.at(activeIndex.value)?.streamData.playback.hls
    // shakaInstance.unload()
    // inRoom.value = true
    // sessionStorage.setItem('restoreTab', 'live')
    // isRealPlay.value = false
    // 把目前url先改為pathname並添加一筆/room/{roomId}紀錄
    // 這是為了在直播間時若沒用f5或網址列按enter刷新頁面時按上一頁能回到LiveList.vue
    // 若f5或網址列按enter刷新直播間頁面時時因為history state清空這時按上一頁則回到首頁

    // history.replaceState({ fromListLive: true }, '', location.pathname);
    // history.pushState({ fromListLive: true }, '', `/room/${liveList.value[activeIndex.value].room_id}?owner=${liveList.value[activeIndex.value].owner}`)
    openRoomUI()
  }
  const onClose = async() => {
    inRoom.value = false   
  }
  function onPopState(e: PopStateEvent) {
    // 如果前进到了 /room/ 且 state.fromListLive 标记存在，就执行 openRoom
    if (location.pathname.startsWith('/room/') && e.state?.fromListLive) {
      openRoom(false)
    }
  }
  onMounted(async () => {
    await loadData() 
    await nextTick()
    shakaLivePlayerWrapper.value = document.getElementById('shakaLivePlayerWrapper')
    videoPlayerElement.value = document.getElementById('shakaLivePlayer')
    window.addEventListener('popstate', onPopState)
    
  })
  onBeforeUnmount(() => {
    const video = shakaInstance.videoElement.value as HTMLVideoElement | null
    if (video) {
      video.removeEventListener('ended', onVideoEnded)
    }
    window.removeEventListener('popstate', onPopState)
  })
  watch(() => inRoom.value, async (val) => { 
  if (val === false) {
    // 等 DOM 切换完毕，保证 <ShakaVideoPlayer> 可用
      await shakaInstance.load(streamUrl.value)
      isMuted.value = false
      isRealPlay.value = true
      shakaInstance.isPlayerReady.value = false
    }    
  })
  
</script>
<template>
  <div class="live-list-container" v-if="!inRoom"
   
  >
    <div class="shaka-video-player-wrapper" 
      id="shakaLivePlayerWrapper"
      v-if="liveList.at(activeIndex) !== undefined && liveList.at(activeIndex)?.streamData !== undefined"
      >
      <ShakaVideoPlayer 
        
        id="shakaLivePlayer"
        ref="shakaLivePlayerRef"
        :isLive="true"
        :src="liveList.at(activeIndex)?.streamData.playback.hls"
        :poster="liveList.at(activeIndex)?.streamData.thumbnail"
        :isActive="!inRoom" 
        :isMuted="isMuted"
        :shakaInstance="shakaInstance"
        @metadataLoaded="onMetadataLoaded"
        @realPlay="onRealPlay"
      />
    </div>
    <Swipe
      ref="swipeRef"
      class="video-swipe safe-area-full"
      vertical
      :show-indicators="false"
      :style="swipeStyle"
      :loop="false"
      @change="onSwipeChange"
      v-if="liveList.length > 0 && !isLoading"
      style="width: auto"
    >
      <SwipeItem v-for="(item, index) in liveList" :key="index" class="swipe-item">
        <LiveContent 
          :data="item"
          :isActive="activeIndex === index"
          :shakaLivePlayerRef="shakaLivePlayerRef"
          :fetchData="fetchData"
          shakaLivePlayerId="shakaLivePlayer"
          :shakaLivePlayerWrapper="shakaLivePlayerWrapper"
          :videoPlayerElement="videoPlayerElement"
          :isRealPlay="isRealPlay"
           @openRoom="() => openRoom(true)"
        />
      </SwipeItem>
      <!-- -->
    </Swipe>
    <Loading v-if="isLoading" />
    <LazyShow :show="!isLoading && !liveList.length">
      <div class="no-liver tipCenter">
        <div class="no-live-tips">抱歉，现在主播都在休息~</div>
      </div>
    </LazyShow>
   
  </div>  
  <Live 
    v-if="inRoom"
    :inRoom="inRoom"
    :roomId="liveList[activeIndex].room_id"
    :isMuted="isMuted"
    :userId="liveList[activeIndex].owner"
    v-model:visible="inRoom"
    @close="onClose"
  />
</template>
<style lang="scss" scoped>
.live-list-container {
  height: 100%;
}
#shakaVideoPlayer {
  position: relative;
  z-index: 1;
}
.swipe-item {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.shaka-video-player-wrapper {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 0;
  width: 0;
  z-index: 10;
  //display: none;
}
.no-live-tips {
  font-family: PingFang SC, PingFang SC;
  font-weight: 700;
  font-size: 16px;
  color: #e1e1e1;
  line-height: 22px;
  text-align: center;
}
.tipCenter {
  width: 100%;
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%);
  text-align: center;
}
</style>