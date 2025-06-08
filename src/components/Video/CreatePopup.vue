<script setup lang="ts">
import { ref } from 'vue'
import { Popup, showToast } from 'vant'
import IconVideo from '@/assets/images/short_video/icon_video.png'
import IconLive from '@/assets/images/short_video/icon_live.png'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits(['update:visible', 'createVideo', 'createLive'])

const handleCreateVideo = async () => {
  emit('update:visible', false)
  window.location.href = '/video/add'
  return
  // todo 后续版本会检查权限，现在先直接跳转
  try {
    const userId = localStorage.getItem('user_id') || 'xxx' // Assuming userId is stored in localStorage
    const response = await fetch(
      `https://rendering-client.pwtk.cc/rendering-client/rendering/video/getUserPermissionDesc?userId=${userId}`
    )
    const result = await response.json()

    console.log('result', result)

    if (
      result.success &&
      result.data.allowCreateVideoByIdentity &&
      result.data.allowCreateVideoByLevel
    ) {
      emit('update:visible', false)
      window.location.href = '/video/add'
    } else {
      emit('update:visible', false)
      const reason =
        result.data.reasonOfDenyCreateVideoByIdentity ||
        result.data.reasonOfDenyCreateVideoByLevel ||
        '您没有发布视频的权限'
      showToast(reason)
    }
  } catch (error) {
    console.error('Failed to check video creation permission:', error)
    showToast('检查权限失败，请稍后再试')
  }
}

const handleCreateLive = () => {
  emit('update:visible', false)
  emit('createLive')
  //showToast('敬请期待')
}
</script>

<template>
  <Popup
    :show="visible"
    position="bottom"
    @update:show="val => emit('update:visible', val)"
    teleport="body"
    round
    class="popup-adaptive"
  >
    <div class="create-container">
      <!-- <div class="create-header">
        <div class="title">创建内容</div>
        <span class="close-icon" @click="emit('update:visible', false)">×</span>
      </div> -->

      <div class="create-content">
        <div class="button-container">
          <div class="create-button video-button" @click="handleCreateVideo">
            <img :src="IconVideo.src" alt="视频" />
            <div class="button-text">发视频</div>
          </div>

          <div class="create-button live-button" @click="handleCreateLive">
            <img :src="IconLive.src" alt="直播" />
            <div class="button-text">开直播</div>
          </div>
        </div>
      </div>
    </div>
  </Popup>
</template>

<style scoped lang="less">
.create-container {
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.create-header {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  padding: 32px 16px;
  border-bottom: 1px solid #f5f5f5;

  .title {
    font-size: 16px;
    font-weight: 600;
    color: #323233;
  }

  .close-icon {
    position: absolute;
    right: 16px;
    font-size: 22px;
    color: #969799;
    cursor: pointer;
  }
}

.create-content {
  padding: 20px 16px;

  .button-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }

  .create-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 12px;
    flex: 1;
    height: 64px;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    .material-icons-outlined {
      font-size: 28px;
      position: relative;
      z-index: 1;
    }

    .button-text {
      font-size: 16px;
      font-weight: 500;
      position: relative;
      z-index: 1;
    }

    &.video-button {
      background: linear-gradient(rgb(245, 154, 35) 0%, rgb(250, 205, 145) 100%);
      color: white;
      img {
        opacity: 0.7;
        position: absolute;
        bottom: 5px;
        left: 10px;
        z-index: 0;
        width: 36px;
        object-fit: contain;
        transform: rotate(30deg);
      }
    }

    &.live-button {
      background-color: rgb(204, 204, 204);
      color: white;

      img {
        opacity: 0.7;
        position: absolute;
        bottom: 5px;
        right: 10px;
        z-index: 0;
        width: 36px;
        object-fit: contain;
        transform: rotate(-30deg);
      }
    }
  }
}
</style>
