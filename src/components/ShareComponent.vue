<script lang="ts" setup>
  import type { PropType } from 'vue'
  import { ref } from 'vue'
  import { showToast, Popup as VanPopup, Icon } from 'vant'
  import utils from '@/utils'
  import sms from '@/assets/icons/sms.svg'
  import copy from '@/assets/icons/copy.svg'

  enum ShareType {
    SMS = 'sms',
    COPY = 'copy',
  }

  const props = defineProps({
    shareText: {
      type: String as PropType<string>,
      required: true,
    },
    visible: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
  })

  const show = ref<boolean>(false)

  const open = () => {
    show.value = true
  }

  const close = () => {
    show.value = false
  }

  const handleShare = (type: ShareType) => {
    try {
      switch (type) {
        case ShareType.SMS:
          window.location.href = `sms:?body=${encodeURIComponent(props.shareText)}`
          showToast('分享到短信')
          break
        case ShareType.COPY:
          utils.copyText(props.shareText)
          showToast('复制到剪贴板')
          break
      }
      close()
    } catch (error) {
      console.error('Share failed:', error)
      showToast('分享失败，请稍后重试')
    }
  }

  defineExpose({ open })
</script>

<template>
  <span @click="open"><slot></slot></span>
  <van-popup
    position="bottom"
    class="share-popup"
    teleport="body"
    round
    :show="show"
    :overlay-style="{ background: 'rgba(0,0,0,0.3)' }"
    @click-overlay="close"
  >
    <div class="share-container">
      <div class="share-header">
        <h3>分享到</h3>
      </div>
      <div class="share-options">
        <div class="share-option" @click="handleShare(ShareType.SMS)">
          <div class="share-icon sms">
            <Icon :name="sms.src" size="30px" />
          </div>
          <span>短信</span>
        </div>
        <div class="share-option" @click="handleShare(ShareType.COPY)">
          <div class="share-icon copy">
            <Icon :name="copy.src" size="30px" />
          </div>
          <span>复制</span>
        </div>
      </div>
      <div class="share-cancel" @click="close">取消</div>
    </div>
  </van-popup>
</template>

<style scoped>
  .share-popup {
    max-height: 40vh;
    max-width: 600px;
    left: 50%;
    transform: translateX(-50%);
  }

  .share-container {
    padding: 20px 20px 6px;
  }

  .share-header {
    text-align: center;
    margin-bottom: 20px;
  }

  .share-header h3 {
    margin: 0;
    font-size: 16px;
    color: #333;
  }

  .share-options {
    display: flex;
    justify-content: space-around;
    padding: 10px 0;
  }

  .share-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
  }

  .share-icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    margin-bottom: 8px;
    background-size: 60%;
    background-position: center;
    background-repeat: no-repeat;
  }

  .sms {
    background-color: #00b3ff;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .copy {
    background-color: #ff9d00;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .share-option span {
    font-size: 12px;
    color: #666;
    margin-top: 4px;
  }

  .share-cancel {
    margin-top: 20px;
    text-align: center;
    padding: 10px;
    color: #666;
    font-size: 14px;
    border-top: 1px solid #eee;
    cursor: pointer;
  }
</style>
