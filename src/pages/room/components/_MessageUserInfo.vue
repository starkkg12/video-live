<template>
  <div class="user-name">
    <div class="user-nickname" :class="{ ellipsis: displayName.length > 9 }">
      {{ displayName }}:
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject } from 'vue'
import { type LiveRoomInterface } from '@/composables/useLiveRoom'

const room: LiveRoomInterface | undefined = inject('liveRoom')

const props = withDefaults(
  defineProps<{
    item?: any
  }>(),
  {
    item: null,
  }
)

const displayName = computed(() => {
  return room?.checkIfSelf(props.item.sender.sub)
    ? '我'
    : room?.checkIfOwner(props.item.sender.sub)
      ? '房主'
      : props.item.sender.username || ''
})
</script>

<style scoped lang="less">
@text-primary: #434343;
@text-secondary: #656565;
@text-grey: #e0e0e0;
@bg-green: #34c759;
.user-name {
  display: inline;
  color: #cbd4ff;
  font-size: 13px;
  .owner-flag {
    background-color: @bg-green;
    font-size: 12px;
    color: #fff;
    padding: 0 6px;
    border-radius: 10px;
    height: 18px;
    line-height: 18px;
  }
  .user-nickname {
    overflow: hidden;
    padding-right: 2px;
    min-width: 14px;
    font-size: 14px;
    line-height: 16px;
    &.ellipsis {
      text-overflow: ellipsis;
    }
  }
  .vip-flag {
    min-width: 50px;
    margin-right: 4px;
  }
}
.chat-user-name {
  white-space: nowrap;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: @text-grey;
  font-size: 13px;
  .chat-level {
    color: @bg-green;
    i {
      font-size: 10px;
      font-style: normal;
      font-weight: 600;
    }
    span {
      font-size: 14px;
      font-weight: 900;
    }
  }
  .chat-user-nickname {
    color: @text-secondary;
    &.ellipsis {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%;
    }
  }
}
</style>
