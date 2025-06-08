<template>
  <div class="nav-wrapper safe-area-top">
    <van-nav-bar
      :title="title"
      :left-text="leftText"
      :left-arrow="leftArrow"
      :fixed="fixed"
      @click-left="$emit('click-left')"
      @click-right="$emit('click-right')"
    >
      <template #right>
        <slot name="right" />
      </template>
    </van-nav-bar>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: '',
  },
  leftText: {
    type: String,
    default: '',
  },
  leftArrow: {
    type: Boolean,
    default: false,
  },
  fixed: {
    type: Boolean,
    default: true,
  },
})

defineEmits(['click-left', 'click-right'])
</script>

<style scoped>
.nav-wrapper {
  width: 100%;
}
</style>
