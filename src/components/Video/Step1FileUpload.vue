<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Uploader, Icon, Row, Col, showToast } from 'vant'
import tempImg from '@/assets/icons/video/temp.png'

const emit = defineEmits(['stepComplete'])

// 摄像头状态
const cameraStream = ref<MediaStream | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const mediaRecorder = ref<MediaRecorder | null>(null)
const isRecording = ref(false)
const recordedChunks = ref<Blob[]>([])
const cameraStatus = ref<'pending' | 'granted' | 'denied' | 'unavailable'>('pending')
const recordingTime = ref(0)
const recordingTimer = ref<number | null>(null)

// 初始化摄像头
const initCamera = async () => {
  try {
    cameraStatus.value = 'pending'
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment', // 尝试使用后置摄像头
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: true,
    })

    cameraStream.value = stream
    cameraStatus.value = 'granted'

    // 确保DOM已更新后再设置视频源
    setTimeout(() => {
      if (videoRef.value) {
        videoRef.value.srcObject = stream
        videoRef.value.onloadedmetadata = () => {
          videoRef.value?.play().catch(e => {
            console.error('视频播放失败:', e)
            showToast('无法播放摄像头内容')
          })
        }
      } else {
        console.error('视频元素未找到')
      }
    }, 100)

    // 准备录制器
    prepareRecorder(stream)
  } catch (error) {
    console.error('获取摄像头失败:', error)
    if ((error as any).name === 'NotAllowedError') {
      cameraStatus.value = 'denied'
    } else {
      cameraStatus.value = 'unavailable'
    }
    showToast('无法访问摄像头，请检查权限设置或使用上传功能')
  }
}

// 重新初始化摄像头
const reinitCamera = () => {
  releaseCamera()
  initCamera()
}

// 准备录制器
const prepareRecorder = (stream: MediaStream) => {
  try {
    // 尝试不同的MIME类型
    let options = {}
    if (MediaRecorder.isTypeSupported('video/webm; codecs=vp9')) {
      options = { mimeType: 'video/webm; codecs=vp9' }
    } else if (MediaRecorder.isTypeSupported('video/webm; codecs=vp8')) {
      options = { mimeType: 'video/webm; codecs=vp8' }
    } else if (MediaRecorder.isTypeSupported('video/webm')) {
      options = { mimeType: 'video/webm' }
    } else if (MediaRecorder.isTypeSupported('video/mp4')) {
      options = { mimeType: 'video/mp4' }
    }

    mediaRecorder.value = new MediaRecorder(stream, options)

    mediaRecorder.value.ondataavailable = event => {
      if (event.data && event.data.size > 0) {
        recordedChunks.value.push(event.data)
      }
    }

    mediaRecorder.value.onstop = () => {
      // 生成视频文件
      processRecordedVideo()
    }
  } catch (e) {
    console.error('创建录制器失败:', e)
    showToast('设备不支持视频录制，请使用上传功能')
  }
}

// 开始录制
const startRecording = () => {
  if (!mediaRecorder.value || isRecording.value) return

  // 确保摄像头正常工作
  if (cameraStatus.value !== 'granted' || !cameraStream.value) {
    reinitCamera()
    showToast('摄像头准备中，请稍后再试')
    return
  }

  try {
    recordedChunks.value = []
    mediaRecorder.value.start(100) // 每100ms一个数据块
    isRecording.value = true
    recordingTime.value = 0

    // 开始计时
    recordingTimer.value = window.setInterval(() => {
      recordingTime.value += 1
    }, 1000)

    showToast('开始录制')
  } catch (e) {
    console.error('开始录制失败:', e)
    showToast('开始录制失败')
  }
}

// 停止录制
const stopRecording = () => {
  if (!mediaRecorder.value || !isRecording.value) return

  try {
    mediaRecorder.value.stop()
    isRecording.value = false

    // 停止计时
    if (recordingTimer.value) {
      clearInterval(recordingTimer.value)
      recordingTimer.value = null
    }

    showToast('录制已停止')
  } catch (e) {
    console.error('停止录制失败:', e)
    showToast('停止录制失败')
  }
}

// 处理录制的视频
const processRecordedVideo = async () => {
  if (recordedChunks.value.length === 0) {
    showToast('没有录制内容')
    return
  }

  try {
    // 创建Blob
    const videoBlob = new Blob(recordedChunks.value, { type: 'video/webm' })

    // 转换为File对象
    const file = new File([videoBlob], `video_${Date.now()}.webm`, { type: 'video/webm' })

    // 提取封面和时长
    const result = (await extractVideoThumbnailFromFile(file)) as {
      poster: string
      duration: string
    }

    // 向父组件传递文件
    emit('stepComplete', {
      file,
      poster: result.poster,
      duration: result.duration,
    })
  } catch (error) {
    showToast(`处理录制文件失败: ${(error as Error).message}`)
  }
}

// 格式化录制时间
const formatRecordingTime = () => {
  const minutes = Math.floor(recordingTime.value / 60)
  const seconds = recordingTime.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

// 释放摄像头资源
const releaseCamera = () => {
  if (cameraStream.value) {
    cameraStream.value.getTracks().forEach(track => track.stop())
    cameraStream.value = null
  }

  if (videoRef.value) {
    videoRef.value.srcObject = null
  }

  if (recordingTimer.value) {
    clearInterval(recordingTimer.value)
    recordingTimer.value = null
  }
}

// 从本地文件截取视频封面
const extractVideoThumbnailFromFile = (file: File) => {
  return new Promise(resolve => {
    const url = URL.createObjectURL(file)

    // 创建视频元素
    const video = document.createElement('video')
    video.muted = true
    video.src = url

    // 当视频元数据加载完成时截取封面
    video.onloadedmetadata = () => {
      // 跳转到视频的第1秒
      const captureTime = Math.min(1, video.duration / 3)
      video.currentTime = captureTime

      // 获取视频时长
      const duration = formatTime(video.duration)

      // 当视频跳转到指定时间点后
      video.onseeked = () => {
        try {
          // 创建Canvas
          const canvas = document.createElement('canvas')
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight

          // 将视频帧绘制到Canvas
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

            // 将Canvas转换为图片URL
            const imageUrl = canvas.toDataURL('image/jpeg')

            // 清理资源
            video.pause()
            video.src = ''
            URL.revokeObjectURL(url)

            resolve({
              poster: imageUrl,
              duration: duration,
            })
          }
        } catch (error: any) {
          console.error('截取视频封面失败:', error)
          resolve({
            poster: tempImg.src,
            duration: duration,
          })
        }
      }
    }

    // 处理加载错误
    video.onerror = () => {
      console.error('获取视频时长失败')
      URL.revokeObjectURL(url)
      resolve({
        poster: tempImg.src,
        duration: '未知',
      })
    }
  })
}

// 格式化时间函数
const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) {
    return '未知'
  }
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}分${secs}秒`
}

// 处理文件选择
const afterRead = async (file: any) => {
  if (!file || !file.file) {
    showToast('文件读取失败')
    return
  }

  try {
    // 提取封面和时长
    const { poster, duration } = (await extractVideoThumbnailFromFile(file.file)) as any

    // 向父组件传递文件信息和提取的数据
    emit('stepComplete', {
      file: file.file,
      poster,
      duration,
    })
  } catch (error: any) {
    showToast(`文件处理失败: ${error.message}`)
  }
}

// 组件挂载时初始化摄像头
onMounted(() => {
  setTimeout(() => {
    initCamera()
  }, 300)
})

// 组件卸载时释放资源
onUnmounted(() => {
  releaseCamera()
})
</script>

<template>
  <div class="video-capture">
    <!-- 摄像头区域 -->
    <div class="camera-container">
      <video
        v-if="cameraStatus === 'granted'"
        ref="videoRef"
        autoplay
        playsInline
        muted
        class="camera-feed"
      ></video>

      <div v-else class="camera-placeholder">
        <div class="video-icon-container">
          <Icon name="video-o" size="80" color="#ffffff" />
        </div>
        <p v-if="cameraStatus === 'pending'" class="status-text">正在请求摄像头权限...</p>
        <p v-else-if="cameraStatus === 'denied'" class="status-text">摄像头权限被拒绝</p>
        <p v-else-if="cameraStatus === 'unavailable'" class="status-text">设备不支持摄像头</p>
      </div>

      <!-- 录制计时器 -->
      <div v-if="isRecording" class="recording-indicator">
        <div class="recording-dot"></div>
        <span>{{ formatRecordingTime() }}</span>
      </div>
    </div>

    <!-- 底部控制区 -->
    <div class="controls">
      <!-- 录制按钮（圆形位置） -->
      <div class="record-control">
        <div
          v-if="!isRecording"
          class="record-button"
          @click="startRecording"
          :class="{ disabled: cameraStatus !== 'granted' }"
        ></div>
        <div v-else class="stop-button" @click="stopRecording"></div>
      </div>

      <!-- 上传按钮（方形位置） -->
      <div class="upload-control">
        <Uploader :after-read="afterRead" accept="video/*" :show-upload="false">
          <div class="upload-button-container material-icons-outlined">image</div>
        </Uploader>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.video-capture {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #000;
}

.camera-container {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  width: 100%;
  height: 100%; /* 确保容器高度为100% */
}

.camera-feed {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1; /* 确保视频显示在最上层 */
}

.camera-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #fff;
  padding: 20px;
  width: 100%;
  height: 100%;
}

.video-icon-container {
  position: relative;
  margin-bottom: 20px;
}

.status-text {
  margin-top: 10px;
  font-size: 14px;
  color: #ffffff;
}

.upload-text {
  margin-top: 10px;
  font-size: 16px;
  color: #07c160;
}

.recording-indicator {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  color: #fff;
  z-index: 2; /* 确保录制指示器显示在最上层 */

  .recording-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: #ff3b30;
    margin-right: 8px;
    animation: blink 1s infinite;
  }

  @keyframes blink {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
    }
    100% {
      opacity: 1;
    }
  }
}

.controls {
  height: 90px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 2; /* 确保控制按钮显示在最上层 */
}

.record-control {
  display: flex;
  justify-content: center;
  align-items: center;
}

.record-button {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: #ff3b30;
  border: 3px solid #fff;
  cursor: pointer;

  &.disabled {
    background-color: #aaa;
    cursor: not-allowed;
  }
}

.stop-button {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &::before {
    content: '';
    width: 30px;
    height: 30px;
    background-color: #ff3b30;
    border-radius: 4px;
  }
}

.upload-control {
  position: absolute;
  top: 50%;
  right: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: translateY(-50%);
}

.upload-button-container {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 36px;
  cursor: pointer;
}
</style>
