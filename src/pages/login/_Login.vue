<script setup lang="ts">
import axios from 'axios'
import { Icon, NavBar } from 'vant'
import { onMounted, ref } from 'vue'

import Login from '@/components/Login.vue'
import StateManager from '@/components/StateManager.vue'
import countryCodeAndPhoneCodeList from '@/constants/countryCodeAndPhoneCode.json'

interface CountryAndPhoneCode {
  english_name: string
  chinese_name: string
  country_code: string
  phone_code: string
}
const isLoading = ref(true)
const showCountryPicker = ref(false)

function onBack() {
  typeof window !== 'undefined' && window.history.back()
}

async function initPhoneCode() {
  try {
    const ipInfo = await axios.get('https://ip.ai4funs.com/')
    countryCodeAndPhoneCodeList.find((item: CountryAndPhoneCode) => {
      if (item.country_code.toUpperCase() === ipInfo.data.country?.toUpperCase()) {
        phoneCode.value = item.phone_code
      }
    })
  } catch (error) {
    console.error('error cc login initPhoneCode', error)
  }
}

const setIsLoading = (value: boolean) => {
  isLoading.value = value
}

onMounted(() => {
  initPhoneCode()
  window.location.replace('/')
})
</script>

<template>
  <div class="login">
    <!-- <StateManager :loading="isLoading">
      <NavBar :border="false">
        <template #left>
          <Icon
            name="arrow-left"
            @click="onBack"
            color="black"
            size="18px"
            fixed
            placeholder
            safe-area-inset-top
          />
        </template>
      </NavBar>
      <div>
        <Login @setIsLoading="setIsLoading" />
      </div>
    </StateManager> -->
  </div>
</template>

<style scoped>
.login {
  background: var(--custom-block-1);
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: scale(1);
}
:deep(.van-nav-bar) {
  background: var(--custom-block-1);
}
:deep(.van-nav-bar .van-icon) {
  color: #fff !important;
}
</style>
