<script setup lang="ts">
  import { NavBar } from 'vant'
  import { ref } from 'vue'

  const props = defineProps({
    path: {
      type: String,
      required: false,
      default: 'home',
    },
  })

  const onClickLeft = () => {
    history.back()
    // if (props.path) {
    //   window.location.pathname = props.path
    // } else {
    //   history.back()
    // }
  }
  const navTitle = ref('')
  // window.location
  if (typeof window !== 'undefined') {
    const params = new URL(window.location.href).searchParams
    const title = params.get('title')
    const decodedTitle = title && decodeURIComponent(title)
    navTitle.value = decodedTitle || '跑狗系列'
  }
</script>

<template>
  <NavBar :title="navTitle" left-text="" left-arrow @click-left="onClickLeft" />
</template>

<style lang="less" scoped></style>
