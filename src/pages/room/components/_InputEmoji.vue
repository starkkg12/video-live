<template>
  <div class="input-emoji">
    <van-icon v-if="isVoice" class="emoji-button" :name="smileVoice.src" size="24px" @click="toggleEmojiPicker" />
    <van-icon v-else class="emoji-button" :name="smileChat.src" size="24px" @click="toggleEmojiPicker" />
    <van-popup
      :show="true"
      class="popup-for-emoji-picker"
      position="bottom"
      teleport="body"
      transition="none"
      :style="{ 'height': '240px', 'margin-bottom': '54px' }"
      :overlay="false"
      v-on:close="setSelectionRange"
      v-if="showEmoji"
    >
      <EmojiPicker :native="true" @select="insertEmoji" hide-search hide-group-names disable-skin-tones />
    </van-popup>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue'
  import { Icon as VanIcon, Popup as VanPopup } from 'vant'
  import EmojiPicker from 'vue3-emoji-picker'
  import 'vue3-emoji-picker/css'
  import smileChat from '@/assets/icons/room/smile_chat.svg'
  import smileVoice from '@/assets/icons/room/smile_voice.svg'

  const props = withDefaults(
    defineProps<{
      inputRef: any
      isVoice?: boolean
    }>(),
    {
      inputRef: null,
      isVoice: true,
    }
  )

  const emit = defineEmits<{
    toggle: [isOpen: boolean]
  }>()

  const showEmoji = ref<boolean>(false)
  const cursorPosition = ref(0)

  const toggleEmojiPicker = () => {
    cursorPosition.value = props.inputRef.selectionStart || 0
    showEmoji.value = !showEmoji.value
    setSelectionRange()
    emit('toggle', showEmoji.value)
  }

  const close = () => {
    showEmoji.value = false
  }

  /**
   * 在光标位置插入 Emoji
   * @param emoji 被点击的 Emoji 对象
   */
  const insertEmoji = (emoji: { i: string }): void => {
    if (props.inputRef) {
      cursorPosition.value = props.inputRef.selectionStart || 0
      const value = props.inputRef.value
      const emojiChar = emoji.i // 获取 emoji 字符
      // 插入 Emoji 到光标位置
      props.inputRef.value = value.slice(0, cursorPosition.value) + emojiChar + value.slice(cursorPosition.value)
      props.inputRef.dispatchEvent(new Event('input'))
      // 更新光标位置
      cursorPosition.value += emojiChar.length

      // 确保光标恢复到插入后的位置
      setSelectionRange()
    }
  }

  const setSelectionRange = () => {
    setTimeout(() => {
      if (props.inputRef) {
        props.inputRef.setSelectionRange(cursorPosition.value, cursorPosition.value)
        props.inputRef.focus()
      }
    }, 0)
  }

  defineExpose({ close })
</script>

<style scoped lang="less">
  .emoji-button {
    vertical-align: top;
  }
  .popup-for-emoji-picker {
    background-color: transparent;
    max-width: 600px;
    left: 50%;
    transform: translateX(-50%);
    :deep(.v3-emoji-picker) {
      width: 100%;
      height: 240px;
      border-radius: 10px 10px 0 0;
      .v3-header {
        padding: 10px 15px 6px;
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
