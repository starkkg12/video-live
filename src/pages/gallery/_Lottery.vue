<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Button } from 'vant'
import { video, world, change } from '@/assets/images/gallery'
import LotteryResult from '@/components/LotteryResult.vue'

const props = defineProps<{
  tabsData: any[]
  gameTypeCode: string
  isDark: boolean
}>()

const lotteryData = ref<any[]>([])

const truncateString = (str: string): string => {
  let newStr = str.toString()
  if (newStr.length > 4) {
    return newStr.slice(4)
  }
  return newStr
}

const gotoLottery = () => {
  window.location.href = '/lottery'
}

const emits = defineEmits(['tab-click'])

const selectedTab = computed({
  get: () => props.tabsData.findIndex(item => item.gameTypeCode === props.gameTypeCode),
  set: (index: number) => {
    emits('tab-click', props.tabsData[index].gameTypeCode)
  },
})

onMounted(() => {
  lotteryData.value = props.tabsData
})
</script>

<template>
  <div class="lottery-container">
    <div class="lottery-title">
      <div class="lottery-title-left">
        <div class="lottery-title-left-text">
          <p>
            第
            {{ truncateString(tabsData[selectedTab].currentIssue) }}
            期开奖结果
          </p>
        </div>
      </div>
      <div class="lottery-title-right">
        <Button :icon="video.src" type="default" size="small">开奖直播</Button>
        <Button :icon="world.src" type="default" size="small">官方开奖</Button>
      </div>
    </div>
    <LotteryResult :tabsData="tabsData" :gameTypeCode="gameTypeCode" :isDark="isDark" />
    <div class="tab-content-bottom">
      <p>{{ tabsData[selectedTab].nextIssue }}</p>
      <Button :icon="change.src" type="default" size="small" @click="gotoLottery">历史记录</Button>
    </div>
  </div>
</template>

<style scoped>
.lottery-container {
  color: var(--van-text-color);
  width: 100%;
  background-color: var(--van-card-background);
  margin-top: 10px;
  padding: 10px;
  border-radius: 10px;
}

.lottery-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.lottery-title-left {
  display: flex;
  align-items: center;
}

.lottery-title-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.lottery-container :deep(button) {
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
}

.tab-content-bottom {
  margin-top: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;

  p {
    color: rgb(235, 82, 82);
  }
}
</style>
