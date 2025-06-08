<script setup lang="ts">
import darkThemeVars from '@/styles/darkThemeVars'
import lightThemeVars from '@/styles/themeVars'
import { ConfigProvider } from 'vant'
import { defineProps, useSlots, withDefaults } from 'vue'

const props = withDefaults(
  defineProps<{
    isDark?: boolean
  }>(),
  {
    isDark: false,
  }
)
const themeVars = props.isDark === true ? darkThemeVars : lightThemeVars
const theme = props.isDark === true ? 'dark' : 'light'

// 可選：你也可以用 props 傳進來主題或 darkMode 開關
const slots = useSlots()
</script>

<template>
  <ConfigProvider
    id="com-container"
    :themeVars="themeVars"
    :theme="theme"
    style="background-color: var(--van-background)"
  >
    <slot />
    <!-- <InstallButton /> -->
  </ConfigProvider>
</template>
