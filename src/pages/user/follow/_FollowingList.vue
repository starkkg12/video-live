<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { showFailToast } from 'vant'
import { getEnhancedFollowingList, type EnhancedUser } from '@/service/userEnhanced'
import UserList from '@/components/UserList.vue'

const props = defineProps<{
  userId: string
}>()

const followingList = ref<EnhancedUser[]>([])
const isLoading = ref(true)
const isError = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const hasMore = ref(false)
const isLoadingMore = ref(false)
const refreshing = ref(false)

defineExpose({ loadFollowingList, clearList, loadMoreData })

async function loadFollowingList() {
  try {
    isLoading.value = true
    isError.value = false
    currentPage.value = 1

    const result = await getEnhancedFollowingList(props.userId, {
      page: currentPage.value,
      pageSize: pageSize.value,
    })

    followingList.value = result.list

    hasMore.value = result.hasMore || false
  } catch (error) {
    isError.value = true
    showFailToast({
      message: '获取关注列表失败',
      duration: 2000,
    })
  } finally {
    isLoading.value = false
    refreshing.value = false
  }
}

async function loadMoreData() {
  if (!hasMore.value || isLoadingMore.value) return

  try {
    isLoadingMore.value = true
    currentPage.value++

    const result = await getEnhancedFollowingList(props.userId, {
      page: currentPage.value,
      pageSize: pageSize.value,
    })

    followingList.value = [...followingList.value, ...result.list]
    hasMore.value = result.hasMore || false
  } catch (error) {
    showFailToast({
      message: '加载更多数据失败',
      duration: 2000,
    })
  } finally {
    isLoadingMore.value = false
  }
}

function clearList() {
  followingList.value = []
  currentPage.value = 1
  hasMore.value = false
}

function updateRefreshing(value: boolean) {
  refreshing.value = value
}

onMounted(() => {
  loadFollowingList()
})
</script>

<template>
  <UserList
    v-model:userList="followingList"
    :loading="isLoading"
    :error="isError"
    emptyText="暂无关注的用户"
    :loadingMore="isLoadingMore"
    :hasMore="hasMore"
    :refreshing="refreshing"
    @update:refreshing="updateRefreshing"
    @refresh="loadFollowingList"
    @load-more="loadMoreData"
  />
</template>

<style lang="less" scoped></style>
