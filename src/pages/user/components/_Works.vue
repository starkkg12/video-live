<script setup lang="ts">
import UserVideoList from './_UserVideoList.vue'

const props = defineProps({
  sortBy: {
    type: String,
    default: 'latest',
  },
})
</script>

<template>
  <UserVideoList type="works" :sortBy="sortBy" />
</template>
