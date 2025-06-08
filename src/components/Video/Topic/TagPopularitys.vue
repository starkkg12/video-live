<script setup lang="ts">
import { computed, nextTick, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { Image, Tab, Tabs } from 'vant'
import {
  getTagPopularityList,
} from "@/service/topic";
import NoData from '@/components/NoData.vue'

import top from '@/assets/icons/top.png'
import top1 from '@/assets/icons/top-1.png'
import top2 from '@/assets/icons/top-2.png'
import top3 from '@/assets/icons/top-3.png'
import search from '@/utils/search';

const props = defineProps(['data', 'topList', 'isVisible', 'isSearchVueScroll', 'isTopicVueScroll', 'replaceUrl'])

const pageData = ref([
  { action: 'view', data: props.data ? props.data.data.data : [] },
  { action: 'video', data: [] },
  { action: 'like', data: [] },
  { action: 'favorite', data: [] },
  { action: 'share', data: [] },
])
const page = ref(props.data ? props.data.pagination.page : 1)
const totalPages = ref(props.data ? props.data.pagination.totalPages : 0)
const pageSize = ref(props.data ? props.data.pagination.pageSize : 50)
const topList = ref(props.topList ? props.topList : [])
const activeTab = ref('view')
const tabsKey = ref(0)
const scrollContainer = ref<HTMLElement | null>(null)
const loadMoreTrigger = ref<HTMLElement | null>(null)
const isLoading = ref(false)

const countLabelMap: Record<string, string> = {
  view: '人气',
  video: '视频',
  like: '点赞',
  favorite: '收藏',
  share: '分享'
}

const tab = [
  { sortBy: 'view', label: "话题热榜" },
  { sortBy: 'video', label: "视频榜" },
  { sortBy: 'like', label: "点赞榜" },
  { sortBy: 'favorite', label: "收藏榜" },
  { sortBy: 'share', label: "推广榜" },
]
const tagsScrollableRef = ref<HTMLElement | null>(null)

interface TabType {
  name: string
}
//const currentData = [];
const currentData = computed(() => {
  return pageData.value.find((item: any) => item.action === activeTab.value)?.data || []
})

const handleTabChange = (tab: TabType) => {
  activeTab.value = tab.name
  const index = pageData.value.findIndex((item: any) => item.action === tab.name)
  if (pageData.value[index].data.length <= 0) {
    getTagPopularityList({
      sortBy: tab.name,
      page: 1,
      pageSize: pageSize.value
    }).then((res: any) => {
      if (res.data.success) {
        if (index !== -1) {
          pageData.value[index].data = res.data.data.data
        }
        page.value = res.data.data.pagination.page;
        totalPages.value = res.data.data.pagination.totalPages;
        pageSize.value = res.data.data.pagination.pageSize;
      }
    })
  }
}

function setLoadMoreRef(index: number) {
  return (el: Element | null) => {
    if (index === currentData.value.length - 1 && el instanceof HTMLElement) {
      loadMoreTrigger.value = el
    }
  }
}

const formatToWan = (num: number) => {
  if (num < 10000) return `${num}`
  const value = num / 10000
  return Number.isInteger(value) ? `${value}万` : `${value.toFixed(1).replace(/\.0$/, '')}万`
}

const tabHeaderRef = ref<HTMLElement | null>(null)

const handleScroll = () => {
  const wrapper = document.querySelector('.search-warp') as HTMLElement
  const referenceEl = document.querySelector('.tag-popularitys-wrap') as HTMLElement
  const tabEl = document.querySelector('.tabs-fixed-header') as HTMLElement
  const navHeight = 46

  if (referenceEl && tabEl) {
    const refBottom = referenceEl.getBoundingClientRect().bottom
    
    if (refBottom <= navHeight + 40) {
      tabEl.classList.add('fixed-header')
      tabEl.style.width = wrapper.clientWidth + 'px'
    } else {
      tabEl.classList.remove('fixed-header')
      tabEl.style.width = ''
    }
  }
}

const updateSize = () => {
  // 動態給付tags-scroll最大高度
  // const el = tagsScrollableRef.value
  // const topicWrapEl = document.querySelector('.topic-wrap') as HTMLElement
  // if (el && topicWrapEl && !props.isSearchVueScroll) {
  //   const wrapTop = topicWrapEl.getBoundingClientRect().top
  //   const scrollTop = el.getBoundingClientRect().top
  //   const remainingHeight = topicWrapEl.clientHeight - (scrollTop - wrapTop) - 15
  //   el.style.maxHeight = `${remainingHeight}px`
  //   el.style.overflowY = 'auto'
  //   el.style.paddingBottom = '20px'
  // } else if (el && !props.isSearchVueScroll ) {
  //   const offset = el.getBoundingClientRect().top
  //   const maxHeight = document.body.clientHeight - offset
  //   el.style.maxHeight = `${maxHeight}px`
  //   el.style.overflowY = 'auto'
  // }

  const ua = navigator.userAgent || navigator.vendor || (window as any).opera
  const el = tagsScrollableRef.value
  const isIPhone = /iPhone/i.test(ua)
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua)
   
  if (el && isIPhone && isSafari) {
    el.classList.add('iphone-safari-bottom')
  }
}
onMounted(() => {
  const scrollContainer = document.querySelector('.search-warp')
  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
    onBeforeUnmount(() => {
      scrollContainer.removeEventListener('scroll', handleScroll)
    })
  }
  nextTick(() => {
    requestAnimationFrame(() => {
      updateSize();
    })
  })
  window.addEventListener('resize', () => {
    requestAnimationFrame(updateSize)
  })
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateSize)
  const tabEl = document.querySelector('.tabs-fixed-header') as HTMLElement
  tabEl.classList.remove('fixed-header')
  tabEl.style.width = ''

})


watch(() => props.isVisible, async (val: any) => {
  if (val) {
    tabsKey.value += 1;
    await nextTick()
    window.dispatchEvent(new Event('resize'))
  }
})

watch(() => [props.data, props.topList], () => {
  if (props.data !== null) {
    const index = pageData.value.findIndex((item: any) => item.action === 'view')
    pageData.value[index].data = props.data.data
  }
  if (props.topList !== null) {
    topList.value = props.topList
  }
}, { immediate: true })
</script>

<template>
  <div 
     class="tag-popularitys-wrap" 
     :class="{'overflow' : props.isSearchVueScroll }"
     v-show="props.isVisible">
    <!-- 固定不動的 Tabs Header -->
    <div 
      ref="tabHeaderRef"
      class="tabs-fixed-header"
      :class="{ 'sticky-header': props.isSearchVueScroll }"
      >
      <Tabs v-model:active="activeTab" class="tabs" @click-tab="handleTabChange">
        <Tab v-for="item in tab" :key="item.sortBy" :title="item.label" :name="item.sortBy" />
      </Tabs>
    </div>

    <!-- 滾動內容 -->
    <div 
      class="tags-scrollable" 
      :class="{ 'overflow': props.isSearchVueScroll}"
      ref="tagsScrollableRef">
      <div 
        class="tags-content"
        :class="{ 'enable-scroll': props.isTopicVueScroll}"
         >
        <div v-if="activeTab === 'view'">
          <div class="top-tags" v-for="(item, index) in topList" :key="item.id" @click="search(item.name)">
            <Image :src="top.src" class="top" />
            <span class="tagName"># {{ item.name }}</span>
          </div>
        </div>
        <div
          class="tags"
          v-for="(item, index) in currentData"
          :key="item.tagId"
          @click="search(item.tagName)"
          :ref="setLoadMoreRef(index)"
        >
          <span class="tag">
            <span class="tagNo">
              <Image :src="top1.src" v-if="index === 0" class="top" />
              <Image :src="top2.src" v-if="index === 1" class="top" />
              <Image :src="top3.src" v-if="index === 2" class="top" />
              <span v-else-if="index > 2">{{ index + 1 }}</span>
            </span>
            <span class="tagName"># {{ item.tagName }}</span>
          </span>
          <span class="count van-cell__value">
            {{ item[activeTab + 'CountScore'] !== undefined ? formatToWan(Number(item[activeTab + 'CountScore'])) : formatToWan(Number(item[activeTab + 'Count'])) }} {{ countLabelMap[activeTab] }}
          </span>
        </div>
        <NoData v-if="currentData.length <= 0" :text="'暂无数据'" />
        <div v-else class="bottom-padding"></div>
      </div>
    </div>
  </div>
</template>
<style scoped>

.tag-popularitys-wrap :deep(.van-tab) {
  flex: unset;
  background: var(--van-text-color);
}
.tags {
  display: flex;
  gap: 6px;
  line-height: 24px;
  padding: 10px 16px;
  justify-content: space-between;
}
.top-tags {
  display: flex;
  gap: 6px;
  line-height: 24px;
  padding: 10px 16px;
}
.tabs {
  padding: 0 12px;
}
.tag {
  display: flex;
  gap: 6px;
  align-items: center;
}
.tagNo {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 24px;
  min-width: 24px;
}
.tagName {
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
}
.top {
  width: 24px;
  height: 24px;
}

.tag-popularitys-wrap {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.overflow {
  overflow: visible!important;;
}

.ta {
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
}
.tags-scrollable {
  height: 60vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tabs-fixed-header {
  flex-shrink: 0;
}

.tags-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.sticky-header {
  position: sticky;
  top: 46px; /* 根據 NavBar 高度調整，例如 46px or 50px */
  z-index: 99;
  background: #fff;
}
.enable-scroll {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  max-height: calc(100vh - 96px);
}
.fixed-header {
  position: fixed;
  top: 46px;
  z-index: 999;
  background: white;
}

:deep(.van-tabs__wrap) {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  overflow: hidden !important;
}

:deep(.van-tabs__line) {
  display: none;
}
:deep(.van-tabs__nav) {
  background: unset;
}
:deep(.van-tab--active) {
  font-weight: 700 !important;
  color: #323232 !important;
}
:deep(.van-tab--active > .van-tab__text--ellipsis) {
    font-weight: 700!important;
}
@media screen and (min-width: 600px) {
  .tagName {
    max-width: 460px;
  }
}
@media screen and (min-width: 768px) {
  .tagName {
    max-width: 320px;
  }
  .keyword {
    width: 200px;
  }
}
@media screen and (max-width: 600px) {
  .tagName {
    max-width: 350px;
  }
}
@media screen and (max-width: 510px) {
  .tagName {
    max-width: 300px;
  }
}
@media screen and (max-width: 480px) {
  .tagName {
    max-width: 280px;
  }
}
@media screen and (max-width: 450px) {
  .tagName {
    max-width: 250px;
  }
}
@media screen and (max-width: 420px) {
  .tagName {
    max-width: 200px;
  }
}

</style>