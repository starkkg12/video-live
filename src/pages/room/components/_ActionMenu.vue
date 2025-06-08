<template>
  <VanIcon :name="addCircle.src" size="25px" v-if="!isShow" @click="toggleShow"></VanIcon>
  <VanIcon :name="addCircleActived.src" size="25px" v-else @click="toggleShow"></VanIcon>
  <div class="action-buttons" v-if="isShow">
    <div class="action-buttons-item" :class="{ 'is-show-upload': room.custom.value.preImages?.length }">
      <InputUpload label="相册" :auto="false" @change="handleImagesChange" ref="inputUploadInstance" />
    </div>
    <div class="action-buttons-item" v-if="room.custom.value.preImages?.length" @click="closeUpload">
      <van-icon :name="uploadIcon.src" size="24" />
      <span>相册</span>
    </div>
    <div class="action-buttons-item" @click="changeScene('creation')">
      <van-icon :name="creation.src" size="24px" />
      <span>创作</span>
    </div>
    <div class="action-buttons-item" @click="changeScene('picture')">
      <van-icon :name="pictureComment.src" size="24px" />
      <span>图纸</span>
    </div>
    <div class="action-buttons-item" @click="changeScene('history')">
      <van-icon :name="lottery.src" size="24px" />
      <span>开奖</span>
    </div>
  </div>
  <van-popup v-model:show="isShowPopup" class="popup-for-global" position="bottom" :round="false" teleport="body">
    <ActionMenuCreation v-if="scene === 'creation'" :room="room" @close="close" />
    <ActionMenuPicture v-else-if="scene === 'picture'" :room="room" @close="close" />
    <ActionMenuLotteryHistory v-else-if="scene === 'history'" :room="room" @close="close" />
  </van-popup>
</template>

<script lang="ts" setup>
  import { onBeforeUnmount, onMounted, ref } from 'vue'
  import { Icon as VanIcon, Popup as VanPopup } from 'vant'
  import ActionMenuCreation from './_ActionMenuCreation.vue'
  import ActionMenuPicture from './_ActionMenuPicture.vue'
  import ActionMenuLotteryHistory from './_ActionMenuLotteryHistory.vue'
  import lottery from '@/assets/icons/room/lottery.svg'
  import creation from '@/assets/icons/room/creation.svg'
  import pictureComment from '@/assets/icons/room/picture_comment.svg'
  import addCircle from '@/assets/icons/room/add_circle.svg'
  import addCircleActived from '@/assets/icons/room/add_circle_actived.svg'
  import uploadIcon from '@/assets/icons/room/upload.svg'
  import InputUpload from './_InputUpload.vue'

  const props = withDefaults(
    defineProps<{
      room: any
    }>(),
    {
      room: null,
    }
  )

  const isShow = ref<boolean>(false)
  const isShowPopup = ref<boolean>(false)
  const scene = ref<string>('')
  const inputUploadInstance = ref<{
    upload: (callback: Function, images?: any[]) => Promise<string[]>
    clearFiles: () => void
  } | null>(null)

  const changeScene = (s: string) => {
    scene.value = s
    isShowPopup.value = true
  }

  const close = (type?: 'all') => {
    isShowPopup.value = false
    if (type === 'all') {
      toggleShow(false)
    }
  }
  const toggleShow = (value?: boolean) => {
    isShow.value = typeof value === 'boolean' ? value : !isShow.value
    if (!isShow.value) {
      scene.value = ''
    } else {
      props.room.custom.value.closeEmojiPicker()
    }
  }

  const sendImage = (path: string) => {
    props.room.wsClient.value.sendImage(path)
  }

  const sendAllImages = async () => {
    await inputUploadInstance.value?.upload(sendImage)
    setTimeout(() => {
      handleImagesChange([])
      close()
    }, 100)
  }

  const closeUpload = () => {
    inputUploadInstance.value?.clearFiles()
    setTimeout(() => handleImagesChange([]), 0)
  }

  const handleImagesChange = (file: any) => {
    props.room.install('preImages', file)
  }

  onMounted(() => {
    props.room.install('sendAllImages', sendAllImages)
    props.room.install('toggleShowActionMenu', toggleShow)
  })

  onBeforeUnmount(() => {
    props.room.uninstall('sendAllImages')
    props.room.uninstall('toggleShowActionMenu')
    props.room.uninstall('preImages')
  })
</script>

<style scoped lang="less">
  @import '@/styles/variables.less';

  .action-buttons {
    width: 100%;
    padding: 12px 8px 0;
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    .action-buttons-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      color: @text-secondary;
      font-size: 14px;
      width: 60px;
      .big-icon-name-offset {
        margin-top: -4px;
      }
      &.is-show-upload {
        width: 100%;
      }
    }
  }
</style>
