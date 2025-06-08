<script setup lang="ts">
import UserList from '@/components/UserList.vue'
import type { EnhancedUser } from '@/service/userEnhanced'
import { getEnhancedFollowerList } from '@/service/userEnhanced'
import { showFailToast } from 'vant'
import { onMounted, ref } from 'vue'

const props = defineProps<{
  userId: string
}>()

const followerList = ref<EnhancedUser[]>([])
const isLoading = ref(true)
const isError = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const hasMore = ref(false)
const isLoadingMore = ref(false)
const refreshing = ref(false)

defineExpose({ loadFollowerList, clearList, loadMoreData })

async function loadFollowerList() {
  try {
    isLoading.value = true
    isError.value = false
    currentPage.value = 1

    const result = await getEnhancedFollowerList(props.userId, {
      page: currentPage.value,
      pageSize: pageSize.value,
    })

    followerList.value = result.list
    hasMore.value = result.hasMore || false
  } catch (error) {
    isError.value = true
    showFailToast({
      message: '获取粉丝列表失败',
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

    const result = await getEnhancedFollowerList(props.userId, {
      page: currentPage.value,
      pageSize: pageSize.value,
    })

    followerList.value = [...followerList.value, ...result.list]
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
  followerList.value = []
  currentPage.value = 1
  hasMore.value = false
}

function updateRefreshing(value: boolean) {
  refreshing.value = value
}

onMounted(() => {
  loadFollowerList()
})
</script>

<template>
  <UserList
    v-model:userList="followerList"
    :loading="isLoading"
    :error="isError"
    emptyText="暂无粉丝"
    :loadingMore="isLoadingMore"
    :hasMore="hasMore"
    :refreshing="refreshing"
    @update:refreshing="updateRefreshing"
    @refresh="loadFollowerList"
    @load-more="loadMoreData"
  />
</template>

<style lang="less" scoped></style>
