<script setup lang="ts">
import { ref } from 'vue'
import utils from '@/utils'
import VideoEmbedPopup from './VideoEmbedPopup.vue'
import { Popup, showToast } from 'vant'
import { setFeedInteraction, getVideoDownloadLink, FeedAction } from '@/service/api'

const props = defineProps<{
  visible: boolean
  id: string
  videoPath?: string
}>()

const emit = defineEmits(['update:visible', 'change'])

const showEmbedPopup = ref(false)
const isDownloading = ref(false)
const videoUrl = `${window.location.origin}/video/${props.id}`

const handleCopyLink = async () => {
  utils.copyText(`${window.location.origin}/?shareId=${props.id}`)
  const res = await setFeedInteraction(props.id, {
    action: FeedAction.Share,
  })
  handleClose()
  emit('change', 'copyLink')
}

const handleSaveToLocal = async () => {
  try {
    isDownloading.value = true
    showToast({
      message: '正在准备下载...',
      forbidClick: true,
      duration: 0,
    })

    // 获取视频下载链接
    const response = await getVideoDownloadLink(props.id)
    const downloadUrl = response.data.data.downloadUrl

    if (!downloadUrl) {
      showToast('视频地址不存在')
      return
    }

    // 记录下载行为
    await setFeedInteraction(props.id, {
      action: FeedAction.Download,
    })

    // 直接使用前端fetch进行下载，类似CORS测试页面的方式
    const res = await fetch(downloadUrl, { mode: 'cors' })

    if (!res.ok) {
      throw new Error(`下载失败: ${res.status}`)
    }

    // 创建blob并下载
    const blob = await res.blob()
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = `video_${props.id}.mp4`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    // 清理blob URL
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl)
    }, 100)

    showToast('下载成功')
  } catch (error) {
    console.error('下载视频时出错:', error)
    showToast('下载失败，请重试')
  } finally {
    isDownloading.value = false
    handleClose()
  }
}

const handleUseVideo = () => {
  showEmbedPopup.value = true
  setFeedInteraction(props.id, {
    action: FeedAction.Share,
  })
  emit('change', 'useVideo')
}

const handleClose = () => {
  emit('update:visible', false)
}
</script>

<template>
  <Popup
    :show="visible"
    position="bottom"
    round
    @update:show="val => emit('update:visible', val)"
    class="popup-adaptive"
    teleport="body"
  >
    <div class="share-popup">
      <div class="share-header">
        <div class="title">推广</div>
        <div class="close-btn" @click="handleClose">×</div>
      </div>
      <div class="share-content">
        <div class="share-item" @click="handleCopyLink">
          <div class="icon-wrapper">
            <span class="material-icons">link</span>
          </div>
          <div class="item-text">复制链接</div>
        </div>
        <div class="share-item" @click="handleSaveToLocal" :class="{ disabled: isDownloading }">
          <div class="icon-wrapper">
            <span class="material-icons">file_download</span>
          </div>
          <div class="item-text">保存至本地</div>
        </div>
        <div class="share-item" @click="handleUseVideo">
          <div class="icon-wrapper">
            <span class="material-icons">video_library</span>
          </div>
          <div class="item-text">调用视频</div>
        </div>
      </div>
    </div>
  </Popup>

  <VideoEmbedPopup
    :visible="showEmbedPopup"
    @update:visible="showEmbedPopup = $event"
    :url="videoUrl"
  />
</template>

<style scoped lang="less">
.share-popup {
  width: 100%;
  background: white;
  padding: 16px;
}

.share-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .title {
    font-size: 18px;
    font-weight: 500;
  }

  .close-btn {
    font-size: 24px;
    cursor: pointer;
  }
}

.share-content {
  display: flex;
  justify-content: space-around;
  padding: 10px 0 20px;
}

.share-item {
  display: flex;
  flex-direction: column;
  align-items: center;

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .icon-wrapper {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: #f5f5f5;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 8px;

    .material-icons {
      font-size: 28px;
      color: #333;
    }
  }

  .item-text {
    font-size: 14px;
    color: #333;
  }
}
</style>
