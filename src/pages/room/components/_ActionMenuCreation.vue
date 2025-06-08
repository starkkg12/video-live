<template>
  <NavBar safe-area-inset-top placeholder class="nav-bar" title="选择创作">
    <template #right>
      <van-icon name="cross" size="24" color="#434343" @click="emit('close')" />
    </template>
  </NavBar>
  <div class="action-menu-creation height-without-nav-bar">
    <div class="creation-list-wrapper">
      <List v-model:loading="isLoading" :finished="isFinished" finished-text="没有更多了">
        <div class="creation-list">
          <SelectedItemWrapper
            v-for="(item, index) in listData"
            :key="index"
            :selectedIndex="getIndexInSelectedList(item.postId)"
            @click.prevent="handleSelect(item)"
          >
            <CreationCard :data="{ ...item, avatar: room.usersDictionary.value[item.postUserId]?.avatar }" />
          </SelectedItemWrapper>
        </div>
      </List>
    </div>
    <div class="buttons">
      <Button class="button-reset" type="default" @click="reset" block>重置</Button>
      <Button class="button-submit" type="success" @click="confirm" block>提交</Button>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, ref } from 'vue'
  import service from '@/service'
  import CreationCard from './_CreationCard.vue'
  import SelectedItemWrapper from '@/pages/room/components/_SelectedItemWrapper.vue'
  import { List, Button, NavBar, Icon as VanIcon } from 'vant'
  import { useFetchListData, type UseFetchListDataInterface } from 'src/composables/useFetchListData'
  import utils from '@/utils'

  const MAX_NUMBER = 6

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

  const selectedItems = ref<any[]>([])
  const { fetchList: fetchList, listData, isLoading, isFinished }: UseFetchListDataInterface = useFetchListData()

  const handleSelect = (item: any) => {
    const indexInSelectedList = getIndexInSelectedList(item.postId)
    if (indexInSelectedList > -1) {
      selectedItems.value.splice(indexInSelectedList, 1)
    } else if (selectedItems.value.length < MAX_NUMBER) {
      selectedItems.value.push(item)
    }
  }

  const reset = () => {
    selectedItems.value = []
  }

  const getIndexInSelectedList = (postId: string) => {
    const reslut = selectedItems.value.findIndex((item: any) => item.postId === postId)
    return reslut
  }

  const confirm = () => {
    if (!selectedItems.value.length) return
    handleSend([...selectedItems.value])
    selectedItems.value = []
    emit('close', 'all')
  }

  const handleSend = (items: any[]) => {
    const item = items.shift()
    if (!item) return
    const { title, nickname, postUserId, likeCount, attachments, forumId, postId } = item
    props.room.wsClient.value.sendText(
      JSON.stringify({
        title,
        forumId,
        postId,
        nickname,
        authorId: postUserId,
        likeCount,
        avatar: props.room.usersDictionary.value[postUserId]?.avatar,
        attachments,
      }),
      5
    )
    setTimeout(() => handleSend(items), 100)
  }

  const initData = async () => {
    const manageSiteId = await utils.getManageSiteId()
    await fetchList({
      fetchFn: service.kv().getFindPostAll,
      fetchParams: {
        manageSiteId,
      },
      isKv: true,
    })
    props.room.addUsersDictionary([
      ...new Set([...(listData?.value ?? []).map((data: { postUserId: string }) => data.postUserId)]),
    ])
  }

  onMounted(() => {
    initData()
  })
</script>

<style scoped lang="less">
  @text-green: #34c759;
  @button-default: #f2f2f2;

  .action-menu-creation {
    display: flex;
    flex-direction: column;
    height: 100%;
    .creation-list-wrapper {
      height: calc(100vh - 106px);
      overflow-y: auto;
      padding: 0 8px;
      .creation-list {
        column-count: 2; /* 设置列数为 2 */
        column-gap: 8px; /* 列间距 */
        .selected-item-wrapper {
          margin-bottom: 8px;
        }
      }
    }
    .buttons {
      display: flex;
      justify-content: space-between;
      width: 100%;
      padding: 8px;
      gap: 8px;
      .button-reset,
      .button-submit {
        border-radius: 8px;
      }
      .button-reset {
        background-color: @button-default;
        border: none;
      }
      :deep(.van-button__text) {
        font-size: 18px;
        font-weight: 600;
      }
    }
  }
</style>
