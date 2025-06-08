<script setup lang="ts">
  import { onMounted, onBeforeUnmount, ref } from "vue"
  import { Loading } from "vant"
  import {
    getTopList,
    getStastics,
    getSuggestions,
    getTagPopularityList,
  } from "@/service/topic";

  import ContentOverview from './ContentOverview.vue'
  import Suggestions from "./Suggestions.vue"
  import TagPopularitys from "./TagPopularitys.vue"
  const props = defineProps(['isVisible'])
  const isSearch = ref(false);
  const suggestionsPageObj = ref({
    page: 1,
    pageSize: 4
  })

  const tagPopularityPageObj = ref({
    sortBy: 'view',
    page: 1,
    pageSize: 50
  })

  const datas = ref({
     topList: null,
     stasticsList: null,
     suggestionsList: null,
     tagPopularityList: null
  })
  const isLoading = ref(false);
  const loadData = async () => {
    isLoading.value = true
    const results = await Promise.allSettled([
      getTopList({ pageSize: 3 }),
      getStastics(),
      getSuggestions(suggestionsPageObj.value),
      getTagPopularityList(tagPopularityPageObj.value)
    ])

    const [a, b, c, d] = results

    // 個別成功才更新資料
    datas.value.topList = a.status === 'fulfilled' && a.value?.data ? a.value.data.data : null
    datas.value.stasticsList = b.status === 'fulfilled' && b.value?.data ? b.value.data.data : null
    datas.value.suggestionsList = c.status === 'fulfilled' && c.value?.data ? c.value.data.data : null
    datas.value.tagPopularityList = d.status === 'fulfilled' && d.value?.data ? d.value.data.data : null

    // 檢查是否全部都失敗
    const allRejected = results.every(item => item.status === 'rejected')
    if (allRejected) {
      console.log('❌ 所有 API 都失敗')
    }
    isLoading.value = false
    
  };
  const topicWrapHeight = ref('auto')
  const searchTag = (tag: string) => {

  }
  const updateHeight = () => {
    topicWrapHeight.value = `${document.body.clientHeight * 0.885}px`
  }
  let bodyResizeObserver: ResizeObserver | null = null
  onMounted(() => {
    loadData();
    updateHeight()
    bodyResizeObserver = new ResizeObserver(() => {
      updateHeight()
    })
    bodyResizeObserver.observe(document.body)
  });  
  onBeforeUnmount(() => {
    bodyResizeObserver?.disconnect()
  })
</script>
<template>
    <div class="topic-wrap" :style="{ maxHeight: topicWrapHeight, height: topicWrapHeight }">
        <ContentOverview :data="datas.stasticsList" />
        <Suggestions v-if="!isLoading && datas.suggestionsList !== null" :data="datas.suggestionsList"  @searchTag="searchTag" />
        <TagPopularitys 
           :isSearchVueScroll="false" 
           :isTopicVueScroll="true" 
           :topList="datas.topList" 
           :data="datas.tagPopularityList" 
           :isVisible="props.isVisible" 
           :replaceUrl="false" 
           @searchTag="searchTag"
           />
        <div class="loading-indicator" v-if="isLoading">
           加载中...
          <Loading color="gray" size="19" />
        </div>
    </div>
</template>
<style scoped>
 .topic-wrap {
    top: 68px;
    margin: 0 10px;
    background: #fff;
    margin: 0 10px;
    border-radius: 10px;
    overflow: hidden;
    padding-top: 12px;
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
</style>