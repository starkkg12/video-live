<template>
  <div class="invite-users-wrapper">
    <NavBar safe-area-inset-top placeholder class="nav-bar" title="选择互关好友" left-arrow @click-left="closePopup" />
    <div class="search-users"><van-field v-model="keyword" left-icon="search" placeholder="搜寻互关的好友" /></div>
    <div class="user-list-all">
      <Empty v-show="!isLoading && !myFriends?.length" description="没有数据" />
      <List :loading="isLoading" :finished="isFinished" @load="initData">
        <van-checkbox-group v-model="checked" :max="MAX_JOIN_MIC_NUM - room?.upUserList.value.length">
          <van-checkbox
            :name="item.userId"
            v-for="(item, index) in myFriends"
            :key="index"
            :disabled="room?.checkIfExists(item.userId)"
          >
            <div class="user-big-item">
              <UserItem :item="room.usersDictionary?.value[item.userId] || item" :room="room" />
              <template v-if="!room.checkIfSelf(item.userId)">
                <div v-if="room?.checkIfExists(item.userId)" class="is-exists">已在房间</div>
                <UserRelation v-else :room="room" :userId="item.userId" relationText="互相关注" />
              </template>
            </div>
          </van-checkbox>
        </van-checkbox-group>
      </List>
      <!-- </Empty> -->
    </div>
    <div class="bottom-buttons">
      <Button block type="success" class="button-invite" @click="handleInviteUsers">
        邀请{{ isInviteUpSpeak ? '连麦' : '加入' }}
      </Button>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, watch } from 'vue'
  import {
    Button,
    CheckboxGroup as VanCheckboxGroup,
    Checkbox as VanCheckbox,
    NavBar,
    List,
    showToast,
    Field as VanField,
    Empty,
  } from 'vant'
  import utils from '@/utils'
  import service from '@/service'
  import { type RoomInterface } from 'src/composables/useRoom'
  import UserItem from './_UserItem.vue'
  import UserRelation from './_UserRelation.vue'
  import { useFetchListData, type UseFetchListDataInterface } from 'src/composables/useFetchListData'

  const MAX_JOIN_MIC_NUM = 4
  const props = withDefaults(
    defineProps<{
      room: RoomInterface
      isInviteUpSpeak?: boolean
    }>(),
    {
      isInviteUpSpeak: false,
    }
  )

  const SIZE = 20

  const emit = defineEmits<{ close: [] }>()
  const checked = ref([])
  const timer = ref<any>(null)
  const keyword = ref<string>('')

  const { fetchList, listData: myFriends, isLoading, isFinished }: UseFetchListDataInterface = useFetchListData()

  const closePopup = () => {
    emit('close')
  }

  const handleInviteUsers = () => {
    if (!checked.value.length) {
      showToast('请先选择好友')
      return
    }
    utils
      .chain()
      .fetch(
        service.room?.invite,
        {
          invitedUserIds: checked.value,
          roomId: props.room?.id.value,
          type: props.room?.type.value,
          title: props.room?.info.value.title,
          userNum: props.room?.usersTotal.value,
          upSpeak: props.isInviteUpSpeak ? 1 : 0,
        },
        '已经发送加入房间邀请'
      )
      .next(closePopup)
  }

  watch(
    () => keyword.value,
    () => {
      timer.value && clearTimeout(timer.value)
      timer.value = setTimeout(() => initData(true), 300)
    }
  )

  const initData = async (isNew?: boolean) => {
    const newData = await fetchList({
      fetchFn: service.user.getMyRelationship,
      fetchParams: {
        nickname: keyword.value ?? '',
        // userId: keyword.value ?? '',
      },
      size: SIZE,
      isNew,
    })
    props.room.addUsersDictionary(newData.map((item: { userId: string }) => item.userId))
  }

  // onMounted(() => {
  //   initData(true)
  // })
</script>

<style scoped lang="less">
  @import '@/styles/variables.less';

  .shadow-style {
    background-color: rgba(0, 0, 0, 0.3);
    border: 1px solid #a4a4a4;
  }
  .text-shadow {
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  }
  .invite-users-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    .user-list-all {
      overflow-y: auto;
      overflow-x: hidden;
      padding: 8px 18px;
      height: 100%;
      .user-big-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px;
        font-size: 12px;
        color: #a4a4a4;
        border-bottom: 1px solid #f1f1f1;
        .user-info {
          display: flex;
          align-items: center;
          gap: 8px;
          .owner-flag {
            .shadow-style;
            color: #fff;
            padding: 0 4px;
            border-radius: 4px;
          }
        }
        .danger-button {
          height: 24px;
        }
        .is-exists {
          font-size: 14px;
          color: @text-green;
        }
      }
      :deep(.van-checkbox__label) {
        width: 100%;
      }
      .van-checkbox.van-checkbox--disabled {
        opacity: 0.5;
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
