<template>
  <div v-if="!avatarUserIds?.length" class="avatars-pro" :style="`width: ${size};height: ${size};`">
    <AsyncImage
      class="user-avatar"
      :src="utils.getImageUrl(src || usersDictionary[userId]?.avatar, 'avatar')"
      round
      alt=""
      :class="{ 'has-border': hasBorder }"
      :style="{
        width: size,
        height: size,
        'min-width': size,
        'min-height': size,
        'border-color': borderColor,
      }"
    />
    <template v-if="hasFlag">
      <span class="flag" v-if="room?.checkIfOwner(userId)" :style="{ 'font-size': flagSize }"
        >房主</span
      >
      <span
        class="flag self"
        v-else-if="room?.checkIfSelf(userId)"
        :style="{ 'font-size': flagSize }"
        >我</span
      >
    </template>
    <!-- <div class="mic-status" v-if="hasMic && room?.checkIfUp(userId)">
      <van-image v-if="room?.checkIfOn(userId)" :src="mic.src" :width="micSize" alt="" />
      <van-image v-else :src="micBan.src" :width="micSize" alt="" />
    </div> -->
  </div>
  <div
    v-else
    class="group-avatar"
    :class="`user-${avatarUserIds.length}${hasBorder ? ' has-border' : ''}`"
    :style="`width: ${size};height: ${size};`"
  >
    <AsyncImage
      class="group-avatar-item"
      v-for="(item, index) in avatarUserIds"
      :key="index"
      :src="utils.getImageUrl(usersDictionary[item]?.avatar, 'avatar')"
      isBg
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, inject } from 'vue'
import { Image as VanImage } from 'vant'
import utils from '@/utils'
import mic from '@/assets/icons/room/mic.svg'
import micBan from '@/assets/icons/room/mic_ban.svg'
import AsyncImage from '@/components/AsyncImage.vue'
import { type CacheDataInterface } from '@/composables/useCacheData'
type UserIds = string[] | { userId: string }[]

const cacheData: CacheDataInterface | undefined = inject('cacheData')

const props = withDefaults(
  defineProps<{
    room?: any
    cacheData?: any
    userId?: string
    size?: string
    hasFlag?: boolean
    flagSize?: string
    hasMic?: boolean
    micSize?: string
    hasBorder?: boolean
    borderColor?: string
    src?: string
    userIds?: UserIds
  }>(),
  {
    room: null,
    cacheData: null,
    userId: '',
    size: '40px',
    hasFlag: false,
    flagSize: '12px',
    hasMic: false,
    micSize: '18px',
    hasBorder: true,
    borderColor: '#aeaeb1',
    src: '',
  }
)
const addUsersDictionary: any = cacheData?.addUsersDictionary
const getUpTo4Users = (userIds: UserIds) => {
  if (!userIds?.length) return []
  const _ids = userIds.slice(0, 4).map(item => (typeof item === 'string' ? item : item.userId))
  return _ids
}
const avatarUserIds = computed(() => {
  if (!props.userIds) return []
  const ids = getUpTo4Users(props.userIds)
  addUsersDictionary && addUsersDictionary(ids)
  return ids
})
const usersDictionary = computed(() => {
  return cacheData?.usersDictionary.value || {}
})
onMounted(async () => {
  if (props.userId && addUsersDictionary && !props.src) {
    addUsersDictionary([props.userId])
  }
})
</script>

<style scoped lang="less">
@bg-green: #34c759;
@bg-yellow: #ff8f28;
.avatars-pro {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .user-avatar {
    :deep(img) {
      object-fit: contain;
    }
    &.has-border {
      border: 1px solid @bg-green;
      background-color: #fff;
    }
  }
  .flag {
    position: absolute;
    background-color: @bg-green;
    padding: 3px 8px;
    text-align: center;
    line-height: 1;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 900;
    bottom: -4px;
    min-width: 32px;
    color: #fff;
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
    &.self {
      background-color: @bg-yellow;
    }
  }
  .mic-status {
    position: absolute;
    left: -14px;
    top: -1px;
  }
}
.group-avatar {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  display: grid;
  place-items: center;
  &.has-border {
    border: 1px solid @bg-green;
  }
  .group-avatar-item {
    position: absolute;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    box-sizing: border-box;
  }
  &.user-1 {
    .group-avatar-item:nth-child(1) {
      width: 100%;
      height: 100%;
    }
  }
  &.user-2 {
    .group-avatar-item:nth-child(1),
    .group-avatar-item:nth-child(2) {
      width: 50%;
      height: 100%;
    }
    .group-avatar-item:nth-child(1) {
      left: 0;
      border-right: 1px solid white;
    }
    .group-avatar-item:nth-child(2) {
      right: 0;
    }
  }
  &.user-3 {
    .group-avatar-item:nth-child(1) {
      width: 50%;
      height: 100%;
      left: 0;
      border-right: 1px solid white;
    }
    .group-avatar-item:nth-child(2),
    .group-avatar-item:nth-child(3) {
      width: 50%;
      height: 50%;
      right: 0;
    }
    .group-avatar-item:nth-child(2) {
      top: 0;
      border-bottom: 1px solid white;
    }
    .group-avatar-item:nth-child(3) {
      bottom: 0;
    }
  }
  &.user-4 {
    .group-avatar-item:nth-child(1),
    .group-avatar-item:nth-child(2),
    .group-avatar-item:nth-child(3),
    .group-avatar-item:nth-child(4) {
      width: 50%;
      height: 50%;
    }
    .group-avatar-item:nth-child(1) {
      top: 0;
      left: 0;
      border-right: 1px solid white;
      border-bottom: 1px solid white;
    }
    .group-avatar-item:nth-child(2) {
      top: 0;
      right: 0;
      border-bottom: 1px solid white;
    }
    .group-avatar-item:nth-child(3) {
      bottom: 0;
      left: 0;
      border-right: 1px solid white;
    }
    .group-avatar-item:nth-child(4) {
      bottom: 0;
      right: 0;
    }
  }
}
</style>
