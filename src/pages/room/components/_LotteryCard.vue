<script setup lang="ts">
  import LotteryBallDisplay from '@/components/home/LotteryBallDisplay.vue'
  import LotteryBallDisplayBySelf from '@/components/LotteryBallDisplayBySelf.vue'
  import dayjs from 'dayjs'
  import utils from '@/utils'

  const props = defineProps<{
    data: any
    noFiveElements?: boolean
    sortType?: 'asc' | 'desc'
  }>()

  const truncateString = (str: string): string => {
    if (str && str.length >= 5) {
      return str.slice(4)
    }
    return str
  }
</script>

<template>
  <div v-if="data" class="lottery-card-wrapper">
    <div class="lottery-top">
      <div class="lottery-issue">第{{ truncateString(data.issue) }}期开奖结果</div>
      <div class="lottery-date">{{ dayjs(data.openTime || data.recordTime).format('YYYY年MM月DD日') }}</div>
    </div>
    <LotteryBallDisplay
      v-if="data?.numInfo"
      :current-result="data?.numInfo"
      :sortType="sortType"
      :noFiveElements="noFiveElements"
    />
    <LotteryBallDisplayBySelf
      v-else
      :game-code="utils.getGameByTypeOrCode({ gameType: data.gameType })?.gameTypeCode ?? ''"
      :issue="data.issue"
      :year="new Date(data.recordTime).getFullYear().toString()"
      :isInRoom="true"
      :hasTitle="false"
    />
  </div>
</template>

<style lang="less" scoped>
  @text-primary: #434343;
  @text-secondary: #656565;
  @text-grey: #aeaeb1;
  @bg-green: #34c759;

  .lottery-card-wrapper {
    background-color: #fff;
    padding: 0.5rem;
    box-shadow: 0px 0px 8px 0px #0000001a;
    border-radius: 8px;
    overflow: hidden;
    .lottery-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .lottery-issue {
        font-size: 14px;
        font-weight: 600;
        color: @text-secondary;
      }
      .lottery-date {
        font-size: 12px;
        color: @text-grey;
      }
    }
  }
</style>
