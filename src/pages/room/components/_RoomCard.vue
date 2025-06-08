<template>
  <div class="room-card" @click="utils.jumpTo(url)" v-if="roomInfo">
    <div class="room-series">
      <span class="series-name">{{ seriesName }}</span>
      <span class="talking">||| 热聊中</span>
    </div>
    <h3 class="room-tite">{{ roomInfo?.title }}</h3>
    <div class="room-note">{{ roomInfo?.note }}</div>
    <div class="room-users">
      <div class="room-avatars">
        <AvatarsPro :user-id="upUsersList[0]" size="40px" :room="room" :cacheData="cacheData" borderColor="#f2f2f2" />
        <AvatarsPro
          v-for="(item, index) in upUsersList.slice(1)"
          :key="index"
          class="other-avatar"
          :user-id="item"
          size="24px"
          :room="room"
          :cacheData="cacheData"
          borderColor="#f2f2f2"
        />
      </div>
      <div class="room-users-total">
        <van-icon name="friends-o" size="18px" />
        {{ roomInfo?.userNum }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, onMounted, ref, type Ref, watch } from 'vue'
  import utils from '@/utils'
  import { Icon as VanIcon } from 'vant'
  import { type RoomInterface } from '../constants'
  import AvatarsPro from '@/pages/room/components/_AvatarsPro.vue'
  import service from '@/service'

  const props = withDefaults(
    defineProps<{
      data?: RoomInterface
      room?: any
      cacheData?: any
      roomId?: string
    }>(),
    {}
  )

  const url = ref<string>(`/voiceRoom/${props.data?.roomId}`)
  const roomInfo = ref<RoomInterface>()

  const upUsersList: Ref<any[]> = computed(() => {
    return (roomInfo.value?.onlineUserList ?? []).slice(0, 4)
  })

  const seriesName = computed(() => {
    if (!roomInfo.value?.gameSerialNo) return
    const seriesByGameTypeDictionary =
      props.room?.seriesByGameTypeDictionary.value || props.cacheData?.seriesByGameTypeDictionary.value || {}
    const series = (seriesByGameTypeDictionary[roomInfo.value?.gameType] ?? []).find(
      (item: { seriesCode: string }) => item.seriesCode === roomInfo.value?.gameSerialNo
    )
    return series?.seriesName ?? ''
  })

  const getVoiceRoomInfo = async (roomId: string) => {
    const response = await service.room.getVoiceRoomInfo({ roomId })
    if (response.data.errCode === '0') {
      roomInfo.value = response.data.data
    } else {
      roomInfo.value = undefined
    }
  }

  watch(roomInfo, () => {
    if (roomInfo.value?.gameType) {
      const addSeriesByGameTypeDictionary: any =
        props.room?.addSeriesByGameTypeDictionary || props.cacheData?.addSeriesByGameTypeDictionary

      addSeriesByGameTypeDictionary && addSeriesByGameTypeDictionary(roomInfo.value?.gameType)
    }
  })

  watch(
    () => props.roomId,
    async () => {
      if (props.roomId) {
        getVoiceRoomInfo(props.roomId)
      }
    }
  )

  onMounted(async () => {
    if (props.roomId) {
      getVoiceRoomInfo(props.roomId)
    } else if (props.data?.gameType) {
      roomInfo.value = props.data
    }
  })
</script>

<style scoped lang="less">
  @import '@/styles/variables.less';

  .room-card {
    background-color: #fefbee;
    padding: 8px 12px;
    color: #333;
    text-shadow: none;
    border-radius: 8px;
    box-shadow: 0px 0px 6px 0px #0000001a;
    .room-series {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .series-name {
        font-size: 15px;
        color: #3eca61;
        font-weight: 400;
        .text-overflow;
      }
      .talking {
        background-color: #3eca61;
        color: #fff;
        padding: 0 8px;
        border-radius: 20px;
        line-height: 24px;
        height: 24px;
        font-size: 12px;
        white-space: nowrap;
      }
    }
    .room-tite {
      font-size: 18px;
      font-weight: 900;
      line-height: 20px;
      margin: 8px 0;
      height: 40px;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      line-clamp: 2;
      -webkit-line-clamp: 2;
    }
    .room-note {
      font-size: 14px;
      line-height: 20px;
      color: #7f7f7f;
    }
    .room-users {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 8px 0 0;
      border-radius: 20px;
      height: 28px;
      background-color: #fff;
      margin: 12px 0 8px 4px;
      .room-avatars {
        display: flex;
        justify-content: space-between;
        margin-left: -4px;
        .other-avatar {
          margin-top: 8px;
          margin-left: -2px;
          border: 1px solid #fff;
        }
      }
    }
    .room-users-total {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #7f7f7f;
    }
  }
</style>
