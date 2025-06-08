<script setup lang="ts">
import { ref, onMounted } from 'vue'
import VideoContent from '@/components/Video/VideoContent.vue'
import { getVideoDetail } from '@/service/api'
import { useFetchData, type UseFetchDataInterface } from '@/composables/useFetchData'

const props = defineProps<{
  id: string
}>()

const detailData = ref({})
const isLoading = ref(true)
const { fetchData }: UseFetchDataInterface = useFetchData()

const init = async () => {
  const firstId = props.id
  if (firstId) {
    isLoading.value = true
    try {
      const response = await getVideoDetail(firstId)
      if (response.data && response.data.success) {
        detailData.value = response.data.data
      }
    } catch (error) {}
    isLoading.value = false
  }
}

onMounted(() => {
  init()
})
</script>

<template>
  <VideoContent
    v-if="!isLoading"
    :data="detailData"
    :isActive="true"
    :fetchData="fetchData"
    :isDetail="true"
  ></VideoContent>
</template>

<style lang="less" scoped></style>
