<script setup lang="ts">
import bgImage from '@/assets/images/bg.jpeg'
import getLSItem from '@/utils/getLocalStorageItem'
import { CellGroup, Dialog, Field, Icon, Image, NavBar, showDialog, Uploader } from 'vant'
import { ref } from 'vue'

import AvatarDrawer from '@/components/AvatarDrawer.vue'
import StateManager from '@/components/StateManager.vue'
import constants from '@/constants'
import service from '@/service'
import utils from '@/utils'

import type { UploaderFileListItem, UploaderInstance } from 'vant'
import type { Numeric } from 'vant/lib/utils'

const uploadedBackgroundImageList = ref<UploaderFileListItem[]>([])
const uploadedAvatarList = ref<UploaderFileListItem[]>([])
const uploaderBackgroundImageInstance = ref<UploaderInstance | null>(null)
const uploaderAvatarInstance = ref<UploaderInstance | null>(null)

const isLoading = ref(false)
const isError = ref(false)
const isLoggedIn = ref(false)
const showConfirmBackgroundImageDialog = ref(false)
const showConfirmAvatarDialog = ref(false)
const uploadedFilePath = ref('')
const avatar = ref(utils.getImageUrl('mine', 'avatar'))

const showAvatarDrawer = ref(false)

// 格式化性别显示
function formatGender(gender: string | null) {
  if (!gender) return '未设置'

  switch (gender) {
    case 'm':
      return '男'
    case 'f':
      return '女'
    case 'x':
      return '不显示'
    default:
      return '未设置'
  }
}

const onBack = () => {
  window.history.back()
}
const onChooseBackgroundImg = () => {
  return showDevelopping()

  // if (!uploaderBackgroundImageInstance.value) return
  // if (uploadedBackgroundImageList.value.length)
  //   uploaderBackgroundImageInstance.value.reuploadFile(0)
  // else uploaderBackgroundImageInstance.value.chooseFile()
}
const onChooseAvatar = () => {
  showAvatarDrawer.value = true
}
const beforeReadBackgroundImage = (
  file: File | File[],
  detail: { name: Numeric; index: number }
) => {
  const size = Array.isArray(file) ? file[0].size : file.size
  isLoading.value = true
  // if (size > 30 * 1024 * 1024) {
  //   showDialog({
  //     title: '提示',
  //     message: '上传头像大小不能超过30MB',
  //   })
  //   isLoading.value = false
  //   return false
  // }
  return true
}
const beforeReadAvatar = (file: File | File[], detail: { name: Numeric; index: number }) => {
  const size = Array.isArray(file) ? file[0].size : file.size
  isLoading.value = true
  if (size > 30 * 1024 * 1024) {
    showDialog({
      title: '提示',
      message: '上传头像大小不能超过30MB',
    })
    isLoading.value = false
    return false
  }
  return true
}

const afterReadBackgroundImage = async (
  _file: UploaderFileListItem | UploaderFileListItem[],
  _detail: { name: Numeric; index: number }
) => {
  isLoading.value = false
  showConfirmBackgroundImageDialog.value = true
}

const afterReadAvatar = async (
  _file: UploaderFileListItem | UploaderFileListItem[],
  _detail: { name: Numeric; index: number }
) => {
  isLoading.value = false
  showConfirmAvatarDialog.value = true
}
// 上傳封面 (api未裝)
const onConfirmBackgroundImage = async () => {
  showConfirmBackgroundImageDialog.value = false
  const file = uploadedBackgroundImageList.value[0]
  if (!file.file) return
  try {
    isLoading.value = true
  } catch (error) {
    showDialog({
      title: '提示',
      message: '上传头像失败',
    })
  } finally {
    isLoading.value = false
    uploadedAvatarList.value = []
  }
}
const onCancelBackgroundImage = () => {
  showConfirmBackgroundImageDialog.value = false
  uploadedBackgroundImageList.value = []
}
// 上傳頭像
const onConfirmAvatar = async () => {
  showConfirmAvatarDialog.value = false

  const file = uploadedAvatarList.value[0]
  if (!file.file) return
  try {
    isLoading.value = true
    const uploadResponse = await service.upload.uploadSingle({
      storageStyle: 6,
      fileType: 'img',
      uploadFrom: service.upload.UploadFrom.USER_PROFILE_HEADER,
      uploadTarget: file.file.name,
      storageType: service.upload.StorageType.S3,
      env: service.upload.Env.DEV,
      file: file.file,
    })
    console.log('uploadResponse', uploadResponse)
    if (!uploadResponse.data.success) {
      showDialog({
        title: '提示',
        message: uploadResponse.data.errMessage,
      })
      return
    }
    uploadedFilePath.value = uploadResponse.data.data.path
    const setAvatarResponse = await service.user.updateAvatar(uploadedFilePath.value)
    if (!setAvatarResponse.data.success) {
      showDialog({
        title: '提示',
        message: setAvatarResponse.data.errMessage,
      })
    }
    utils.setLSItem(constants.localStorageKeys.AVATAR, uploadedFilePath.value)
    avatar.value = utils.getImageUrl(uploadedFilePath.value, 'avatar')
  } catch (error) {
    showDialog({
      title: '提示',
      message: '上传头像失败',
    })
  } finally {
    isLoading.value = false
    uploadedAvatarList.value = []
  }
}

const onCancelAvatar = () => {
  showConfirmAvatarDialog.value = false
  uploadedAvatarList.value = []
}

const handleAvatarUpdated = (newAvatarUrl: string) => {
  avatar.value = utils.getImageUrl(newAvatarUrl, 'avatar')
}

function showDevelopping() {
  showDialog({
    title: '提示',
    message: '该功能正在开发中',
  })
}
</script>
<template>
  <StateManager :loading="isLoading" :error="isError">
    <NavBar
      class="nav-bar"
      title="个人信息"
      safe-area-inset-top
      placeholder
      left-arrow
      @click-left="onBack"
    >
      <template #right>
        <div class="updateCover" @click="onChooseBackgroundImg">修改封面</div>
      </template>
    </NavBar>
    <div class="layout-wrap">
      <div class="layout-content">
        <div class="edit-personal-info">
          <!-- 封面 -->
          <div
            class="personal-background-box"
            :style="{
              background: `linear-gradient(0deg, rgba(0, 0, 0, 0.8) 10%, transparent 50%), url(${bgImage.src}) center center / cover no-repeat`,
            }"
          ></div>
          <div class="personal-info-card">
            <!-- 頭像 -->
            <section class="avatar-box" @click="onChooseAvatar">
              <div class="profile-pic-wrap" role="button">
                <Image
                  class="prof-backg"
                  round
                  fit="cover"
                  :src="avatar"
                  :style="{ visibility: isLoggedIn !== undefined ? 'visible' : 'hidden' }"
                />
                <div class="edit-replace-g-have">
                  <span class="iconfont desc-icon icon-zhaoxiangji"></span>
                  <div>更换头像</div>
                </div>
              </div>
            </section>
            <div class="info-card">
              <CellGroup inset>
                <Field readonly label="我的昵称" @click="utils.jumpTo('/user/set-name')">
                  <template #extra>
                    <div class="field-right">
                      <div style="color: #969799">
                        {{ getLSItem(constants.localStorageKeys.NICKNAME) }}
                      </div>
                      <Icon name="arrow" size="16px" color="#969799" />
                    </div>
                  </template>
                </Field>
                <Field readonly label="性别设置" @click="utils.jumpTo('/user/set-gender')">
                  <template #extra>
                    <div class="field-right">
                      <div style="color: #969799">
                        {{ formatGender(getLSItem(constants.localStorageKeys.GENDER)) }}
                      </div>
                      <Icon name="arrow" size="16px" color="#969799" />
                    </div>
                  </template>
                </Field>
                <Field
                  readonly
                  label="修改手机号"
                  is-link
                  @click="utils.jumpTo('/user/setphone')"
                />
                <Field readonly label="意见反馈" is-link @click="showDevelopping" />
                <Field readonly label="关于我们" is-link @click="showDevelopping" />
              </CellGroup>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 背景圖 -->
    <Uploader
      class="uploader"
      :max-count="1"
      v-model="uploadedBackgroundImageList"
      ref="uploaderBackgroundImageInstance"
      :before-read="beforeReadBackgroundImage"
      :after-read="afterReadBackgroundImage"
    />
    <Dialog
      v-model:show="showConfirmBackgroundImageDialog"
      show-cancel-button
      title="确定使用此封面吗？"
      @confirm="onConfirmBackgroundImage"
      @cancel="onCancelBackgroundImage"
    >
      <div class="avatar-confirm">
        <Image :src="uploadedAvatarList?.[0]?.objectUrl" fit="cover" width="30vw" height="30vw" />
      </div>
    </Dialog>
    <!-- 頭像 -->
    <Uploader
      class="uploader"
      :max-count="1"
      v-model="uploadedAvatarList"
      ref="uploaderAvatarInstance"
      :before-read="beforeReadAvatar"
      :after-read="afterReadAvatar"
    />

    <Dialog
      v-model:show="showConfirmAvatarDialog"
      show-cancel-button
      title="确定使用此头像吗？"
      @confirm="onConfirmAvatar"
      @cancel="onCancelAvatar"
    >
      <div class="avatar-confirm">
        <Image :src="uploadedAvatarList?.[0]?.objectUrl" fit="cover" width="30vw" height="30vw" />
      </div>
    </Dialog>
  </StateManager>
  <AvatarDrawer v-model:visible="showAvatarDrawer" @avatar-updated="handleAvatarUpdated" />
</template>
<style scoped>
.layout-wrap {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100vh;
}
.nav-bar {
  background: transparent;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  margin: 0 auto;

  @media (max-width: 768px) {
    max-width: 100%;
  }

  @media (min-width: 768px) {
    max-width: 480px;
  }
}

.updateCover {
  width: 90px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 6px 12px;
  border-radius: 6px;
  background: #0009;
  box-sizing: border-box;
  z-index: 999;
  color: #fff;
  overflow: hidden;
}
.layout-content {
  flex: 1;
  overflow: hidden;
}
.edit-personal-info {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.personal-background-box {
  position: relative;
  height: calc(25vh + env(safe-area-inset-top));
}
.edit-personal-info .personal-info-card {
  position: relative;
  flex: 1;
  border-radius: 15px 15px 0 0;
  background: #fff;
  margin-top: -15px;
}
.edit-personal-info .personal-info-card .avatar-box {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 20;
  height: 80px;
  margin-top: -40px;
}
.edit-personal-info .personal-info-card .avatar-box .profile-pic-wrap {
  position: relative;
  height: 80px;
  width: 80px;
}
.prof-backg {
  width: 80px;
  height: 80px;
  border-radius: 50%;
}

.uploader {
  display: none;
  align-items: center;
}

.edit-replace-g-have {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: #fff;
  background: #0006;
  border-radius: 50%;
}
.desc-icon {
  width: 16px;
  height: 16px;
  display: inline-block;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-position: center;
  flex-shrink: 0;
}
.icon-zhaoxiangji {
  background-image: url('../../assets/icons/zhaoxiangji.svg');
  fill: white;
}

.info-card {
  margin-top: 24px;
}
.edit-personal-info .personal-info-card .info-card :deep(.van-cell) {
  background: var(--van-text-color);
  color: var(--van-background);
}
.edit-personal-info .personal-info-card .info-card :deep(.van-field__label) {
  color: var(--van-background);
}
.field-right {
  display: flex;
  justify-content: end;
  align-items: center;
  gap: 8px;
}
:deep(.van-field:after) {
  border-color: #ebedf0;
}
:deep(.van-nav-bar .van-icon) {
  color: var(--van-text-color);
}
</style>
