<template>
  <div class="input-upload-wrapper">
    <Uploader
      class="uploader"
      :class="{ 'has-files': !!attachments.length }"
      :max-count="6"
      v-model="attachments"
      ref="uploaderInstance"
      :before-read="beforeRead"
      :preview-options="{ doubleScale: false, closeable: true }"
      :after-read="() => auto && upload((path: string) => emit('sendImage', path))"
      multiple
    />
    <div class="uploader-button" v-if="!attachments.length">
      <van-icon :name="uploadIcon.src" size="24" />
      <span v-if="label">{{ label }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, watch } from 'vue'
  import { Icon as VanIcon, type UploaderFileListItem, showDialog, Uploader } from 'vant'
  import service from '@/service'
  import uploadIcon from '@/assets/icons/room/upload.svg'

  const props = withDefaults(
    defineProps<{
      auto?: boolean
      maxSize?: number
      label?: string
    }>(),
    {
      auto: true,
      maxSize: 30,
      label: '',
    }
  )

  const attachments = ref<UploaderFileListItem[]>([])

  const emit = defineEmits<{
    sendImage: [path: string]
    change: [file: any]
  }>()

  function beforeRead(file: File | File[]) {
    if (Array.isArray(file)) {
      file.forEach((item, index) => {
        if (item.size > props.maxSize * 1024 * 1024) {
          showDialog({
            title: '提示',
            message: `第${index + 1}张图片大小不能超过${props.maxSize}MB`,
          })
          return false
        }
      })
    } else {
      if (file.size > props.maxSize * 1024 * 1024) {
        showDialog({
          title: '提示',
          message: `上传图片大小不能超过${props.maxSize}MB`,
        })
        return false
      }
    }

    return true
  }

  const upload = async (sendImage: Function, images?: any[]) => {
    const imageAttachments = images || [...attachments.value]
    const attachment = imageAttachments.shift()
    if (!attachment || !attachment.file) return
    const response = await service.upload.uploadSingle({
      storageStyle: service.upload.StorageStyle.DEFAULT,
      fileType: 'img',
      uploadFrom: service.upload.UploadFrom.CHAT_MESSAGE_IMG,
      uploadTarget: attachment.file ? attachment.file.name : 'image.jpg',
      storageType: service.upload.StorageType.S3,
      env: service.upload.Env.DEV,
      file: attachment.file,
    })

    const path = response.data.errCode === '0' ? response.data.data.path : ''
    sendImage && sendImage(path)

    if (imageAttachments.length) {
      await upload(sendImage, imageAttachments)
    } else {
      attachments.value = []
    }
  }

  const clearFiles = () => {
    attachments.value = []
  }

  watch(
    () => attachments.value,
    () => {
      emit('change', attachments.value)
    }
  )

  defineExpose({ upload, clearFiles })
</script>

<style scoped lang="less">
  .input-upload-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    .uploader-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #656565;
      font-size: 14px;
      line-height: 20px;
      gap: 4px;
    }
    .uploader {
      position: absolute;
      z-index: 10;
      opacity: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      &.has-files {
        position: relative;
        opacity: 1;
        :deep(.van-uploader__wrapper) {
          flex-wrap: nowrap;
          overflow-x: auto;
          .van-uploader__upload {
            min-width: 80px;
          }
        }
      }
    }
  }
</style>
