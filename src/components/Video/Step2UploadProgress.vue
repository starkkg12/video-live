<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { Progress, Button, Row, Col, showToast } from 'vant'
import { initializeUpload, uploadVideoPart, finalizeUpload } from '@/service/api'

const props = defineProps({
  file: {
    type: Object as () => File,
    required: true,
  },
  poster: {
    type: String,
    default: '',
  },
  duration: {
    type: String,
    default: '未知',
  },
  step: {
    type: Number,
    default: 2,
  },
})

const emit = defineEmits(['stepComplete', 'reupload'])

// 上传进度
const progress = ref(0)

// 上传完成标志
const uploadCompleted = ref(false)

// 上传结果数据
const uploadResult = ref({
  fileUrl: null as string | null,
  fileKey: null as string | null,
  size: 0,
  videoMetadata: null as any,
})

// 上传信息状态
const uploadInfo = ref({
  sessionId: null as string | null,
  uploadId: null as string | null,
  objectKey: null as string | null,
  partSize: 10 * 1024 * 1024, // 默认10MB
  totalParts: 0,
  uploadedParts: [] as Array<{
    partNumber: number
    etag: string
    size: number
  }>,
  isPaused: false,
  isUploading: false,
  currentUploads: new Map(),
  cancelled: false,
})

// 视频URL
const videoUrl = ref('')

// 初始化视频预览
const initVideoPreview = () => {
  if (props.file) {
    videoUrl.value = URL.createObjectURL(props.file)
  }
}

// 初始化组件时准备上传
const prepareUpload = () => {
  if (!props.file) {
    showToast('请先选择文件')
    return
  }

  // 创建视频预览
  initVideoPreview()

  // 准备上传数据
  uploadInfo.value.totalParts = Math.ceil(props.file.size / uploadInfo.value.partSize)

  // 开始上传
  startUpload()
}

// 开始上传
const startUpload = async () => {
  if (!props.file) {
    showToast('请先选择文件')
    return
  }

  try {
    uploadInfo.value.isUploading = true

    // 初始化上传会话
    await initializeUploadSession()

    // 上传分片
    await uploadParts()

    // 如果上传未取消且未暂停，完成上传
    if (!uploadInfo.value.cancelled && !uploadInfo.value.isPaused) {
      await completeUpload()
    }
  } catch (error: any) {
    // 显示后端返回的错误信息
    const backendMessage = error.response?.data?.message || error.message
    showToast(`上传失败: ${backendMessage}`)
    throw error
  }
}

// 初始化上传会话
const initializeUploadSession = async () => {
  if (!props.file) return

  try {
    const initData = {
      filename: props.file.name,
      fileSize: props.file.size,
      mimeType: props.file.type,
      tag: 'user', // 默认使用用户内容标签
      path: 'profile/videos', // 默认上传路径
      chunkSize: uploadInfo.value.partSize,
    }

    const response = await initializeUpload(initData)

    console.log('response', response)

    // 保存上传信息
    uploadInfo.value.sessionId = response.data.data.sessionId
    uploadInfo.value.uploadId = response.data.data.uploadId
    uploadInfo.value.objectKey = response.data.data.objectKey
  } catch (error: any) {
    // 显示后端返回的错误信息
    const backendMessage = error.response?.data?.message || error.message
    showToast(`初始化上传失败: ${backendMessage}`)
    throw error
  }
}

// 上传所有分片
const uploadParts = async () => {
  if (!props.file || !uploadInfo.value.sessionId) return

  const concurrentUploads = 3 // 并发上传数
  let activeUploads = 0
  let nextPartNumber = 1 // 分片序号从1开始
  let completedParts = 0

  return new Promise((resolve, reject) => {
    // 启动上传函数
    function startNextUpload() {
      if (nextPartNumber > uploadInfo.value.totalParts) {
        // 所有分片已经开始上传
        return
      }

      if (uploadInfo.value.cancelled) {
        return
      }

      if (uploadInfo.value.isPaused) {
        return
      }

      const partNumber = nextPartNumber++
      activeUploads++

      // 上传分片
      uploadPart(partNumber)
        .then(partInfo => {
          if (partInfo) {
            // 分片上传成功
            completedParts++
            activeUploads--
            uploadInfo.value.uploadedParts.push(partInfo)

            // 更新UI进度
            progress.value = Math.round((completedParts / uploadInfo.value.totalParts) * 100)

            // 检查是否完成
            if (completedParts === uploadInfo.value.totalParts) {
              resolve(true)
            } else if (!uploadInfo.value.isPaused && !uploadInfo.value.cancelled) {
              // 继续上传下一个分片
              startNextUpload()
            }
          }
        })
        .catch(error => {
          // 分片上传失败
          activeUploads--

          if (uploadInfo.value.cancelled) {
            return
          }

          reject(error)
        })
    }

    // 启动初始并发上传
    for (let i = 0; i < Math.min(concurrentUploads, uploadInfo.value.totalParts); i++) {
      if (!uploadInfo.value.isPaused && !uploadInfo.value.cancelled) {
        startNextUpload()
      }
    }

    // 如果没有分片需要上传（空文件），直接完成
    if (uploadInfo.value.totalParts === 0) {
      resolve(true)
    }
  })
}

// 上传单个分片
const uploadPart = async (partNumber: number) => {
  if (!props.file || !uploadInfo.value.sessionId) return null

  const start = (partNumber - 1) * uploadInfo.value.partSize
  const end = Math.min(start + uploadInfo.value.partSize, props.file.size)
  const chunk = props.file.slice(start, end)

  try {
    // 创建请求取消控制器
    const controller = new AbortController()

    // 保存正在上传的请求，以便可以取消
    uploadInfo.value.currentUploads.set(partNumber, controller)

    // 发送请求
    const response = await uploadVideoPart({
      sessionId: uploadInfo.value.sessionId,
      partNumber,
      chunk: chunk as unknown as string, // 类型转换以符合接口
    })

    // 从映射中移除已完成的请求
    uploadInfo.value.currentUploads.delete(partNumber)

    return {
      partNumber,
      etag: response.data?.etag || '',
      size: chunk.size,
    }
  } catch (error: any) {
    // 检查是否是由于取消导致的错误
    if (error.name === 'AbortError') {
      return null
    }

    showToast(`上传分片 ${partNumber} 失败: ${error.message}`)
    throw error
  }
}

// 完成上传
const completeUpload = async () => {
  if (!uploadInfo.value.sessionId) return

  try {
    const response = await finalizeUpload({
      sessionId: uploadInfo.value.sessionId,
    })

    // 保存上传结果，但不立即发送到父组件
    uploadResult.value = {
      fileUrl: response.data.data.fileUrl,
      fileKey: response.data.data.fileKey,
      size: response.data.data.size,
      videoMetadata: response.data.data.videoMetadata,
    }

    // 标记上传完成
    uploadCompleted.value = true
    uploadInfo.value.isUploading = false

    // 更新UI
    progress.value = 100
  } catch (error: any) {
    // 显示后端返回的错误信息
    const backendMessage = error.response?.data?.message || error.message
    showToast(`完成上传失败: ${backendMessage}`)
    throw error
  }
}

// 处理重新上传
const handleReupload = () => {
  console.log('重新上传')
  emit('reupload')
}

// 处理下一步按钮点击
const handleNextStep = () => {
  if (!uploadResult.value || !uploadResult.value.fileUrl || !uploadResult.value.fileKey) {
    showToast('请先完成上传')
    return
  }

  console.log('进入下一步，上传结果:', uploadResult.value)

  // 发送完成事件，包含上传结果
  emit('stepComplete', {
    fileUrl: uploadResult.value.fileUrl,
    fileKey: uploadResult.value.fileKey,
    size: uploadResult.value.size || 0,
    videoMetadata: uploadResult.value.videoMetadata || null,
  })
}

// 组件卸载时清理资源
onUnmounted(() => {
  // 取消所有进行中的请求
  for (const controller of uploadInfo.value.currentUploads.values()) {
    controller.abort()
  }
  uploadInfo.value.currentUploads.clear()

  // 释放视频URL
  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value)
  }
})

// 自动开始准备上传
prepareUpload()
</script>

<template>
  <div class="upload-progress">
    <!-- 视频预览区域 -->
    <div class="video-preview-container">
      <video
        v-if="videoUrl"
        class="video-preview"
        :src="videoUrl"
        :poster="props.poster"
        preload="metadata"
        controls
      ></video>
      <div class="progress-container">
        <Progress
          :percentage="progress"
          color="#07c160"
          :show-pivot="false"
          :stroke-width="5"
          class="progress-bar"
        />
      </div>
    </div>

    <!-- 上传完成信息 -->
    <div class="upload-success" v-if="uploadCompleted">
      <p class="success-text">视频上传成功！</p>
    </div>

    <!-- 底部区域 -->
    <div class="bottom-actions">
      <!-- 上传中状态 -->
      <Button
        v-if="uploadInfo.isUploading && !uploadCompleted"
        type="primary"
        block
        disabled
        loading
        loading-text="上传中..."
        class="loading-btn"
      >
        {{ progress }}%
      </Button>

      <!-- 上传完成状态 -->
      <div v-else-if="uploadCompleted" class="completed-buttons">
        <Button type="default" @click="handleReupload" class="reupload-btn">重新上传</Button>
        <Button type="success" @click="handleNextStep" class="next-btn">下一步</Button>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.upload-progress {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
}

.video-preview-container {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
  position: relative;
  width: 100%;
  border: 2px solid var(--van-text-color);
}

.video-preview {
  width: 100%;
  height: 200px;
  object-fit: contain;
  background-color: #000;
  vertical-align: top;
}

.progress-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.upload-controls {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 16px;
}

.upload-status {
  text-align: center;

  .status-text {
    margin: 0;
    font-size: 14px;

    &.success {
      color: #07c160;
    }

    &.paused {
      color: #ff9800;
    }

    &.uploading {
      color: #2196f3;
    }
  }
}

.bottom-actions {
  margin-top: auto;
  padding-bottom: 16px;
}

.loading-btn {
  background-color: #07c160 !important;
  border-color: #07c160 !important;
  border-radius: 8px;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
}

.completed-buttons {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.reupload-btn {
  width: 48%;
  background-color: #fff;
  border: 1px solid #dcdcdc;
  color: #333;
  border-radius: 8px;
  height: 44px;
  font-size: 16px;
}

.next-btn {
  width: 48%;
  background-color: #07c160;
  border-color: #07c160;
  color: white;
  border-radius: 8px;
  height: 44px;
  font-size: 16px;
}

.status-text {
  font-size: 14px;
  margin: 8px 0;

  &.uploading {
    color: #2196f3;
  }
}

.upload-success {
  margin-bottom: 20px;
  text-align: center;
}

.success-text {
  font-size: 16px;
  font-weight: 500;
  color: #07c160;
  margin: 0;
}
</style>
