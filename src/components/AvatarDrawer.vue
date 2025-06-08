<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon, Popup, showFailToast, showSuccessToast } from 'vant'
import service from '@/service'
import utils from '@/utils'
import constants from '@/constants'

interface Avatar {
  url: string
  data: string
}

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:visible', 'avatar-updated'])

const avatarUrlList = ref<Avatar[]>([])
const selectedAvatar = ref<string>('')
const isLoading = ref(false)

function closeDrawer() {
  emit('update:visible', false)
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
  const selectedAvatarUrl = avatarUrlList.value.find(
    avatar => avatar.data === selectedAvatar.value
  )?.url
  if (!selectedAvatarUrl) return

  try {
    isLoading.value = true
    const response = await service.user.updateAvatar(selectedAvatarUrl)
    if (!response.data.success) {
      showFailToast('更换头像失败')
      return
    }
    showSuccessToast('更换头像成功')
    utils.setLSItem(constants.localStorageKeys.AVATAR, selectedAvatarUrl)
    emit('avatar-updated', selectedAvatarUrl)
    closeDrawer()
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
  <Popup
    v-model:show="props.visible"
    position="bottom"
    @update:show="emit('update:visible', $event)"
    round
  >
    <div class="avatar-drawer">
      <div class="drawer-header">
        <div class="title">选择头像</div>
        <div class="close-icon" @click="closeDrawer">
          <Icon name="cross" size="20" />
        </div>
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
          <Icon
            v-if="selectedAvatar === avatar.data"
            name="checked"
            color="var(--van-primary-color)"
            size="24"
            class="check-icon"
          />
        </div>
      </div>

      <button
        class="confirm-button"
        :disabled="!selectedAvatar || isLoading"
        @click="confirmSelection"
      >
        {{ isLoading ? '更换中...' : '确定更换' }}
      </button>
    </div>
  </Popup>
</template>

<style scoped>
.avatar-drawer {
  background-color: #f8f8f8;
  padding: 16px;
  height: 70vh;
  display: flex;
  flex-direction: column;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
  margin-bottom: 16px;
}

.title {
  font-size: 18px;
  font-weight: bold;
}

.close-icon {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: #f0f0f0;
  cursor: pointer;
}

.selected-avatar {
  margin: 0 auto;
  width: min(30vw, 150px);
  height: min(30vw, 150px);
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--van-primary-color);
}

.selected-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 20px;
  width: 100%;
  overflow-y: auto;
  flex: 1;
  justify-items: center;
}

.avatar-item {
  width: min(20vw, 100px);
  height: min(20vw, 100px);
  position: relative;
  border-radius: 50%;
  overflow: visible;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.3s;
}

.avatar-item img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-item.selected {
  border-color: var(--van-primary-color);
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
  padding: 12px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  background-color: var(--van-primary-color);
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;
}

.confirm-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
