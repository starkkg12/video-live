<script setup lang="ts">
import { NavBar, Tab, Tabs } from 'vant'
import { computed, onMounted, ref } from 'vue'
import FollowerList from './_FollowerList.vue'
import FollowingList from './_FollowingList.vue'

type ListComponent = {
  loadFollowerList?: () => void
  loadFollowingList?: () => void
  loadMoreData?: () => void
  clearList: () => void
}

const props = defineProps<{
  userId: string | undefined
}>()

// 处理undefined的userId
const safeUserId = computed(() => {
  if (!props.userId) {
    console.warn('userId is undefined, using empty string')
    return ''
  }
  return props.userId
})

// 从URL中获取tab参数
const tab = computed(() => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('tab') || 'following'
  }
  return 'following'
})

// 标签页相关
const active = ref(tab.value)
const tabs = [
  { key: 'following', label: '关注' },
  { key: 'followers', label: '粉丝' },
]

const followingListRef = ref<ListComponent | null>(null)
const followerListRef = ref<ListComponent | null>(null)

function onTabChange(name: string) {
  active.value = name

  // 更新URL参数但不刷新页面
  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href)
    url.searchParams.set('tab', name)
    window.history.replaceState({}, '', url.toString())
  }
}

function onBack() {
  if (typeof window !== 'undefined') {
    window.history.back()
  }
}

onMounted(() => {})
</script>

<template>
  <div class="wrapper">
    <div class="nav-wrap">
      <NavBar
        class="nav-bar"
        title="关注与粉丝"
        left-text=""
        left-arrow
        @click-left="onBack()"
        safe-area-inset-top
      >
      </NavBar>
    </div>

    <div class="content">
      <Tabs
        v-model:active="active"
        class="full-line-tabs"
        type="line"
        @change="onTabChange"
        safe-area-inset-top
      >
        <Tab v-for="item in tabs" :key="item.key" :name="item.key">
          <template #title>
            {{ item.label }}
          </template>

          <!-- 关注列表内容 -->
          <FollowingList
            v-if="item.key === 'following'"
            ref="followingListRef"
            :userId="safeUserId"
          />

          <!-- 粉丝列表内容 -->
          <FollowerList
            v-if="item.key === 'followers'"
            ref="followerListRef"
            :userId="safeUserId"
          />
        </Tab>
      </Tabs>
    </div>
  </div>
</template>

<style lang="less" scoped>
.wrapper {
  background-color: var(--van-background-color);
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: visible;
}

.clear-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
  font-size: 14px;
  color: var(--van-text-color);
}

.content {
  padding-top: 10px;
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.full-line-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
  margin-top: env(safe-area-inset-top);
}

.full-line-tabs :deep(.van-tabs__content) {
  flex: 1;
  overflow: hidden;
}

.full-line-tabs :deep(.van-tab__panel) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.full-line-tabs :deep(.van-tabs__nav) {
  background: var(--van-background);
}

.full-line-tabs :deep(.van-tabs__line) {
  width: calc(50% - 8px);
  background-color: var(--van-primary-color, rgb(238, 10, 36));
  transform: translateX(58px) translateX(-50%);
  transition-duration: 0.3s;
  position: absolute;
  bottom: 15px;
}
</style>
