<script setup lang="ts">
import { ref, watch } from 'vue'
import { Icon } from 'vant'
import refresh from '@/assets/icons/refresh.svg'
import search from '@/utils/search';
import { getSuggestions } from '@/service/topic'

interface SuggestionItem {
  id: number
  keyWord: string
  [key: string]: any
}

const props = defineProps(['data'])

const guessList = ref<SuggestionItem[]>([])
const page = ref(1)
const totalPages = ref(0)


const handleReload = () => {
  if (props.data) {
    page.value = page.value < totalPages.value ? page.value + 1 : 1
    getSuggestions({ page: page.value, pageSize: props.data.pagination.pageSize })
      .then((res: any) => {
        if (res.data.success && res.data.data.data?.length) {
          guessList.value = res.data.data.data
        }
      })
  }
}

watch(
  () => props.data,
  () => {
    if (props.data) {
      guessList.value = props.data.data
      page.value = props.data.pagination.page
      totalPages.value = props.data.pagination.totalPages
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="p-4 bg-white rounded shadow suggestions-wrap">
    <div class="headers">
      <span class="title">猜你想搜</span>
      <div class="reload-btn" @click="handleReload">
        <Icon :name="refresh.src" size="20" class="reload-icon"/>
        換一批
      </div>
    </div>

    <van-grid :column-num="2" :gutter="8" :border="false" class="column">
      <van-grid-item
        v-for="(item, index) in guessList"
        :key="index"
      >
        <div class="keyword" :title="item.keyWord" @click="search(item.keyWord)">
          {{ item.keyWord }}
        </div>
      </van-grid-item>
    </van-grid>
  </div>
</template>

<style scoped>
.suggestions-wrap {
  padding: 10px 14px;
}
.headers {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  margin-bottom: 12px;
}
.column {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px 12px;
}
.reload-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  color: rgb(117, 116, 116);
}
.reload-btn .reload-icon {
  width: 20px;
  height: 30px;
  display: flex;
  align-items: center;
}
.title { 
  font-size: 16px;
  font-weight: 500;
}
.keyword {
  display: block;
  width: 50vw;
  font-weight: auto;
  line-height: 1.5;
  text-align: left;
  text-wrap: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  padding: 4px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
}
@media screen and (min-width: 768px) {
  .keyword {
    width: 210px;
  }
}
</style>
