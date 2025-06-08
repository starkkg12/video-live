<template>
  <div class="share-icon-wrapper">
    <van-icon :name="share.src" size="20px" color="#fff" @click="showSharePopup = true" />
  </div>

  <van-popup
    v-model:show="showSharePopup"
    position="bottom"
    round
    class="popup-adaptive"
    teleport="body"
  >
    <div class="share-popup">
      <div class="share-header">
        <div class="title">推广</div>
        <div class="close-btn" @click="showSharePopup = false">×</div>
      </div>
      <div class="share-content">
        <div class="share-item" @click="handleShareLink">
          <div class="share-icon-circle">
            <i class="material-icons">send</i>
          </div>
          <div class="item-text">分享到</div>
        </div>
        <div class="share-item" @click="handleCopyLink">
          <div class="share-icon-circle">
            <i class="material-icons">link</i>
          </div>
          <div class="item-text">复制链接</div>
        </div>
        <div class="share-item" @click="handleUseVideo">
          <div class="share-icon-circle">
            <i class="material-icons">video_library</i>
          </div>
          <div class="item-text">调用直播</div>
        </div>
      </div>
    </div>
  </van-popup>

  <video-embed-popup
    :visible="showEmbedPopup"
    @update:visible="showEmbedPopup = $event"
    :url="liveUrl"
  />
  <ShareLinkPopup v-model:visible="showShareLinkPopup" :link="liveUrl" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { Icon as VanIcon, Popup as VanPopup, showToast } from 'vant'
import VideoEmbedPopup from '@/components/Video/VideoEmbedPopup.vue'
import utils from '@/utils'
import share from '@/assets/icons/room/share.svg'
import ShareLinkPopup from './_ShareLinkPopup.vue'

const props = withDefaults(
  defineProps<{
    room: any
  }>(),
  {
    room: null,
  }
)

const showSharePopup = ref(false)
const showEmbedPopup = ref(false)
const showShareLinkPopup = ref(false)
const liveUrl = window.location.href.replace(/^https?:\/\//, '')

const copyInviteLink = async () => {
  utils.copyText(window.location.href.replace(/^https?:\/\//, ''), '语音房邀请链接复制成功！')
}

const handleCopyLink = async () => {
  copyInviteLink()
  showSharePopup.value = false
}

const handleUseVideo = () => {
  showEmbedPopup.value = true
}

const handleShareLink = () => {
  showShareLinkPopup.value = true
}
</script>

<style scoped lang="less">
@bg-color: #1a1b1c80;
.share-icon-wrapper {
  cursor: pointer;
  width: 36px;
  min-width: 36px;
  height: 36px;
  border-radius: 20px;
  background-color: @bg-color;
  display: flex;
  justify-content: center;
  align-items: center;
}

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

  .share-icon-circle {
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
