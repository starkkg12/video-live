<script setup lang="ts">
import { ref } from 'vue'
import { NavBar, ConfigProvider } from 'vant'
import Step1FileUpload from '@/components/Video/Step1FileUpload.vue'
import Step2UploadProgress from '@/components/Video/Step2UploadProgress.vue'
import Step3VideoInfo from '@/components/Video/Step3VideoInfo.vue'
import utils from '@/utils'
import constants from '@/constants'

// 定义类型
interface FileData {
  file: File
  poster: string
  duration: string
}

interface UploadResult {
  fileUrl: string | null
  fileKey: string | null
  size: number
  videoMetadata: any
}

const pageTitle = '上传视频'
const onClickLeft = () => {
  if (step.value === 1) {
    history.go(-1)
  } else {
    step.value = 1
  }
}

// 用户ID
const myUserId = ref<string>(utils.getLSItem(constants.localStorageKeys.USER_ID) ?? '')

// 当前步骤
const step = ref(1)

// 共享数据
const sharedData = ref({
  file: null as File | null,
  poster: '',
  duration: '',
  uploadInfo: {
    fileUrl: null as string | null,
    fileKey: null as string | null,
    size: 0,
    videoMetadata: null as any,
  },
})

// 处理步骤1完成（文件上传）
const handleStep1Complete = (data: FileData) => {
  sharedData.value.file = data.file
  sharedData.value.poster = data.poster
  sharedData.value.duration = data.duration
  step.value = 2
}

// 处理步骤2完成（上传进度）
const handleStep2Complete = (data: UploadResult) => {
  sharedData.value.uploadInfo = data
  step.value = 3
}

// 处理重新上传
const handleReupload = () => {
  step.value = 1
}

// 处理完成
const handleComplete = () => {
  console.log('完成')
}
</script>

<template>
  <ConfigProvider theme-vars-inherit class="video-add-container">
    <NavBar
      class="nav-bar"
      fixed
      placeholder
      :title="pageTitle"
      left-arrow
      @click-left="onClickLeft"
    ></NavBar>
    <div class="video-add">
      <!-- 步骤1：选择文件上传 -->
      <Step1FileUpload v-if="step === 1" @step-complete="handleStep1Complete" />

      <!-- 步骤2：上传进度 -->
      <Step2UploadProgress
        v-if="step === 2 && sharedData.file"
        :file="sharedData.file"
        :poster="sharedData.poster"
        :duration="sharedData.duration"
        v-model:step="step"
        @step-complete="handleStep2Complete"
        @reupload="handleReupload"
      />

      <!-- 步骤3：填写视频信息 -->
      <Step3VideoInfo
        v-if="step === 3"
        :video-duration="sharedData.duration"
        :poster="sharedData.poster"
        :user-id="myUserId"
        :upload-info="sharedData.uploadInfo"
        @complete="handleComplete"
      />
    </div>
  </ConfigProvider>
</template>

<style lang="less" scoped>
.video-add-container {
  height: 100%;
}
.video-add {
  height: calc(100% - 46px);
  text-align: center;
  font-size: 14px;
  flex: 1;
  span {
    color: #07c160;
    display: block;
  }
}
</style>
