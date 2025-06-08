<script setup lang="ts">
import constants from '@/constants'
import service from '@/service'
import type { UserGender } from '@/service/user'
import utils from '@/utils'
import { Button, NavBar, Radio, RadioGroup, showDialog, showToast } from 'vant'
import { onMounted, ref } from 'vue'

const gender = ref('')
const loading = ref(false)

onMounted(() => {
  const currentGender = utils.getLSItem(constants.localStorageKeys.GENDER) || 'x'
  gender.value = currentGender
})

async function saveGender() {
  if (loading.value) return

  try {
    loading.value = true

    const response = await service.user.updateUserGender({
      gender: gender.value as UserGender,
    })

    if (response.success) {
      utils.setLSItem(constants.localStorageKeys.GENDER, gender.value)
      showToast('性别设置成功')

      setTimeout(() => {
        onBack()
      }, 500)
    } else {
      showDialog({
        title: '提示',
        message: response.message || '设置失败，请稍后重试',
      })
    }
  } catch (error) {
    console.error('设置性别失败', error)
    showDialog({
      title: '提示',
      message: '设置失败，请稍后重试',
    })
  } finally {
    loading.value = false
  }
}

function onBack() {
  typeof window !== 'undefined' && window.history.back()
}
</script>

<template>
  <div class="wrapper">
    <NavBar
      title="性别设置"
      safe-area-inset-top
      fixed
      placeholder
      left-arrow
      @click-left="onBack"
    />

    <div class="content">
      <div class="radio-group-wrapper">
        <RadioGroup v-model="gender">
          <div class="radio-item">
            <Radio name="m" icon-size="20px">男</Radio>
          </div>
          <div class="radio-item">
            <Radio name="f" icon-size="20px">女</Radio>
          </div>
          <div class="radio-item">
            <Radio name="x" icon-size="20px">不显示</Radio>
          </div>
        </RadioGroup>
      </div>

      <div class="button-wrapper">
        <Button
          type="primary"
          block
          :loading="loading"
          loading-text="保存中..."
          @click="saveGender"
        >
          保存
        </Button>
      </div>
    </div>
  </div>
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

.wrapper :deep(.van-nav-bar .van-icon) {
  color: var(--van-text-color);
}

.content {
  padding: 16px;
}

.radio-group-wrapper {
  background-color: var(--van-card-background-color);
  border-radius: 8px;
  padding: 8px 16px;
  margin-bottom: 24px;
}

.radio-item {
  padding: 14px 0;
  border-bottom: 1px solid var(--van-border-color);
}

.radio-item:last-child {
  border-bottom: none;
}

.button-wrapper {
  padding: 16px 0;
  border: none;
}
</style>
