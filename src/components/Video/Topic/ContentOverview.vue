<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
const labelAndData = ref([
  { label: '总视频', value: '-' },
  { label: '今日新增', value: '-' },
  { label: '创作者', value: '-' },
  { label: '主播', value: '-' },
])
const props = defineProps(['data'])
watch(
  () => props.data,
  () => {
    if (props.data !== null) {
      labelAndData.value[0].value = props.data.totalVideos
      labelAndData.value[1].value = props.data.newVideos
      labelAndData.value[2].value = props.data.uploadAuthor
      labelAndData.value[3].value = props.data.liveAuthor
    }
  },
  { immediate: true }
)
</script>
<template>
  <van-grid :column-num="4" square class="content-overview-wrap">
    <van-grid-item v-for="(item, index) in labelAndData" :key="index">
      <div class="stat-card">
        <div class="value">{{ Number(item.value) <= 0 ? '-' : item.value }}</div>
        <div class="label">{{ item.label }}</div>
      </div>
    </van-grid-item>
  </van-grid>
</template>
<style scoped>
.content-overview-wrap {
  display: grid;
  padding: 0px 12px 10px 12px;
  gap: 12px;
  grid-template-columns: repeat(4, 1fr);
}
.stat-card {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 6px 0px;
  border-radius: 6px;
  background: rgb(242, 242, 242);
  line-height: normal;
}
.stat-card .label {
  font-size: 12px;
  color: rgb(102, 102, 102);
}
.stat-card .value {
  font-size: 16px;
  font-weight: 500;
  color: rgb(255, 51, 51);
}
</style>
