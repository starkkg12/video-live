<template>
  <div class="user-list-wrapper">
    <List
      class="user-list"
      :loading="isLoading"
      :finished="isFinished"
      finished-text="没有更多了2"
    >
      <div class="user-item" v-for="(item, index) in userList" :key="index">
        <div class="user">
          <span class="user-index">{{ (index+1) }}</span>
          <AvatarsPro
            :room="room"
            :userId="item.sub"
            @click="showUserInfo(item.sub, item.isAnonymous)"
            size="40px"
            border-color="#aeaeb1"
            :src="item.userAvatar"
            v-if="item.sub !== 'system'"
          />
        </div>
        <div class="name">{{ item.username }}</div>
      </div>
      <div class="no-more" v-if="userList.length < 10 && room.anonymousCount.value !== 0">
        还有{{ room.anonymousCount }}位匿名用户在观看
      </div>
    </List>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue'
  import { List } from 'vant'
  import { type LiveRoomInterface } from '@/composables/useLiveRoom'
  import AvatarsPro from '@/pages/room/components/_AvatarsPro.vue'
  import { useFetchListData, type UseFetchListDataInterface } from 'src/composables/useFetchListData'
  import { useCurrentUser } from '@/composables/useCurrentUser'

  const props = withDefaults(
    defineProps<{
      room: LiveRoomInterface
    }>(),
    {}
  )
  const emit = defineEmits(['onFollowPopup'])
  const { isLoading, isFinished }: UseFetchListDataInterface = useFetchListData()
  const userList = ref<any>([])
  const myObject = ref<any>(null)
  const myIndex = ref<number>(0)
  const { myId } = useCurrentUser()
  const showUserInfo = (userId: string, isAnonymous: boolean) => {
    if (isAnonymous) return
    emit('onFollowPopup', userId)
  }
  onMounted(() => {
    userList.value = props.room.userList.value
    const idx = userList.value.findIndex((item: any) => item.sub === myId)
    if (idx !== -1) {
      myIndex.value = idx + 1
      myObject.value = userList.value[idx]
    }
  })
  onBeforeUnmount(() => {
    myIndex.value = 0
    myObject.value = null
    userList.value = []
  })
</script>

<style scoped lang="less">
  @import '@/styles/variables.less';

  .user-list-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    .user-list {
      overflow-y: auto;
      overflow-x: hidden;
      padding: 8px;
      height: 100%;
      min-height: 30vh;
      max-height: 40vh;
      .user-item {
        display: flex;
        align-items: center;
        height: 60px;
        
      }
    
    }
  }
  .user {
    display: flex;
    align-items: center;
    justify-items: center;
  }
  .user-index {
    width: 40px;
    height: 40px;
    border-radius: 0 0 0 0;
    text-align: center;
    line-height: 40px;
    font-weight: 700;
    font-size: 20px;
    color: #434343;
  }
  .user-item .name {
    font-weight: 500;
    font-size: 13px;
    color: #323333;
    padding: 0 12px;
    max-width: calc(100vw - 5.12rem);
  }
  .no-more {
    height: 40px;
    font-weight: 500;
    font-size: 16px;
    color: #666;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
