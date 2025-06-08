<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Empty, Image, Tab, Tabs } from 'vant'

import VideoSearchList from './VideoSearchList.vue'
import LiveSearchList from './LiveSearchList.vue'
import FilterSection from './FilterSection.vue'
import AuthorSearchList from './AuthorSearchList.vue'
import UploadAuthorSearchList from './UploadAuthorSearchList.vue'

import shaixuantubiao from '@/assets/icons/shaixuantubiao.svg'

const props = defineProps(['keyWord', 'replaceUrl', 'topTagList', 'tagData', 'isMuted']);
const activeTab = ref('video')
const showSortConig = ref(false)


const tabList = [
  { sortBy: 'video', label: '视频', type: 0 },
  { sortBy: 'live', label: '直播', type: 1 },
  { sortBy: 'creator', label: '创作者', type: null },
  { sortBy: 'streamer', label: '主播', type: null }
]
const type = ref<number | null>(0);
const showFilterIcon = ref<boolean>(true)
const filters = ref<any[]>([]);
  const closeFilter = () => {
  showSortConig.value = false
}
const handleTabChange = async (tab: any) => {
  closeFilter()
  if (tab.name != 'video') {
    showFilterIcon.value = false
  } else {
    showFilterIcon.value = true
  }
  activeTab.value = tab.name
  const matched = tabList.find((t: any) => t.sortBy === tab.name)
  type.value = matched?.type ?? null
 
}

const setFilter = (selected: any) => {
  filters.value = JSON.parse(JSON.stringify(selected))
  closeFilter()
}

onMounted(() => {
  const el = document.querySelector('.search-warp') as HTMLElement
  if (el) el.style.overflow = 'hidden'
})
onBeforeUnmount(() => {
  const el = document.querySelector('.search-warp') as HTMLElement
  if (el) el.style.removeProperty('overflow')
})  
</script>

<template>
  <div class="video-popularitys-wrap">
    <div class="tabs-container">
      <Tabs v-model:active="activeTab" sticky class="tabs" @click-tab="handleTabChange">
        <Tab
          v-for="item in tabList"
          :key="`tabs` + item.sortBy"
          :title="item.label"
          :name="item.sortBy"
        />
      </Tabs>
      <div class="shaixuantubiaoIcon" v-if="showFilterIcon" @click="showSortConig = !showSortConig">
        <Image :src="shaixuantubiao.src" class="shaixuantubiao" />
      </div>
    </div>
    <div class="tags-scrollable">
      <div class="tags-content">
        <KeepAlive>
          <VideoSearchList v-if="true" 
            v-show="activeTab === 'video'" 
            :type="'video'"
            :keyWord="keyWord"
            :isMuted="activeTab !== 'video' ? true : props.isMuted"
            :filters="filters"
          />
        </KeepAlive>
        <FilterSection 
          :visible="showSortConig" 
          :topTagList="topTagList"
          :tagData="tagData"
          @setFilter="setFilter" 
          @close="closeFilter"
          />
        <KeepAlive>
          <LiveSearchList
            v-show="activeTab === 'live'"
            :type="'live'"
            :keyWord="keyWord"
             :isActive="activeTab === 'live'"
          />
        </KeepAlive>
        <KeepAlive>
          <AuthorSearchList
            v-show="activeTab === 'creator'"
            :key="'creator'"
            :type="'creator'"
            :keyWord="keyWord"
             :isActive="activeTab === 'creator'"
          />
        </KeepAlive>
        <KeepAlive>
          <UploadAuthorSearchList
            v-show="activeTab === 'streamer'"
            :key="'streamer'"
            :keyWord="keyWord"
            :type="'streamer'"
            :isActive="activeTab === 'streamer'"
          />
        </KeepAlive>
      </div>
    </div>
  </div>
</template>

<style scoped>
.video-popularitys-wrap {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.tags-scrollable {
  position: relative; 
  height: calc(100vh - 46px); 
  flex: 1;
  -ms-overflow-style: none;  /* IE & Edge */
  scrollbar-width: none;     /* Firefox */
}
.tags-scrollable::-webkit-scrollbar {
  display: none;             /* Chrome, Safari, Edge */
}

.video-popularitys-wrap :deep(.van-tab) {
  flex: unset;
  background: var(--van-text-color);
  padding: 0 8px;
}

.tags-content {
  position: relative;
  margin-bottom: 1rem;
  padding-bottom: 100px;
  overflow: hidden;
  height: 100%;
  overflow-y: auto;
  -ms-overflow-style: none;  /* IE & Edge */
  scrollbar-width: none;     /* Firefox */
}
.tags-content::-webkit-scrollbar {
  display: none;             /* Chrome, Safari, Edge */
}

.tabs-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
}

.shaixuantubiaoIcon {
  margin-left: 12px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.shaixuantubiao {
  width: 18px;
  height: 18px;
}

:deep(.tabs-container .van-tabs) {
  width: 100%;
}
:deep(.van-tabs__line) {
  background: red;
}
:deep(.van-tabs__nav) {
  background: unset;
}
:deep(.van-tab--active) {
  font-weight: 700 !important;
  color: #323232 !important;
}
:deep(.van-tab--active > .van-tab__text--ellipsis) {
  font-weight: 700 !important;
}
</style>
