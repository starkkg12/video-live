<script setup lang="ts">
import { type FetchDataInterface } from '@/composables/useFetchData'
import { inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useVideoCommentStore } from '@/stores/useVideoCommentStore'
const videoCommentStore = useVideoCommentStore();
const props = defineProps<{
  data: any
  isActive: boolean
  fetchData: (config: FetchDataInterface) => Promise<any>
  isDetail?: boolean
  preload?: boolean
  shakaVideoPlayerWrapper?: HTMLElement | null
  videoPlayerElement?: HTMLElement | null
  isRealPlay?: boolean
}>()

const emit = defineEmits(['openRoom'])

const sidebarData = ref(props.data)
const livePlayerContainer = ref<HTMLElement | null>(null)
const timer = ref<any>(null)
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
    livePlayerContainer.value?.appendChild(props.videoPlayerElement)
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

onMounted(async () => {
  initVideo(props.isActive)
})
const openRoom = () => {
  if (sidebarData.value._isLive) {
    emit('openRoom')
  }  
}

onBeforeUnmount(() => {
  clearTimeout(timer.value)
  videoCommentStore.release(props.data.id)
})
watch(() => props.data, (newVal) => {
  sidebarData.value = newVal
}, { immediate: true, deep: true })
</script>
<template>
  <div class="live-content safe-area-inset-bottom" @click.stop="openRoom">
    <div class="live-player-container" ref="livePlayerContainer" v-if="sidebarData._isLive">
      <!-- 插入VideoPlayerShaka元素 -->
      <!-- <div class="live-player-image-container">
        <img class="live-player-image" :src="data.streamData[0].thumbnail" />
      </div> -->
    </div>
    <div class="live-wait" v-if="sidebarData.streamData === undefined">主播正在来的路上</div>
    <div class="live-info" v-if="sidebarData._isLive">
        <div class="live-status" v-if="sidebarData.streamData !== undefined">直播中</div>
        <div class="live-author">@{{ sidebarData.nickname }}</div>
        <div class="live-description">{{ sidebarData.description }} 正在直播</div>
        <!-- <div class="game-name"></div> -->
    </div>
    <div class="live-end" v-else>直播已结束</div> 
</div>
</template>

<style scoped lang="less">
.live-content {
  display: flex;
  align-items: center;
  position: absolute;
  top: 0;
  height: 100%;
  width: 100%;
  .live-player-container {
    position: relative;
    height: 100%;
    width: 100%;
    .live-player-image-container {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      object-fit: contain;
      z-index: 10;
      img.live-player-image {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
        height: 100%;
        filter: blur(3rem);
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
  .live-info {
    position: absolute;
    left: 13.184px;
    bottom: 13.184px;
    color: #fff;
    z-index: 9999;
  }
  .live-info .live-status {
    border-radius: 3px;
    margin-bottom: 6.592px;
    padding: 4px 9px;
    font-size: 13.184px;
    display: inline-flex;
    background: red;
    color: #fff;
  }
  .live-info .live-author {
    font-size: 17.5787px;
    font-weight: 700;
    margin-bottom: 10.9867px;
  }
  .live-info .live-description {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    margin-bottom: 6.592px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .live-info .game-name {
    display: flex;
    align-items: center;
    height: 26.368px;
    line-height: 26.368px;
    font-size: 15.3813px;
  }
}
.live-wait {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  justify-content: center;
  font-size: 18px;
  border-radius: 50px;
  border: 1px solid #e0e0e0;
  padding: 13px 20px;
  line-height: 1;
  color: #000;
  background: #ffffffe6;
  display: flex;
  font-weight: 700;
  white-space: nowrap;
}
.live-end {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  width: 100%;
  height: 100%;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: PingFang SC, PingFang SC;
  font-weight: 700;
  font-size: 16px;
  color: #e1e1e1;
  line-height: 22px;
  text-align: center;
}
</style>
