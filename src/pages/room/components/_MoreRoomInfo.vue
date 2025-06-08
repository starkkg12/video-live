<template>
  <div class="more-room-info-wrapper">
    <NavBar safe-area-inset-top placeholder class="nav-bar" title="语音房资料">
      <template #right>
        <van-icon name="cross" size="24" @click="emit('close')" color="#434343" />
      </template>
    </NavBar>
    <div class="more-room-info height-without-nav-bar">
      <div class="group-avatar-wrapper">
        <AvatarsPro :room="room" :user-ids="room.userList.value" size="80px" />
      </div>
      <CreateVue :type="room.type.value" scene="edit" :room="room" @close="emit('close', 'all')" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { Icon as VanIcon, NavBar } from 'vant'
  import CreateVue from '../_Create.vue'
  import AvatarsPro from '@/pages/room/components/_AvatarsPro.vue'

  const props = withDefaults(
    defineProps<{
      room: any
    }>(),
    {
      room: null,
    }
  )

  const emit = defineEmits<{
    close: [type?: 'all']
  }>()
</script>

<style scoped lang="less">
  @import '@/styles/variables.less';

  .more-room-info-wrapper {
    height: 100%;
    .more-room-info {
      background-color: #fff;
      height: calc(100% - 46px);
      .group-avatar-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100px;
      }
      .create-wrapper {
        height: calc(100% - 100px);
      }
    }
  }
</style>
