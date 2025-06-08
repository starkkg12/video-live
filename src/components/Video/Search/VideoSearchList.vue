<script setup lang="ts">
import { computed, nextTick, onMounted, provide, ref, watch, onBeforeUnmount } from 'vue'
import { Empty, Loading } from 'vant'
import { getSearchVideo, FeedAction } from '@/service/api'
import VideoItem from './VideoItem.vue'
import { useCacheData } from '@/composables/useCacheData'
import VideoPlayerPopup from './VideoPlayerPopup.vue'
import ShakaVideoPlayer from '@/components/Video/VideoPlayerShaka.vue'
import { useShaka } from '@/composables/useShaka'

const props = defineProps(['keyWord', 'type', 'filters', 'isMuted'])
const scrollContainer = ref<HTMLElement | null>(null)
const isMuted = ref<boolean>(true)

const { addUsersDictionary, usersDictionary } = useCacheData()
provide('addUsersDictionary', addUsersDictionary)
provide('usersDictionary', usersDictionary)
provide('isMuted', isMuted)
const toggleMuted = () => {
  isMuted.value = !isMuted.value
}
provide('toggleMuted', toggleMuted)
const isLoading = ref<boolean>(false)
const isFetching = ref<boolean>(false)
const last = ref<boolean>(false)
const requestCount = ref<number>(1)
const requestMaxLimit = 3
const scrollId = ref<string | number | null>(null)
const videoList = ref<any[]>([])
const tempData = ref<any[]>([])
const selectedTagIds = ref<number[]>([])
const selectUserIds = ref<number[] | boolean[]>([])
const dateFilterObj = ref<{ beginTime: string | null; endTime: string | null }>({ beginTime: null, endTime: null })
const videoItemRefs = ref<any[]>([])
const videoMountEls = ref<(HTMLElement | null)[]>([])
const activeIndex = ref<number>(0)
const popupActiveIndex = ref<number>(0)
const shakaInstance = useShaka()
const currentVideo = computed(() => videoList.value[activeIndex.value])
const currentMountTarget = computed(() => videoMountEls.value[activeIndex.value])
const shakaVideoPlayerRef = ref<InstanceType<typeof ShakaVideoPlayer> | null>(null)
const setItemRef = (el: any, index: number) => {
  videoItemRefs.value[index] = el
  nextTick(() => {
    const mountTarget = el?.el?.querySelector('.imgv')
    videoMountEls.value[index] = mountTarget
  })
}
const checkCenterVideo = () => {
  const centerY = window.innerHeight / 2
  let topVisible: any = null
  let maxRatio = 0
  videoItemRefs.value.forEach((inst, i) => {
    if (inst === null) return
    const el = inst.el
    const rect = el?.getBoundingClientRect()
    if (!rect) return
    const visibleTop = Math.max(rect.top, 0)
    const visibleBottom = Math.min(rect.bottom, window.innerHeight)
    const visibleHeight = Math.max(0, visibleBottom - visibleTop)
    const ratio = visibleHeight / rect.height
    if (ratio > maxRatio) {
      maxRatio = ratio
      topVisible = i
    }
  })
  if (typeof topVisible === 'number') activeIndex.value = topVisible
}
const getTimeRange = (type = 'today') => {
  const now = new Date()
  let start
  switch (type) {
    case 'today': start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0); break
    case 'yesterday': start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0); break
    case 'week': start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 0, 0, 0); break
    default: throw new Error('Invalid type')
  }
  return { beginTime: start.getTime(), endTime: now.getTime()  }
}
const fetchOnce = async (): Promise<number> => {
  let sortStrategy = null
  if (props.filters?.length > 0) {
    sortStrategy = props.filters[0].items.findIndex((t: any) => t === props.filters[0].selected)
    switch (props.filters[1].selected) {
      case '今天': dateFilterObj.value = { beginTime: String(getTimeRange('today')?.beginTime), endTime: String(getTimeRange('today')?.endTime) }; break
      case '昨天': dateFilterObj.value = { beginTime: String(getTimeRange('yesterday')?.beginTime), endTime: String(getTimeRange('yesterday')?.endTime) }; break
      case '一周内': dateFilterObj.value = { beginTime: String(getTimeRange('week')?.beginTime), endTime: String(getTimeRange('week')?.endTime) };  break
      case '自定义':
        dateFilterObj.value = {
          beginTime: String(new Date(props.filters[1].items[0].beginTime).getTime()),
          endTime: String(new Date(props.filters[1].items[0].endTime).getTime())
        }; break
      case '不限':
      default:
        if (props.filters[1].selected.beginTime) {
          dateFilterObj.value = {
            beginTime: String(new Date(props.filters[1].selected.beginTime + ' 00:00:00').getTime()),
            endTime: String(new Date(props.filters[1].selected.endTime + ' 23:59:59').getTime())
          }
        } else {
          dateFilterObj.value = { beginTime: null, endTime: null }
        }
    }
    if (props.filters[2].selected === '关注的人') {
      selectUserIds.value = [true]
    } else if (props.filters[2].selected && props.filters[2].selected.userId !== undefined) {
      selectUserIds.value = [Number(props.filters[2].selected.userId)]
   }
    if (props.filters.length > 3) {
      const selectedTopics = props.filters[3].selected
      if (Array.isArray(selectedTopics)) {
        selectedTagIds.value = selectedTopics
          .filter((tag: any) => tag?.tagName !== undefined || tag?.name !== undefined)
          .map((tag: any) => tag.tagName || tag?.name)
      }
    }
  }
  const res = await getSearchVideo(
    scrollId.value ?? null,
    props.type ?? null,
    props.keyWord ?? null,
    sortStrategy,
    selectedTagIds.value,
    selectUserIds.value,
    dateFilterObj.value
  )

  const videos = res.data.data.list || []
  scrollId.value = res.data.data.scrollId || null
  const filteredVideos = videoList.value.length ? videos.filter((v: any) => v.id !== videoList.value[0].id) : videos
  tempData.value.push(...filteredVideos)
  videoList.value.push(...filteredVideos)
  return filteredVideos.length
}
const loadVideoData = async (isInitial = false) => {
  if ((isFetching.value || isLoading.value) && isInitial || (!isInitial && last.value)) return
  isFetching.value = true
  isLoading.value = true
  requestCount.value = 1

  if (isInitial) {
    videoList.value = []
    tempData.value = []
    scrollId.value = null
  } else {
    last.value = false
  }

  let totalNew = 0, emptyCount = 0
  try {
    while (requestCount.value <= requestMaxLimit) {
      const newCount = await fetchOnce()
      requestCount.value++
      totalNew += newCount
      if (newCount === 0) emptyCount++
      else requestCount.value--
      if (totalNew >= 20 || emptyCount >= 3) {
        if (!isInitial && emptyCount >= 3) last.value = true
        break
      }
    }
  } catch (e) {
    console.error('loadVideoData error:', e)
  } finally {
    nextTick(() => {
      isLoading.value = false
      isFetching.value = false
      checkCenterVideo()
    })
  }
}
let scrollTimeout: any;
const handleScroll = async () => {
  // 若前面還沒渲染完則跳過
  if (isFetching.value) return
  const el = scrollContainer.value
  if (!el) return
  const { scrollTop, scrollHeight, clientHeight } = el
  if (!isLoading.value && !last.value && scrollTop + clientHeight >= scrollHeight - 100) {
    await nextTick()
    loadVideoData(false)
  }
  checkCenterVideo()
  // 🕒 滑動停止後延遲 1000ms 播放影片
  if (scrollTimeout) clearTimeout(scrollTimeout)
  scrollTimeout = setTimeout(() => {
    activeIndex.value = (() => {
      const centerY = window.innerHeight / 2
      let topVisible: number | null = null
      let maxRatio = 0
      videoItemRefs.value.forEach((inst, i) => {
        const el = inst.el
        const rect = el?.getBoundingClientRect()
        if (!rect) return
        const visibleTop = Math.max(rect.top, 0)
        const visibleBottom = Math.min(rect.bottom, window.innerHeight)
        const visibleHeight = Math.max(0, visibleBottom - visibleTop)
        const ratio = visibleHeight / rect.height
        if (ratio > maxRatio) {
          maxRatio = ratio
          topVisible = i
        }
      })
      return typeof topVisible === 'number' ? topVisible : activeIndex.value
    })()
  }, 1000)
}

// 開啟videoPlayPopup用
// showVideoPopup為當videoPlayPopup為true時延遲開啟videoPlayerPopup用
// 因為正常來說v-if的屬性會把Popup的動畫屬性抵銷掉
// 所以先用videoPlayPopup控制videoPlayPopup的上一層顯示．
// 然後再用showVideoPopup控制videoPlayerPopup由畫面下方由下往上滑動顯示
const shouldRenderPopup = ref(false)
const innerVisible = ref(false)
const showVideoPopup = ref<boolean>(false)

let closeTimer: ReturnType<typeof setTimeout> | null = null

watch(showVideoPopup, (val) => {
  if (val) {
    // 取消延遲卸載
    if (closeTimer) {
      clearTimeout(closeTimer)
      closeTimer = null
    }
    shouldRenderPopup.value = true
    requestAnimationFrame(() => {
      innerVisible.value = true
    })
  } else {
    innerVisible.value = false
  }
})

watch(innerVisible, (val) => {
  if (!val) {
    showVideoPopup.value = false 
    closeTimer = setTimeout(() => {
      shouldRenderPopup.value = false
    }, 300)
  }
})

// 
const showRenderPopup = (data: any, index: number) => {
  shouldRenderPopup.value = true
  showVideoPopup.value = true
  popupActiveIndex.value = index
  isMuted.value = false
}

// 更新畫面上物件的點讚數、評論數、分享
const updateActionStatus = (index: number, data: any, action: FeedAction, status?: boolean) => {
  if (action === FeedAction.Like) {
    // sidebarData.value.likeCount += status ? 1 : -1
    videoList.value[index].isLiked = status ? true : false
    videoList.value[index].likeCount = data.likeCount 
    videoItemRefs.value[index]?.updateCount(data)
  } else if (action === FeedAction.Favorite) {
    videoList.value[index].favoriteCount = data.favoriteCount
  } else if (action === FeedAction.Comment) {
    videoList.value[index].commentCount = data.commentCount
    videoItemRefs.value[index]?.updateCount(data)
  } else if (action === FeedAction.Share) {
    videoList.value[index].shareCount = data.shareCount
  } 
}
// 當條件篩選完按確定觸發
watch(() => props.filters, () => {
  isFetching.value = true
  last.value = false
  scrollId.value = null
  videoList.value = []
  selectUserIds.value = []
  selectedTagIds.value = []
  scrollContainer.value = null
  loadVideoData(false);
}, { deep: true })

// 當目前畫面聚焦的視頻改變時觸發(將shakaplayer底下的video tag mount到目前聚焦的video-data底下的imgv下面)
watch(
  () => shakaInstance.videoElement.value,
  (video: HTMLVideoElement | null) => {
    if (!video) return
    const onReady = () => {
      video.removeEventListener('loadeddata', onReady)
    }
    video.addEventListener('loadeddata', onReady)
  },
  { deep: true }
)
const setVh = () => {
  // 计算出视口高度的 1%
  const vh = window.innerHeight * 0.01
  // 写入 --vh 变量（单位要带 px）
  document.documentElement.style.setProperty('--vh', `${vh}px`)
}
onMounted(async () => {
  await nextTick()
  await loadVideoData(true)
  checkCenterVideo()
  nextTick(() => {
    activeIndex.value = 0
    setVh()
    window.addEventListener('resize', setVh)
  })
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', setVh)
  scrollContainer.value?.removeEventListener('scroll', handleScroll)
})
watch(() => videoList.value, async (list) => {
  if (list.length > 0 &&  scrollContainer.value === null ) {
    await nextTick()
    scrollContainer.value = document.querySelector('.video-popularitys-wrap .tags-scrollable .tags-content .video-wrap')
    scrollContainer.value?.addEventListener('scroll', handleScroll, { passive: true })
  } 
}, { deep: true })
const onMetadataLoaded = () => {
  isMuted.value = !isMuted.value ? false : props.isMuted
}

// 判斷目前視線聚焦在哪個視頻且該視頻播放
watch(activeIndex, async () => {
  await nextTick()
  const video = shakaInstance.videoElement.value as HTMLVideoElement | null
  if (!video) return
  if (video) {
    video.removeAttribute('poster') 
    video.load() // 重新初始化（避免因為記憶緩存造成問題）
  }
})
watch(currentMountTarget, async (target) => {
  await nextTick()
  const videoEl = shakaInstance.videoElement.value as HTMLVideoElement | null
  if (!videoEl || !target || target.contains(videoEl)) return

  videoEl.style.visibility = 'hidden' // ⛔ 先隱藏

  const showVideo = () => {
    target.appendChild(videoEl)
    videoEl.style.visibility = 'visible' // ✅ append 後才顯示
    videoEl.removeEventListener('canplay', showVideo)
    videoEl.removeEventListener('loadeddata', showVideo)
  }

  // 只有在準備好時才 append + 顯示
  if (videoEl.readyState >= 3) {
    showVideo()
  } else {
    videoEl.addEventListener('canplay', showVideo)
    videoEl.addEventListener('loadeddata', showVideo)
  }
})

</script>

<template>
  <div class="video-wrap" v-if="videoList.length > 0" >
    <div class="all">共{{ videoList.length }} 条视频</div>
    <div class="video-card-list">
      <div
        class="video-card"
        v-for="(item, index) in videoList"
        :key="item.id"
        :data-video-id="item.id"
        :class="{ 'no-border': index === 0 }"
      >
        <VideoItem 
          :data="item" 
           :ref="(el) => setItemRef(el, index)"
          :index="index"
          :isMuted="isMuted"
          :activeIndex="activeIndex"
          :videoList="videoList"
          @toggleMuted="toggleMuted"
          @showRenderPopup="showRenderPopup"
          @comment="(data) => updateActionStatus(activeIndex, data, FeedAction.Comment)"
        />
      </div>
      <Empty v-if="videoList.length === 0" description="暂无数据" />
      <transition name="fade">
        <VideoPlayerPopup
          v-if="shouldRenderPopup"
          v-model:isMuted="isMuted"
          v-model:visible="innerVisible"
          :isActive="innerVisible"
          :videoList="videoList"
          :activeIndex="popupActiveIndex"
          @toggleMuted="toggleMuted"
          @like="(data, index, status) => updateActionStatus(index, data, FeedAction.Like, status)"
          @favorite="(data, index, status) => updateActionStatus(index, data, FeedAction.Favorite, status)"
          @comment="(data, index, status) => updateActionStatus(index, data, FeedAction.Comment, status)"
          @share="(data, index, status) => updateActionStatus(index, data, FeedAction.Share, status)"
          @follow="(data, index,  status) => updateActionStatus(index, data, FeedAction.Follow, status)"
          :usersDictionary="usersDictionary"
          :addUsersDictionary="addUsersDictionary"
          @update:usersDictionary="(val) => usersDictionary = val"
        />
      </transition>
      <div style="display: none" v-if="currentVideo">
        <ShakaVideoPlayer
          id="shakaVideoPlayer"
          ref="shakaVideoPlayerRef"
          :src="currentVideo.videoPath || currentVideo.videoUrl || currentVideo.url"
          :poster="currentVideo.poster || currentVideo.preview"
          :isActive="true"
          :isMuted="showVideoPopup ? true : isMuted"
          :shakaInstance="shakaInstance"
          :showPlayButton="false"
           @metadataLoaded="onMetadataLoaded"

        />
      </div>
      <div class="loading-indicator">
        <span v-if="isLoading && !last">加载..<Loading color="gray" size="19" /></span>
        <span v-else-if="last">- 暂无更多 -</span>
      </div>
      <div class="bottom-padding"></div>
    </div>
  </div> 
  <Empty v-else description="暂无数据" />
</template>

<style scoped>
.video-wrap {
  position: relative;
  flex: 1;
  /* height: calc(var(--vh) * 100 - 46px - env(safe-area-inset-bottom)); */
  height: auto;
  max-height: calc(var(--vh) * 100 - 46px - env(safe-area-inset-bottom));
  overflow-y: auto;
}
.video-card {
  padding: 12px 20px;
  background: #fff;
  border-top: 5px solid #f5f5f5;
}
.video-card.no-border {
  border-top: none;
}
.all {
  padding: 12px 20px 0;
  font-size: 15px;
  color: #333;
  display: flex;
  align-items: center;
}
.all::before {
  content: " ";
  display: block;
  width: 4px;
  border-radius: 3px;
  height: 16px;
  margin-right: 10px;
  background: #333;
}
.video-item-info {
  display: flex;
}
.loading-indicator {
  margin-bottom: calc(env(safe-area-inset-bottom) + 50px);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  color: #c9c9c9;
  font-size: 14px;
}
.loading-indicator span {
  display: flex;
}
.bottom-padding {
    height: 60px;
  }
.video-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 75%;
  aspect-ratio: 3 / 4;
  background-color: #000;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  border-radius: 5px;
  overflow: hidden;
  position: relative;
}
.video-container video {
    object-fit: cover !important;
}
.video-container.vertical {
  width: 75%;
}
.video-container.horizontal {
  width: 100%;
}

.shaka-poster-mask {
  transition: opacity 0.3s ease;
  opacity: 1;
  z-index: 10;
}
.shaka-poster-mask.hidden {
  opacity: 0;
}

</style>