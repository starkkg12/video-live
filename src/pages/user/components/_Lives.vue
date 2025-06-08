<script setup lang="ts">
import { onMounted, ref } from 'vue'
import NoData from '../../../components/NoData.vue'
import LiveHistoryList from '@/components/Live/LiveHistoryList.vue'
import { getUserAllLiveLists } from '@/service/api'
const props = defineProps(['userId'])
const liveLists = ref<any[]>([])
const page = ref<number>(1)
const limit = ref<number>(50)
const responseData = ref(null)
const loadData = async (targetUserId: string) => {
  await getUserAllLiveLists({
    userId: targetUserId,
    limit: limit.value
  }).then((res) => {
    if (res.data.errorMessage === 'Success') {
      const datas = res.data.data.rooms
      const groupMap = new Map<string, any[]>()

      datas.forEach((item: any) => {
        const date = new Date(item.created_at)
        const yearMonth = `${date.getFullYear()}年${(date.getMonth() + 1).toString().padStart(2, '0')}月`

        if (!groupMap.has(yearMonth)) {
          groupMap.set(yearMonth, [])
        }
        groupMap.get(yearMonth)!.push(item)
      })

      // 轉換成陣列格式
      const groupedArray = Array.from(groupMap.entries()).map(([key, value]) => ({
        createAt: key,
        data: value
      }))

        // 可選：依年月降序排序
      groupedArray.sort((a, b) => (a.createAt < b.createAt ? 1 : -1))
      liveLists.value = groupedArray

    }
  })
}
onMounted(() => {
  loadData(props.userId)
})
</script>
<template>
  <div class="wrap">
    <div class="content" v-if="responseData !== null"></div>
    <LiveHistoryList
      :lists="liveLists"
      >
      <template #empty> <NoData /> </template>
    </LiveHistoryList>
     
  </div>
</template>
<style scoped>
.wrap {
  padding: 10px 0px;
}
</style>
