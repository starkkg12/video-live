<script setup lang="ts">
import Login from '@/components/Login.vue'
import SideMenu from '@/components/Video/SideMenu.vue'
import Topic from '@/components/Video/Topic/Topic.vue'
import TopMenu from '@/components/Video/TopMenu.vue'
import VideoFollowing from '@/pages/video/_VideoFollowing.vue'
import Live from '@/pages/video/_Live.vue'
import VideoList from '@/components/Video/VideoRecommend.vue'
import SearchVue from './_Search.vue'

import { Popup } from 'vant'
import { onMounted, nextTick, ref, watch } from 'vue'
const sideMenuRef = ref<InstanceType<typeof SideMenu> | null>(null)
const showLoginModal = ref<boolean>(false)
const activeTab = ref<string>('recommend')
const params = ref<any>(new URLSearchParams(window.location.search))
const keyword = ref<string | null>(params.value.get('keyWord')) 
const isSearch = ref(location.search.includes('?keyWord'))
const videoViewShow = ref<boolean>(true)
const initialized = ref<boolean>(false)
const videoContainer = ref<HTMLElement | null>(null)
const videoSearchPageMuted = ref<boolean>(false)

const handleToggleSideMenu = () => {
  if (sideMenuRef.value) {
    sideMenuRef.value.toggleSideMenu()
  }
}
const setActiveTab = (tab: string) => {
  activeTab.value = tab
}
onMounted(() => {
  const update = () => {
    
    isSearch.value = location.search.includes('?keyWord')
    if (isSearch.value) {
      params.value = new URLSearchParams(window.location.search)
      keyword.value = params.value.get('keyWord')
    } 
    if(!initialized.value) {
      videoViewShow.value = !isSearch.value ? true : false
      initialized.value = true
      videoSearchPageMuted.value = true
    } else {
      videoViewShow.value = true
      videoSearchPageMuted.value = isSearch.value ? false : true
    } 
   
    const tab = sessionStorage.getItem('restoreTab')
    if (tab) {
      activeTab.value = tab
      sessionStorage.removeItem('restoreTab')
    }
    
  }
  update()
  window.addEventListener('popstate', update)
  // 修補 pushState, 新增歷史記錄到cache
  const rawPushState = history.pushState
  history.pushState = function (...args) {
      rawPushState.apply(this, args)
      window.dispatchEvent(new Event('popstate'))
  }
  
  
})
watch(isSearch, (val) => {
  if (val === false) {
    // 等待 DOM 更新完成
    nextTick(() => {
      setTimeout(() => {
        // 手動觸發 resize 事件，讓 VideoList 裡的 Swipe 能初始化
        window.dispatchEvent(new Event('resize'))

        // 如果你有 updateSize 之類的 func 也可以呼叫（例如從 ref 呼叫）
        // 或是你知道 shakaInstance 有提供方法也可以塞外層 ref 呼叫
      }, 100) // 延遲一點以確保 DOM 已顯示
    })
  }
})
</script>
<template>
  <div  class="page" v-show="!isSearch">
    <div class="video" ref="videoContainer" v-if="videoViewShow">
      <TopMenu
        @toggleSideMenu="handleToggleSideMenu"
        @setActiveTab="setActiveTab"
        :activeTab="activeTab"
        :topicTop="activeTab === 'topic' ? true : false"
        :liveTop="activeTab === 'live' ? true : false"
      />
      <div class="video-body" v-show="activeTab === null || activeTab === 'recommend'">
        <div class="video-list-wrapper">
          <VideoList :isActiveTab="activeTab === null || activeTab === 'recommend'" />
        </div>
      </div>
      <!-- 話題 -->
      <Topic v-if="activeTab === 'topic'" :isVisible="activeTab === 'topic' ? true : false" />
      <VideoFollowing v-if="activeTab === 'follow'" />
      <SideMenu ref="sideMenuRef" @openLoginModal="showLoginModal = true" />
      <Live v-if="activeTab === 'live'" />
    </div>
    <!-- 搜尋 -->
    <Popup class="loginModel" v-model:show="showLoginModal" v-if="showLoginModal">
      <Login :size="'small'" @closeLoginModal="showLoginModal = false" />
    </Popup>
  </div>
  <SearchVue 
     v-if="isSearch" 
     :key="keyword" 
     :videoSearchPageMuted="videoSearchPageMuted"
     :isSearch="isSearch" 
     @callback="isSearch = false" 
     :keyword="keyword" />
</template>

<style lang="less" scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.video {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.video-body {
  flex: 1;
  position: relative;
}

.video-list-wrapper {
  height: 100%;
  overflow: hidden;
  position: relative;
}

.footer {
  flex-shrink: 0;
}

.loginModel {
  background: var(--van-background);
  width: 5.75rem;
  min-width: 295px;
  overflow-y: inherit !important;
  border-radius: 0.2rem;
  box-shadow: 0 0 0.36rem #898989;
}

.tabbar :deep(.van-tabbar-item--active) {
  background: unset;
}
.tabbar :deep(.van-tabbar-item--active .tabbar-item > span) {
  color: var(--van-text-color);
}

.tabbar :deep(.van-tabbar) {
  background: var(--van-background);
}
@media screen and (max-width: 300px) {
  .loginModel {
    min-width: unset;
  }
}
</style>
