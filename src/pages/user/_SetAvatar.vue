<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { NavBar, Icon, showFailToast, showSuccessToast } from 'vant'
  import service from '@/service'
  import utils from '@/utils'
  import constants from '@/constants'

  interface Avatar {
    url: string
    data: string
  }

  const avatarUrlList = ref<Avatar[]>([])
  const selectedAvatar = ref<string>('')
  const isLoading = ref(false)

  function onBack() {
    if (typeof window !== 'undefined') {
      window.history.back()
    }
  }

  function selectAvatar(avatar: string) {
    selectedAvatar.value = avatar
  }

  async function initAvatarList() {
    avatarUrlList.value = []
    const currentAvatar = utils.getLSItem(constants.localStorageKeys.AVATAR)
    const response = await service.kv().getAvatarList().do()
    for (const item of response[0]) {
      if (currentAvatar === item) {
        selectedAvatar.value = await utils.getImageUrl(item)
      }
      avatarUrlList.value.push({ url: item, data: await utils.getImageUrl(item) })
    }
    if (!selectedAvatar.value && avatarUrlList.value.length) {
      selectedAvatar.value = avatarUrlList.value[0].data
    }
  }

  async function confirmSelection() {
    const selectedAvatarUrl = avatarUrlList.value.find(avatar => avatar.data === selectedAvatar.value)?.url
    if (!selectedAvatarUrl) return

    try {
      isLoading.value = true
      console.log(selectedAvatarUrl)
      const response = await service.user.updateAvatar(selectedAvatarUrl)
      if (!response.data.success) {
        showFailToast('更换头像失败')
      }
      showSuccessToast('更换头像成功')
      onBack()
      utils.setLSItem(constants.localStorageKeys.AVATAR, selectedAvatarUrl)
    } catch (error) {
      console.error(error)
      showFailToast('更换头像失败')
    } finally {
      isLoading.value = false
    }
  }

  onMounted(initAvatarList)
</script>

<template>
  <div class="wrapper">
    <NavBar title="我的头像" safe-area-inset-top fixed placeholder left-arrow @click-left="onBack" />

    <div class="selected-avatar">
      <img v-if="selectedAvatar" :src="selectedAvatar" alt="选中的头像" />
    </div>

    <div class="avatar-grid">
      <div
        v-for="(avatar, index) in avatarUrlList"
        :key="index"
        class="avatar-item"
        :class="{ selected: selectedAvatar === avatar.data }"
        @click="selectAvatar(avatar.data)"
      >
        <img :src="avatar.data" alt="头像" />
        <Icon v-if="selectedAvatar === avatar.data" name="checked" color="#07c160" size="24" class="check-icon" />
      </div>
    </div>

    <button class="confirm-button" :disabled="!selectedAvatar" @click="confirmSelection">确定更换</button>
  </div>
</template>

<style scoped>
  .wrapper {
    background-color: #f8f8f8;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 16px;
    overflow-y: auto;
  }

  .selected-avatar {
    margin-top: 20px;
    min-width: min(30vw, 180px);
    min-height: min(30vw, 180px);
    width: min(30vw, 180px);
    height: min(30vw, 180px);
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid #07c160;
  }

  .selected-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    margin-top: 20px;
    width: 100%;
    max-width: 600px;
    justify-items: center;
  }

  .avatar-item {
    width: min(20vw, 120px);
    padding-top: min(20vw, 120px);
    position: relative;
    border-radius: 50%;
    overflow: visible;
    cursor: pointer;
    border: 2px solid transparent;
    transition: border-color 0.3s;
  }

  .avatar-item img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }

  .avatar-item.selected {
    border-color: #07c160;
  }

  .check-icon {
    position: absolute;
    bottom: -4px;
    right: -4px;
    background-color: white;
    border-radius: 50%;
    padding: 2px;
    z-index: 1;
  }

  .confirm-button {
    margin-top: 20px;
    padding: 10px 20px;
    font-size: 16px;
    border: none;
    border-radius: 8px;
    background-color: #07c160;
    color: white;
    cursor: pointer;
    transition: background-color 0.3s;
    width: 90%;
  }

  .confirm-button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
</style>
