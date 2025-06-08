<template>
  <div class="user-list-wrapper">
    <NavBar
      safe-area-inset-top
      placeholder
      class="nav-bar"
      :title="isBatchKick ? '移出本聊天室' : `${room.typeText?.value}成员(${room.usersTotal.value})`"
      left-arrow
      @click-left="emit('close')"
    />
    <div class="search-users"><van-field v-model="keyword" left-icon="search" placeholder="搜寻互关的好友" /></div>

    <List
      class="user-list"
      :loading="isLoading"
      :finished="isFinished"
      finished-text="没有更多了"
      @load="initData"
      v-if="isBatchKick"
    >
      <van-checkbox-group v-model="checked" :max="4">
        <van-checkbox
          v-for="(item, index) in userList"
          :name="item.userId"
          :key="index"
          v-show="!room?.checkIfSelf(item.userId)"
        >
          <div class="user-big-item">
            <UserItem :item="room.usersDictionary?.value[item.userId] || item" :room="room" />
            <template v-if="!room.checkIfSelf(item.userId) && !room.isAnonymous.value">
              <UserRelation :room="room" :userId="item.userId" />
            </template>
          </div>
        </van-checkbox>
      </van-checkbox-group>
    </List>
    <List
      class="user-list"
      :loading="isLoading"
      :finished="isFinished"
      finished-text="没有更多了"
      @load="initData"
      v-else
    >
      <div class="user-big-item" v-for="(item, index) in userList" :key="index">
        <UserItem :item="room.usersDictionary?.value[item.userId] || item" :room="room" />
        <Button
          v-if="room.isVoice.value && room.isOwner.value && !room.checkIfSelf(item.userId)"
          class="danger-button"
          size="small"
          type="danger"
          @click="room.kickOut([item.userId])"
          round
        >
          踢出
        </Button>
        <div v-else-if="!room.checkIfSelf(item.userId) && !room.isAnonymous.value">
          <UserRelation :room="room" :userId="item.userId" />
        </div>
      </div>
    </List>
    <div class="bottom-buttons" v-if="!room.isAnonymous.value">
      <Button v-if="isBatchKick" block type="success" class="button-invite" @click="handleBatchKick">移出聊天室</Button>
      <Button v-else block type="success" class="button-invite" @click="emit('changeScene', 'invite')">邀请好友</Button>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
  import {
    NavBar,
    Button,
    List,
    CheckboxGroup as VanCheckboxGroup,
    Checkbox as VanCheckbox,
    showToast,
    Field as VanField,
  } from 'vant'
  import UserItem from './_UserItem.vue'
  import UserRelation from './_UserRelation.vue'
  import { type RoomInterface } from 'src/composables/useRoom'
  import { useFetchListData, type UseFetchListDataInterface } from 'src/composables/useFetchListData'
  import service from '@/service'

  const props = withDefaults(
    defineProps<{
      room: RoomInterface
      isBatchKick?: boolean
    }>(),
    {}
  )

  const emit = defineEmits<{
    close: []
    changeScene: [scene: 'invite']
  }>()

  const timer = ref<any>(null)
  const checked = ref<string[]>([])
  const keyword = ref<string>('')
  const { fetchList, listData: userList, isLoading, isFinished }: UseFetchListDataInterface = useFetchListData()

  watch(
    () => keyword.value,
    () => {
      timer.value && clearTimeout(timer.value)
      timer.value = setTimeout(() => initData(true), 300)
    }
  )

  const initData = async (isNew?: boolean) => {
    const newData = await fetchList({
      fetchFn: service.room.getRoomUser,
      fetchParams: {
        roomId: props.room.id.value,
        nickname: keyword.value ?? '',
      },
      isNew,
    })
    props.room.addUsersDictionary(newData.map((item: { userId: string }) => item.userId))
  }

  const handleUserList = (userId: string, type: 'remove' | 'add') => {
    if (!userId) return
    if (type === 'remove') {
      userList.value = (userList.value ?? []).filter(item => item.userId !== userId)
    } else {
      userList.value = [...(userList.value ?? []), { userId }]
    }
  }

  const handleBatchKick = () => {
    if (!checked.value.length) {
      showToast('请先选择要移出的用户')
      return
    }
    props.room.kickOut(checked.value)
  }

  onMounted(() => {
    props.room.install('handleUserList', handleUserList)
  })

  onBeforeUnmount(() => {
    props.room.uninstall('handleUserList')
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
      .user-big-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px;
        border-bottom: 1px solid @border-color;
        .danger-button {
          // height: 24px;
          font-size: 16px;
          background-color: @text-red;
          border: none;
          min-width: 60px;
        }
      }
      :deep(.van-checkbox__label) {
        width: 100%;
      }
    }
    .bottom-buttons {
      width: 100%;
      padding: 8px;
      .button-invite {
        :deep(.van-button__text) {
          font-size: 18px;
          font-weight: 600;
        }
      }
    }
    .search-users {
      padding: 8px 16px;
      :deep(.van-field) {
        background-color: @bg-grey;
        border-radius: 20px;
        padding: 4px 16px;
      }
    }
  }
</style>
