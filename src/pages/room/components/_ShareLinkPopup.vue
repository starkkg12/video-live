<script setup lang="ts">
import { ref, watch } from 'vue'
import { Popup, showToast } from 'vant'
import utils from '@/utils'

const props = defineProps<{
  visible: boolean
  link: string
}>()

const emit = defineEmits(['update:visible'])

watch(
  () => props.visible,
  newVal => {
    if (newVal) {
      copyLink()
    }
  }
)

const copyLink = () => {
  utils.copyText(props.link)
  showToast('链接已复制')
}

const shareToWechat = () => {
  // 微信分享需要调用微信JSSDK，这里仅做提示
  showToast('请打开微信，粘贴链接分享')
  emit('update:visible', false)
}

const shareToMoments = () => {
  // 朋友圈分享需要调用微信JSSDK，这里仅做提示
  showToast('请打开微信朋友圈，粘贴链接分享')
  emit('update:visible', false)
}

const shareToQQ = () => {
  const qqUrl = `http://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(props.link)}`
  window.open(qqUrl, '_blank')
  emit('update:visible', false)
}

const shareToTelegram = () => {
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(props.link)}`
  window.open(telegramUrl, '_blank')
  emit('update:visible', false)
}
</script>

<template>
  <Popup
    :show="visible"
    position="bottom"
    @update:show="val => emit('update:visible', val)"
    teleport="body"
    round
  >
    <div class="share-container">
      <div class="share-header">
        <p>链接已复制，粘贴到</p>
      </div>

      <div class="share-options">
        <div class="share-option" @click="shareToWechat">
          <div class="share-icon wechat">
            <div class="icon-container"></div>
          </div>
          <span>微信</span>
        </div>

        <div class="share-option" @click="shareToMoments">
          <div class="share-icon moments">
            <div class="icon-container"></div>
          </div>
          <span>朋友圈</span>
        </div>

        <div class="share-option" @click="shareToQQ">
          <div class="share-icon qq">
            <div class="icon-container"></div>
          </div>
          <span>QQ</span>
        </div>

        <div class="share-option" @click="shareToTelegram">
          <div class="share-icon telegram">
            <div class="icon-container"></div>
          </div>
          <span>Telegram</span>
        </div>
      </div>

      <div class="share-cancel" @click="emit('update:visible', false)">取消</div>
    </div>
  </Popup>
</template>

<style scoped lang="less">
.share-container {
  display: flex;
  flex-direction: column;
  padding: 16px 20px 0;
  background-color: #fff;
  border-radius: 12px 12px 0 0;
}

.share-header {
  text-align: center;
  padding-bottom: 16px;

  p {
    margin: 0;
    font-size: 16px;
    color: #333;
  }
}

.share-options {
  display: flex;
  justify-content: space-between;
  padding: 10px 20px 20px;
}

.share-option {
  display: flex;
  flex-direction: column;
  align-items: center;

  .share-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    justify-content: center;

    .icon-container {
      width: 36px;
      height: 36px;
      background-size: contain;
      background-position: center;
      background-repeat: no-repeat;
    }
  }

  span {
    font-size: 14px;
    color: #333;
  }

  .wechat {
    background-color: #46c01b;

    .icon-container {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='white' d='M8.2 13.3c-0.5 0-0.9-0.4-0.9-0.9s0.4-0.9 0.9-0.9 0.9 0.4 0.9 0.9-0.4 0.9-0.9 0.9M12 4C6.5 4 2 7.7 2 12.2c0 2.4 1.1 4.6 3 6.2 0.3 0.2 0.4 0.5 0.3 0.8l-0.5 1.5c-0.1 0.4 0.1 0.8 0.5 0.9 0.1 0 0.2 0 0.3 0l1.8-0.9c0.2-0.1 0.5-0.1 0.7 0 1.2 0.4 2.5 0.5 3.8 0.5 5.5 0 10-3.7 10-8.2S17.5 4 12 4m3.8 9.3c-0.5 0-0.9-0.4-0.9-0.9s0.4-0.9 0.9-0.9 0.9 0.4 0.9 0.9-0.4 0.9-0.9 0.9'/%3E%3C/svg%3E");
    }
  }

  .moments {
    background-color: #8dc81b;

    .icon-container {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='white' d='M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 16c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6zm0-10c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm0 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z'/%3E%3C/svg%3E");
    }
  }

  .qq {
    background-color: #4cafe9;

    .icon-container {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='white' d='M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.9 13.1c-.2.5-.9.8-1.5 1.1-.6.2-1.3.5-2 .8-.1.1-.2.2-.3.2-.2 0-.5-.2-.6-.4-.2-.7-.3-1.4-.5-2-.1-.2 0-.3.2-.4 1-.6 1.7-1.3 1.8-2.5 0-.2-.1-.3-.3-.3h-.2c-.9.1-1.8.2-2.7.2-.9 0-1.8-.1-2.7-.2h-.2c-.2 0-.3.1-.3.3.1 1.1.8 1.9 1.8 2.5.2.1.2.2.2.4-.2.7-.3 1.4-.5 2-.1.2-.3.4-.6.4-.1 0-.2-.1-.3-.2-.7-.3-1.4-.6-2-.8-.6-.2-1.3-.6-1.5-1.1-.1-.2 0-.5.2-.7.6-.5 1-1.2 1.2-1.9.1-.2 0-.5-.2-.6-1-.6-1.5-1.4-1.5-2.6 0-.9.4-1.7 1.1-2.4.7-.7 1.6-1.2 2.6-1.4 1-.2 2-.2 3 0 2 .4 3.5 1.7 3.7 3.8.1 1-.3 1.9-1.3 2.6-.2.1-.2.4-.2.6.2.7.6 1.3 1.2 1.9.2.2.3.5.2.7z'/%3E%3C/svg%3E");
    }
  }

  .telegram {
    background-color: #29b6f6;

    .icon-container {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='white' d='M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.9 7.2l-1.6 7.6c-.1.5-.5.7-.9.4l-2.6-1.9-1.3 1.2c-.1.1-.3.2-.5.2l.2-2.5 4.6-4.1c.2-.2 0-.3-.3-.1l-5.7 3.6-2.5-.8c-.5-.2-.5-.5.1-.8l9.7-3.7c.4-.2.9.1.8.9z'/%3E%3C/svg%3E");
    }
  }
}

.share-cancel {
  text-align: center;
  padding: 14px 0;
  color: #333;
  font-size: 16px;
  cursor: pointer;
  border-top: 1px solid #eee;
}
</style>
