<script setup lang="ts">
import UserList from '@/components/UserList.vue'
import { clearUserVisitHistory } from '@/service/api'
import type { EnhancedUser } from '@/service/userEnhanced'
import { getEnhancedUserHistory } from '@/service/userEnhanced'
import { showFailToast, showSuccessToast } from 'vant'
import { onMounted, ref } from 'vue'

const userHistoryList = ref<EnhancedUser[]>([])
const isLoading = ref(true)
const isError = ref(false)
const currentPage = ref(1)
const pageSize = ref(30)
const hasMore = ref(false)
const isLoadingMore = ref(false)
const refreshing = ref(false)

defineExpose({ loadHistory, clearHistory, loadMoreData })

async function loadHistory() {
  try {
    isLoading.value = true
    isError.value = false
    currentPage.value = 1

    const result = await getEnhancedUserHistory({
      page: currentPage.value,
      pageSize: pageSize.value,
    })

    userHistoryList.value = result.list

    hasMore.value = result.hasMore || false
  } catch (error) {
    isError.value = true
    showFailToast({
      message: '获取用户历史失败',
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

    const result = await getEnhancedUserHistory({
      page: currentPage.value,
      pageSize: pageSize.value,
    })

    userHistoryList.value = [...userHistoryList.value, ...result.list]
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

function updateRefreshing(value: boolean) {
  refreshing.value = value
}

async function clearHistory() {
  try {
    const result = await clearUserVisitHistory()
    console.log(result)
    if (result.success) {
      userHistoryList.value = []
      currentPage.value = 1
      hasMore.value = false

      showSuccessToast({
        message: '已清空用户浏览历史',
        duration: 2000,
      })
    } else {
      showFailToast({
        message: '清空历史记录失败',
        duration: 2000,
      })
    }
  } catch (error) {
    showFailToast({
      message: '清空历史记录失败',
      duration: 2000,
    })
  }
}

onMounted(() => {
  loadHistory()
})
</script>

<template>
  <UserList
    v-model:userList="userHistoryList"
    :loading="isLoading"
    :error="isError"
    emptyText="暂无浏览用户历史"
    :showRecordsHint="true"
    recordsHintText="最多显示近30天记录"
    :hasMore="hasMore"
    :loadingMore="isLoadingMore"
    :refreshing="refreshing"
    @update:refreshing="updateRefreshing"
    @refresh="loadHistory"
    @load-more="loadMoreData"
  />
</template>
