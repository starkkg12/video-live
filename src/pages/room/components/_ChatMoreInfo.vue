<template>
  <div class="chat-more-info">
    <NavBar safe-area-inset-top placeholder class="nav-bar" title="聊天室设置" left-arrow @click-left="emit('close')">
      <template #right>
        <div v-if="room.isOwner.value" class="button-delete" @click="deleteRoom">解散聊天室</div>
      </template>
    </NavBar>
    <div class="more-room-info height-without-nav-bar">
      <div class="group-avatar-wrapper">
        <AvatarsPro :room="room" :user-ids="room.userList.value" size="100px" />
      </div>
      <CreateVue :type="room.type.value" scene="edit" :room="room" @close="emit('close')" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { NavBar } from 'vant'
  import CreateVue from '../_Create.vue'
  import AvatarsPro from '@/pages/room/components/_AvatarsPro.vue'
  import { type RoomInterface } from 'src/composables/useRoom'
  import utils from '@/utils'

  const props = withDefaults(
    defineProps<{
      room: RoomInterface
    }>(),
    {}
  )

  const emit = defineEmits<{
    close: []
  }>()

  const deleteRoom = () => {
    props.room.deleteRoom(() => {
      utils.jumpTo('/room/list?type=CHAT')
    })
  }
</script>

<style scoped lang="less">
  @import '@/styles/variables.less';

  .chat-more-info {
    display: flex;
    flex-direction: column;
    height: 100%;
    .more-room-info {
      background-color: @bg-color;
      .create-wrapper {
        height: calc(100% - 130px);
      }
    }
    .group-avatar-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px 0 10px;
    }
    .button-delete {
      color: @text-red;
      font-size: 13px;
    }
  }
</style>
