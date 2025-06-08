<script setup lang="ts">
  import { computed } from 'vue'
  import { List } from 'vant'
  import StateManager from '@/components/StateManager.vue'
  import utils from '@/utils'
  import service from '@/service'
  import RoomCard from './_RoomCard.vue'
  import ChatRoomCard from './_ChatRoomCard.vue'
  import { useFetchListData, type UseFetchListDataInterface } from 'src/composables/useFetchListData'
  import { type RoomInterface } from '../constants'

  const props = withDefaults(
    defineProps<{
      type: 'VOICE' | 'CHAT'
      userId?: string
      cacheData?: any
      chatNow?: boolean
      title?: string
    }>(),
    {
      type: 'VOICE',
    }
  )

  const {
    fetchList,
    listData: roomList,
    isLoading,
    isFinished,
    isError,
  }: UseFetchListDataInterface<RoomInterface> = useFetchListData()

  const isVoice = computed(() => props.type === 'VOICE')

  async function getRoomList(isNew?: boolean) {
    const manageSiteId = await utils.getManageSiteId()
    await fetchList({
      fetchFn: service.room.getRoomList,
      fetchParams: {
        type: props.type,
        userId: props.userId ?? '',
        sortRule: 1,
        manageSetId: manageSiteId,
      },
      isNew,
    })
  }
</script>

<template>
  <div class="list-by-type" v-if="!userId || (!isLoading && roomList?.length !== 0)">
    <div class="room-title" v-if="title">{{ title }}</div>
    <StateManager
      :error="isError"
      @refresh="
        () => {
          getRoomList(true)
        }
      "
    >
      <List
        class="room-list"
        :loading="isLoading"
        @load="getRoomList"
        :finished-text="userId ? '' : '没有更多了...'"
        :finished="isFinished"
      >
        <div class="room-list-wrapper" :class="{ 'is-voice': isVoice }">
          <template v-if="isVoice">
            <RoomCard :data="item" v-for="(item, index) in roomList" :key="index" :cacheData="cacheData" />
          </template>
          <template v-else>
            <ChatRoomCard
              :data="item"
              v-for="(item, index) in roomList"
              :key="index"
              :cacheData="cacheData"
              :chatNow="chatNow"
            />
          </template>
        </div>
      </List>
    </StateManager>
  </div>
</template>

<style scoped lang="less">
  @import '@/styles/variables.less';

  .list-by-type {
    :deep(.van-nav-bar--fixed) {
      max-width: 600px;
      left: auto;
    }
    .room-title {
      padding: 16px 8px;
      font-size: 18px;
      font-weight: 600;
      &:not(:first-child) {
        margin-top: 16px;
        border-top: 1px solid @border-color;
      }
    }
    .room-list {
      padding: 8px;
      .room-list-wrapper {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        &.is-voice {
          column-count: 2; /* 设置列数为 2 */
          column-gap: 8px; /* 列间距 */
          .room-card {
            width: calc(50% - 4px);
          }
        }
      }
    }
    .create-button {
      padding: 50px;
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 24px;
      :deep(.van-button__text) {
        font-size: 20px;
        font-weight: 900;
      }
    }
  }
</style>
