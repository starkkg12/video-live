<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { NavBar, showFailToast, Tab, Tabs, Icon, showDialog } from 'vant'
import VideoHistory from './_VideoHistory.vue'
import LiveHistory from './_LiveHistory.vue'
import UserHistory from './_UserHistory.vue'

const tab = computed(() => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('tab') || 'videos'
  }
  return 'videos'
})

type HistoryComponent = {
  loadHistory: () => void
  clearHistory: () => void
}

// 标签页相关
const active = ref(tab.value)
const tabs = [
  { key: 'videos', label: '视频' },
  { key: 'lives', label: '直播' },
  { key: 'users', label: '用户' },
]

const videoHistoryRef = ref<HistoryComponent | null>(null)
const liveHistoryRef = ref<HistoryComponent | null>(null)
const userHistoryRef = ref<HistoryComponent | null>(null)

function onTabChange(name: string) {
  active.value = name
}

function onBack() {
  window.history.back()
}

async function clearHistory() {
  try {
    const action = await showDialog({
      title: '确认删除',
      message: `确定要删除全部${active.value === 'videos' ? '视频' : active.value === 'lives' ? '直播' : '用户'}历史记录吗？`,
      showCancelButton: true,
      theme: 'default',
      confirmButtonColor: '#ee0a24',
    })

    if (action === 'confirm') {
      const refMap = {
        videos: videoHistoryRef,
        lives: liveHistoryRef,
        users: userHistoryRef,
      }

      const historyRef = refMap[active.value as keyof typeof refMap]

      if (historyRef?.value?.clearHistory) {
        historyRef.value.clearHistory()
      } else {
        console.warn(`未找到活动标签(${active.value})对应的历史组件`)
        showFailToast({
          message: '清空历史记录失败',
          duration: 2000,
        })
      }
    }
  } catch (error) {
    console.error('清空历史记录失败:', error)
    showFailToast({
      message: '清空历史记录失败',
      duration: 2000,
    })
  }
}

onMounted(() => {})
</script>

<template>
  <div class="wrapper">
    <NavBar
      class="nav-bar"
      title="观看历史"
      left-text=""
      left-arrow
      @click-left="onBack()"
      safe-area-inset-top
    >
      <template #right>
        <div class="delete-btn" @click="clearHistory">
          <Icon name="delete-o" size="18" />
        </div>
      </template>
    </NavBar>

    <div class="content">
      <Tabs v-model:active="active" class="full-line-tabs" type="line" @change="onTabChange">
        <Tab v-for="item in tabs" :key="item.key" :name="item.key">
          <template #title>
            {{ item.label }}
          </template>
        </Tab>
      </Tabs>

      <VideoHistory v-if="active === 'videos'" ref="videoHistoryRef" />
      <LiveHistory v-if="active === 'lives'" ref="liveHistoryRef" />
      <UserHistory v-if="active === 'users'" ref="userHistoryRef" />
    </div>
  </div>
</template>

<style lang="less" scoped>
.wrapper {
  background-color: var(--van-background-color);
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  left: 50%;
  transform: translateX(-50%);

  @media (max-width: 768px) {
    width: 100%;
  }

  @media (min-width: 768px) {
    max-width: 480px;
  }
}

.delete-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
  font-size: 14px;
  color: var(--van-text-color);
}

.content {
  padding-top: 10px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.full-line-tabs :deep(.van-tabs__wrap) {
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--van-background);
}

.full-line-tabs :deep(.van-tabs__nav) {
  background: var(--van-background);
}

.full-line-tabs :deep(.van-tabs__line) {
  width: calc(33.33% - 8px);
  background-color: var(--van-primary-color, rgb(238, 10, 36));
  transform: translateX(58px) translateX(-50%);
  transition-duration: 0.3s;
  position: absolute;
  bottom: 15px;
}

.full-line-tabs :deep(.van-tabs__content) {
  flex: 1;
  overflow: hidden;
  height: 100%;
}
</style>
