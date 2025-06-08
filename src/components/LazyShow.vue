<template>
  <template v-if="lazyShow">
    <slot />
  </template>
</template>

<script setup lang="ts">
import { ref, watchEffect, onBeforeUnmount } from 'vue'

const props = withDefaults(
  defineProps<{
    show: boolean
    delay?: number
  }>(),
  {
    delay: 700,
  }
)

const timeout = ref()
const lazyShow = ref(false)

watchEffect(() => {
  timeout.value && clearTimeout(timeout.value)
  timeout.value = setTimeout(() => {
    lazyShow.value = props.show
  }, props.delay)
})

onBeforeUnmount(() => {
  clearTimeout(timeout.value)
})
</script>
