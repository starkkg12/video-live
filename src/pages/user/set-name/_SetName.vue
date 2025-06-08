<script setup lang="ts">
import { ref } from 'vue'
import { NavBar, Field, Button, showDialog } from 'vant'
import service from '@/service'
import StateManager from '@/components/StateManager.vue'
import utils from '@/utils'
import constants from '@/constants'
function onBack() {
  window.history.back()
}

const nickname = ref('')

const isLoading = ref(false)

async function onSubmit() {
  if (!nickname.value) {
    showDialog({
      title: '提示',
      message: '请输入昵称',
    })
    return
  }

  if (nickname.value.length < 3 || nickname.value.length > 8) {
    showDialog({
      title: '提示',
      message: '昵称长度为3-8个字符',
    })
    return
  }

  try {
    isLoading.value = true
    const response = await service.user.updateNickname(nickname.value)
    if (!response.data.success) {
      showDialog({
        title: '提示',
        message: response.data.errMessage,
      })
      return
    }
    utils.setLSItem(constants.localStorageKeys.NICKNAME, nickname.value)
    showDialog({
      title: '提示',
      message: '修改昵称成功',
    }).then(() => {
      typeof window !== 'undefined' && window.history.back()
    })
    nickname.value = ''
  } catch (error) {
    console.error(error)
    showDialog({
      title: '提示',
      message: '修改昵称失败',
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <NavBar title="修改昵称" left-arrow @click-left="onBack" safe-area-inset-top />
  <StateManager :loading="isLoading">
    <div class="wrapper">
      <div class="description-title">请输入您想要的个人昵称</div>

      <div><Field v-model="nickname" placeholder="请输入昵称" clearable /></div>

      <Button type="primary" round block class="submit-button" @click="onSubmit">保存</Button>
    </div>
  </StateManager>
</template>

<style scoped>
.wrapper {
  padding: 1rem;
}
.description-title {
  font-size: 1rem;
  color: #666;
}

.submit-button {
  margin-top: 2rem;
}
</style>
