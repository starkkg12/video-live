<script setup lang="ts">
import {
  NavBar,
  Field,
  CellGroup,
  Image,
  Icon,
  Button,
  showConfirmDialog,
  Uploader,
  Dialog,
  showDialog,
  showToast,
} from 'vant'
import type { UploaderFileListItem, UploaderInstance } from 'vant'
import utils from '@/utils'
import service from '@/service'
import constants from '@/constants'
import getLSItem from '@/utils/getLocalStorageItem'
import { ref, nextTick } from 'vue'
import type { Numeric } from 'vant/lib/utils'
import StateManager from '@/components/StateManager.vue'
import AvatarDrawer from '@/components/AvatarDrawer.vue'

const avatar = ref(utils.getImageUrl('mine', 'avatar'))
const showAvatarDrawer = ref(false)

const uploadedAvatarList = ref<UploaderFileListItem[]>([])

const uploaderInstance = ref<UploaderInstance | null>(null)

const showConfirmAvatarDialog = ref(false)

const uploadedFilePath = ref('')

const isLoading = ref(false)

function onBack() {
  typeof window !== 'undefined' && window.history.back()
}

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

async function logout() {
  if (typeof window === 'undefined') return
  await showConfirmDialog({
    title: '退出登录',
    message: '确定要退出登录吗？',
    confirmButtonText: '退出',
    confirmButtonColor: '#f56c6c',
  })
  try {
    await service.auth.exit()
  } catch (error) {
    console.error(error)
  } finally {
    utils.clearAuth()
    nextTick(() => {
      window.history.back()
    })
  }
}

function onChooseAvatar() {
  showAvatarDrawer.value = true
}

function handleAvatarUpdated(newAvatarUrl: string) {
  avatar.value = utils.getImageUrl(newAvatarUrl, 'avatar')
}

function beforeReadAvatar(file: File | File[], detail: { name: Numeric; index: number }) {
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

async function afterReadAvatar(
  _file: UploaderFileListItem | UploaderFileListItem[],
  _detail: { name: Numeric; index: number }
) {
  isLoading.value = false
  showConfirmAvatarDialog.value = true
}

async function onConfirmAvatar() {
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

function onCancelAvatar() {
  showConfirmAvatarDialog.value = false
  uploadedAvatarList.value = []
}

function showInDevelopment() {
  showToast('该功能正在开发中')
}
</script>

<template>
  <StateManager :loading="isLoading">
    <div class="wrapper">
      <NavBar
        title="用户设置"
        safe-area-inset-top
        fixed
        placeholder
        left-arrow
        @click-left="onBack"
      />

      <div class="menu">
        <CellGroup inset>
          <Field readonly @click="onChooseAvatar">
            <template #label>
              <Image class="avator" round fit="cover" width="48px" height="48px" :src="avatar" />
            </template>
            <template #extra>
              <div class="field-right">
                <div style="color: #fff">修改头像</div>
                <Icon name="arrow" size="16px" color="#969799" />
              </div>
            </template>
          </Field>
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
          <Field readonly label="修改手机号" is-link @click="utils.jumpTo('/user/setphone')" />
          <Field readonly label="意见反馈" is-link @click="showInDevelopment" />
          <Field readonly label="关于我们" is-link @click="showInDevelopment" />
        </CellGroup>

        <Button class="logout-button" type="danger" @click="logout">退出登录</Button>
      </div>
    </div>
  </StateManager>

  <AvatarDrawer v-model:visible="showAvatarDrawer" @avatar-updated="handleAvatarUpdated" />

  <Uploader
    class="uploader"
    :max-count="1"
    v-model="uploadedAvatarList"
    ref="uploaderInstance"
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
</template>

<style scoped>
.wrapper {
  background-color: var(--van-background);
  height: 100%;
  overflow-y: auto;
}

.wrapper :deep(.van-nav-bar--fixed) {
  left: auto;
  position: absolute;
}

.menu {
  margin-top: 16px;
}

.field-right {
  display: flex;
  justify-content: end;
  align-items: center;
  gap: 8px;
}

.logout-button {
  margin: 16px;
  width: calc(100% - 32px);
  background: var(--custom-block-2) !important;
  border: none !important;
  box-shadow: none !important;
  /* height: 1em;
    font-size: .36em; */
  color: var(--van-danger-color) !important;
}

.uploader {
  display: flex;
  align-items: center;
}

.uploader {
  display: none;
}

.avatar-confirm {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: min(12px, 2vw) 0;
}
.wrapper :deep(.van-cell) {
  background-color: transparent;
}
.wrapper :deep(.van-nav-bar .van-icon) {
  color: var(--van-text-color);
}
.wrapper :deep(.van-cell:after) {
  border-bottom: 0.02rem solid #e1e1e1;
}
</style>
