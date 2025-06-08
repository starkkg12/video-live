<script setup lang="ts">
import { computed } from 'vue';
import LotteryBall from './LotteryBall.vue';
import { Icon } from 'vant';

interface BallData {
  num: string;
  shengxiao: string;
  fiveElements: string;
  color: string;
}

interface TabData {
  gameTypeCode: string;
  lastResult: BallData[];
  [key: string]: any;
}

const props = defineProps<{
  tabsData: TabData[];
  gameTypeCode: string;
  isDark?: boolean;
}>();

const currentTabData = computed(() => {
  const tabData = props.tabsData || [];
  return tabData.find(item => item.gameTypeCode === props.gameTypeCode) || {} as TabData;
});

console.log('currentTabData', currentTabData.value);

// 构建彩票号码数据
const lotteryNumbers = computed(() => {
  // 从 currentResult 属性获取开奖结果
  const currentResult = currentTabData.value.currentResult || [];
  console.log('currentResult:', currentResult);
  
  if (!currentResult.length) {
    console.log('未找到开奖号码数据');
    return [];
  }
  
  // 五行元素映射
  const fiveElementsMap: Record<string, string> = {
    'j': '金',
    'm': '木',
    's': '水',
    'h': '火',
    't': '土'
  };
  
  // 颜色映射
  const colorMap: Record<string, string> = {
    'R': 'red',
    'B': 'blue',
    'G': 'green'
  };
  
  return currentResult.map((ball: BallData, index: number) => {
    // 最后一个号码作为特殊号码
    const isSpecial = index === currentResult.length - 1;
    
    return {
      number: ball.num,
      animal: ball.shengxiao,
      element: fiveElementsMap[ball.fiveElements] || '未知',
      color: colorMap[ball.color] as 'red' | 'blue' | 'green',
      special: isSpecial
    };
  });
});

// 普通号码
const regularNumbers = computed(() => 
  lotteryNumbers.value.filter((ball: any) => !ball.special)
);

// 特殊号码
const specialNumbers = computed(() => 
  lotteryNumbers.value.filter((ball: any) => ball.special)
);

// 是否有特殊号码
const hasSpecialNumbers = computed(() => 
  specialNumbers.value.length > 0
);
</script>

<template>
  <div class="lottery-result-container">
    <!-- 普通号码 -->
    <div class="regular-numbers">
      <LotteryBall
        v-for="(ball, index) in regularNumbers"
        :key="`regular-${index}`"
        :number="ball.number"
        :animal="ball.animal"
        :element="ball.element"
        :color="ball.color"
      />
    </div>
    
    <!-- 加号与特殊号码 -->
    <div v-if="hasSpecialNumbers" class="special-section">
      <Icon class="plus-icon" name="plus" color="var(--van-gray-6)" size="26" />
      <div class="special-numbers">
        <LotteryBall
          v-for="(ball, index) in specialNumbers"
          :key="`special-${index}`"
          :number="ball.number"
          :animal="ball.animal"
          :element="ball.element"
          :color="ball.color"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.lottery-result-container {
  display: flex;
  align-items: center;
  background-color: var(--van-card-background);
  border-radius: 8px;
  margin: 10px 0;
  gap: 5px;
}

.regular-numbers {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.special-section {
  display: flex;
  align-items: center;
  gap: 5px;
}

.plus-icon {
  margin: 0 5px;
  display: flex;
  align-items: center;
  margin-top: -10px;
}

.special-numbers {
  display: flex;
}
</style>