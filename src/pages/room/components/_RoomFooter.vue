<template>
  <div class="room-footer is-live">
    <div
      class="input-wrapper"
      :class="{
        'has-content': hasContent,
      }"
    >
      <van-field :border="false">
        <template #input>
          <input
            ref="inputRef"
            class="text-input"
            v-model="content"
            placeholder="聊点什么..."
            @keydown.enter.prevent="sendMessage"
          />
        </template>
        <template #button>
          <div class="button-wrapper">
            <InputEmoji :input-ref="inputRef" ref="inputEmoji" @toggle="handleToggleEmojiPicker" />
            <Button
              v-if="hasContent"
              class="button-submit"
              round
              @click="sendMessage"
              :disabled="!hasContent"
            >
              发送
            </Button>
          </div>
        </template>
      </van-field>
    </div>
    <template v-if="!hasContent">
      <Share :room="room" />
      <FlyingHeart />
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, ref, watch } from 'vue'
import { Field as VanField, Button, showToast } from 'vant'
import InputEmoji from './_InputEmoji.vue'
import Share from './_Share.vue'
import FlyingHeart from './_FlyingHeart.vue'
import { type LiveRoomInterface } from '@/composables/useLiveRoom'

const room: LiveRoomInterface | undefined = inject('liveRoom')

const content = ref<string>('')
const inputRef = ref<HTMLInputElement | null>(null)
const inputEmoji = ref<{ close: () => void } | null>(null)

const hasContent = computed(() => {
  return content.value
})

const handleToggleEmojiPicker = (isOpen: boolean) => {}

// 过滤非法字符
const filterIllegalText = (text: string) => {
  if (!text) return
  // 定义正则表达式，匹配非法结构
  const illegalPattern = /<[^>]*>|<\/[^>]*>|script|style|on\w+=".*?"|javascript:/gi
  return text.replace(illegalPattern, '')
}

// 发送消息的函数
const sendMessage = () => {
  if (content.value && room) {
    room.sendMessage(content.value)
    setTimeout(() => {
      content.value = ''
    }, 100)
    inputEmoji.value?.close()
  }
}
</script>

<style scoped lang="less">
@bg-green: #34c759;
@bg-input: #f2f2f2;
@text-primary: #434343;
@text-grey: #aeaeb1;
.text-shadow {
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}
.room-footer {
  max-width: 480px;
  left: 50%;
  transform: translateX(-50%);
  position: fixed;
  width: 100%;
  bottom: 0;
  display: flex;
  align-items: center;
  padding: 8px;
  gap: 4px;
  flex-wrap: wrap;
  :deep(.van-button--block) {
    min-width: 80px;
    width: auto;
  }
  :deep(.van-field) {
    border-radius: 30px;
    padding: 4px 4px 4px 10px;
  }
  .emoji-button {
    vertical-align: top;
  }
  .text-input {
    background-color: transparent;
    border: none;
    color: #fff;
    width: 100%;
    font-size: 16px;
  }
  .preview-panel {
    position: absolute;
    bottom: 45px;
    left: 0;
  }
  .button-wrapper {
    display: flex;
    gap: 4px;
    .button-submit {
      height: 24px;
      line-height: 24px;
      padding: 0 12px;
      background-color: @bg-green;
      border: none;
      color: #fff;
      font-size: 14px;
    }
  }
  &.is-live {
    height: 52px;
    :deep(.van-field) {
      background-color: #74747499;
    }
    .input-wrapper {
      width: calc(min(100vw, 480px) - 90px);
      &.has-content {
        width: calc(min(100vw, 480px));
      }
    }
    .text-input {
      color: #fff;
      &::placeholder {
        color: #fff;
      }
    }
  }
}
.popup-for-emoji-picker {
  background-color: transparent;
  :deep(.v3-emoji-picker) {
    width: 100%;
    height: 240px;
    background-color: rgba(0, 0, 0, 0.7);
    border-radius: 10px 10px 0 0;
    .v3-header {
      padding: 10px 15px 6px;
      background-color: rgba(255, 255, 255, 0.7);
      border-radius: 10px 10px 0 0;
    }
    .v3-body .v3-body-inner .v3-group .v3-emojis button {
      max-width: 10%;
      border-radius: 50px;
    }
    .v3-footer {
      display: none;
    }
  }
}
</style>
