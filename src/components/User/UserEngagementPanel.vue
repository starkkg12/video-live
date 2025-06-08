<script setup lang="ts">
  import RoomUsers from '@/pages/room/components/_RoomUsers.vue'
  const props = defineProps(['room'])
  const emit = defineEmits(['onFollowPopup', 'close'])
  const showFollowPopup = (userId: string) => {
    emit('onFollowPopup', userId)
  }
</script>
<template>
    <RoomUsers :room="room" @onFollowPopup="showFollowPopup" @close="emit('close')"/>
</template>
<style lang="scss" scoped>
:deep(.room-users) {
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
</style>