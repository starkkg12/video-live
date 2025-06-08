<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { Icon, NavBar, Field, Loading } from 'vant'

import search from '@/utils/search'

import {
  getTopList,
  getStastics,
  getSuggestions,
  getTagPopularityList,
} from "@/service/topic";
import ContentOverview from '@/components/Video/Topic/ContentOverview.vue'
import Suggestions from '@/components/Video/Topic/Suggestions.vue'
import TagPopularitys from '@/components/Video/Topic/TagPopularitys.vue'
import SearchHistory from '@/components/Video/Topic/SearchHistory.vue'
import VideoPopularitys from '@/components/Video/Search/VideoPopularitys.vue'

const props = defineProps(['keyword', 'isSearch', 'videoSearchPageMuted'])
const emit = defineEmits(['callback'])
const keyWord = ref(props.keyword  ? props.keyword : null)
const queryKey = ref(props.keyword ? props.keyword : null)
const isLoading = ref(false)
const isHistory = ref(false)
const isFocused = ref(false)
const datas = ref({
  topList: null,
  stasticsList: null,
  suggestionsList: null,
  tagPopularityList: null
})
const suggestionsPageObj = ref({ page: 1, pageSize: 4 })
const tagPopularityPageObj = ref({ sortBy: 'view', page: 1, pageSize: 50 })
const HISTORY_KEY = 'SEARCH_LIST'

const getSearchHistory = (): string[] => {
  return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
}

const saveSearchKeyword = (keyword: string) => {
  if (!keyword) return
  const history = getSearchHistory()
  const filtered = history.filter(k => k !== keyword)
  const newHistory = [keyword, ...filtered].slice(0, 20)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory))
}

const loadData = async (isSearch: boolean) => {
  isLoading.value = true
  if (isSearch) {
    const [a, b, c] = await Promise.allSettled([
      getTopList({ pageSize: 3 }),
      getStastics(),
      getTagPopularityList(tagPopularityPageObj.value),
    ])
    isLoading.value = false
    datas.value.topList = a.status === 'fulfilled' ? a.value.data.data : null
    datas.value.stasticsList = b.status === 'fulfilled' ? b.value.data.data : null
    datas.value.tagPopularityList = c.status === 'fulfilled' ? c.value.data.data.data : null
  } else {
    const results = await Promise.allSettled([
      getTopList({ pageSize: 3 }),
      getStastics(),
      getSuggestions(suggestionsPageObj.value),
      getTagPopularityList(tagPopularityPageObj.value),
    ])
    const [a, b, c, d] = results;
    isLoading.value = false
    datas.value.topList = a.status === 'fulfilled' ? a.value.data.data : null
    datas.value.stasticsList = b.status === 'fulfilled' ? b.value.data.data : null
    datas.value.suggestionsList = c.status === 'fulfilled' ? c.value.data.data : null
    datas.value.tagPopularityList = d.status === 'fulfilled' ? d.value.data.data : null
    queryKey.value = null
    // 檢查是否全部都失敗
    const allRejected = results.every(item => item.status === 'rejected')
    if (allRejected) {
      console.log('❌ 所有 API 都失敗')
    } else {
      isLoading.value = false
    }
  }
}

const onBack = () => {
  // if (props.isSearch !== undefined) {
  //   emit('callback');
  // } else {
    window.history.back()
  //}
}

const onClear = () => {
  keyWord.value = null
  const url = new URL(window.location.href)
  url.search = '?keyWord'
  window.history.replaceState({}, '', url.toString())
  loadData(false)
}

const clearHistory = () => {
  isHistory.value = false
}
const syncNavBarWidth = () => {
  const wrapper = document.querySelector('.search-warp') as HTMLElement
  const navBar = document.querySelector('.van-nav-bar--fixed') as HTMLElement

  if (wrapper && navBar) {
    const wrapperWidth = wrapper.getBoundingClientRect().width
    navBar.style.width = `${wrapperWidth}px`
  }
}
const keyWordProxy = computed({
  get: () => keyWord.value ?? '',  // null → ''
  set: (val:any) => {
    keyWord.value = val === '' ? null : val
  }
});
const goToSearch = (keyWord: string) => {
  if (keyWord.trim() !== '' && keyWord !== null) {
    search(keyWord)
  }
}

onMounted(() => {
  syncNavBarWidth();
  window.addEventListener('resize', () => {syncNavBarWidth();});
  const params = new URLSearchParams(window.location.search)
  const searchHistory = getSearchHistory()
  isHistory.value = searchHistory.length > 0
  const rawKeyWord = params.get('keyWord')
  keyWord.value = rawKeyWord && rawKeyWord.trim() !== '' ? rawKeyWord : null
  queryKey.value = rawKeyWord && rawKeyWord.trim() !== '' ? rawKeyWord : null
  if (keyWord.value) {
    loadData(true)
    saveSearchKeyword(keyWord.value)
  } else {
    loadData(false)
  }
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', syncNavBarWidth)
})
watch(keyWord.value, (newVal: string) => {
  if (newVal && newVal.trim() !== '') {
    loadData(true)
    saveSearchKeyword(newVal)
  } else {
    loadData(false)
  }
})
</script>

<template>
  <div class="search-warp">
    <NavBar class="nav" safe-area-inset-top fixed placeholder :clickable="false" left-width="50px" right-width="80px">
      <template #left>
        <div class="nav-left" @click="onBack">
          <Icon class="arrow-left van-icon-arrow-left" size="24px" />
        </div>
      </template>
     
      <template #title>
        <div class="field-container">
          <Field 
            v-model="keyWordProxy" 
            class="search"
            input-align="left"
            left-icon="search"
            placeholder="请输入搜索关键词"
            @focus="isFocused = true"
            @blur="isFocused = false"
            @keydown.enter="goToSearch(keyWord)"
          >
            <template #right-icon>
              <div class="custom-clear-icon" 
                v-if="keyWord && isFocused" 
                @click="onClear"
                @mousedown.prevent="onClear"
                >
               <Icon name="cross" size="16" />
              </div>
            </template>
          </Field>  
        </div>
      </template>

      <template #right>
        <div class="nav-right">
          <router-link class="searchBtn" :to="`?keyWord=${keyWord}`" @click="goToSearch(keyWord)">搜索</router-link>
        </div>
      </template>
    </NavBar>

    <SearchHistory v-if="queryKey == null && isHistory" :historyKey="HISTORY_KEY" @clearHistory="clearHistory" />
    <Suggestions  :key="`search-suggestions`" v-if="!isLoading && queryKey == null" :data="datas.suggestionsList" />
    <div style="display: flex">
      <ContentOverview :key="`search-contentOverview`" :data="datas.stasticsList" />

    </div>
    <TagPopularitys 
      :key="`search-tag`"
      v-if="queryKey == null"
      :isVisible="true" 
      :topList="datas.topList" 
      :data="datas.tagPopularityList" 
      :isSearchVueScroll="true"
      :isTopicVueScroll="false"
      :replaceUrl="true"
      />
    <VideoPopularitys 
      v-if="queryKey != null" 
      :topTagList="datas.topList" 
      :tagData="datas.tagPopularityList" 
      :keyWord="keyWordProxy" 
      :isMuted="videoSearchPageMuted"
      />
    <div class="loading-indicator" v-if="isLoading">
      加载中...
      <Loading color="gray" size="19" />
    </div>
  </div>
</template>

<style scoped>
 .content-overview-wrap {
    display: grid;
    padding: 0px 12px;
    gap: 12px;
    width: 100%;
    grid-template-columns: repeat(4, 1fr);
  }
.search-warp {
  position: relative;
  background-color: white;
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.search-warp .field-container {
  width: 100%;
  margin: 0 auto;
}
.search-warp .search {
  background-color: #f7f8fa;
  border-radius: 999px;
  padding: 0 12px;
  font-size: 14px;
  width: 100%;
  line-height: 34px;
}
.search-warp .nav-left {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
.searchBtn {
  color: #eb4d60;
  font-size: 15px;
  font-weight: 500;
}
.loading-indicator {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    margin-bottom: 80px;
    margin-top: 10px;
    color: #666;
}
.search-warp :deep([class*="van-hairline"]::after) {
  transform: unset;
}  
.search-warp :deep(.van-nav-bar__title) {
  max-width: calc(100% - 70px);
  position: absolute;
  left: 48%;
  transform: translateX(-50%);
  width: 73%;
  display: flex;
  justify-content: center;
}
.search-warp :deep(.van-nav-bar) {
  background-color: white !important;
  border-bottom: none !important;
  box-shadow: none !important;
}
.search-warp :deep(.van-cell) {
  color: #323232;
}
.search-warp :deep(.van-field__body input) {
  color: #323232;
}
.search-warp :deep(.van-field__left-icon .van-icon) {
  color: #969799;
}
.search-warp :deep(.custom-clear-icon) {
  width: 18px;
  height: 18px;
  background-color: #969799;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
}
.search-warp :deep(.van-nav-bar__left .van-icon) {
  color: unset !important; /* 替換成你要的顏色 */
}
.search-warp :deep(.van-cell) {
  color: #323232;
}
.search-warp :deep(.van-field__body input) {
  color: #323232;
}
.search-warp :deep(.van-field__left-icon .van-icon) {
  color: #969799 !important;
}
.search-warp :deep(.van-icon-clear) {
  color: #969799 !important; /* 或你想要的顏色 */
}
.search-warp :deep(.van-nav-bar--fixed) {
  left: unset;
}  
.search-warp :deep(.van-nav-bar::after),
.search-warp :deep(.van-hairline--bottom::after),
.search-warp :deep(.van-nav-bar__content::after) {
  border-bottom: none !important;
  border-bottom-width: 0 !important;
  content: '' !important;
}
:deep(.van-nav-bar--fixed) {
  z-index: 100 !important;

}
.filter-mask {
  z-index: 200 !important;
}
.search-warp :deep(.van-nav-bar__left), 
.search-warp :deep(.van-nav-bar__right) {
  padding: unset;
  font-size: 24px;
  width: 46px;
}
</style>
