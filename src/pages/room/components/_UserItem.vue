<template>
  <div class="user-item">
    <AvatarsPro
      :user-id="item.userId"
      :room="room"
      has-flag
      @click.stop="room.custom.value?.showUserInfo(item.userId)"
    />
    <div class="user-nickname">{{ utils.getNickName(item.nickname, item.userId) }}</div>
    <VipLevel :vipLevel="item.vipLevel" />
  </div>
</template>

<script lang="ts" setup>
  import utils from '@/utils'
  import AvatarsPro from '@/pages/room/components/_AvatarsPro.vue'
  import VipLevel from '@/pages/room/components/_VipLevel.vue'
  const props = withDefaults(
    defineProps<{
      room: any
      item: any
    }>(),
    {
      room: null,
      item: null,
    }
  )
</script>

<style scoped lang="less">
  @text-primary: #434343;
  .user-item {
    display: flex;
    align-items: center;
    gap: 8px;
    .user-avatar {
      :deep(img) {
        object-fit: contain;
      }
    }
    .user-nickname {
      font-size: 16px;
      color: @text-primary;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: calc(min(100vw, 600px) - 160px);
    }
    .vip-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      .vip-level {
        margin-left: -16px;
        display: flex;
        margin-bottom: -1px;
      }
    }
  }
</style>
