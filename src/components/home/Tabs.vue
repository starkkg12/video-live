<script setup lang="ts">
  // ! CSR
  import { ref, onMounted, computed } from 'vue'
  import tabGif from '@/assets/images/home_tab_imgs/gfkj.gif'
  import utils from '@/utils'
  import localStorageKeys from '@/constants/localStorageKeys'
  import dayjs from 'dayjs'
  import LotteryBallDisplay from './LotteryBallDisplay.vue'

  // const isDataLoaded = ref(false)
  const props = defineProps<{
    gameTypeCode: string
    tabsData: any[]
  }>()

  const truncateString = (str: string): string => {
    let newStr = str.toString()
    if (newStr.length > 4) {
      return newStr.slice(4)
    }
    return newStr
  }

  const emits = defineEmits(['tab-click'])

  const selectedTab = computed({
    get: () => props.tabsData.findIndex(item => item.gameTypeCode === props.gameTypeCode),
    set: (index: number) => {
      emits('tab-click', props.tabsData[index].gameTypeCode)
    },
  })

  function selectTab(index: number) {
    selectedTab.value = index
  }

  onMounted(() => {})

  function emit(arg0: string, index: number) {
    throw new Error('Function not implemented.')
  }
</script>
<template>
  <div class="tabs">
    <div class="tab-headers">
      <div
        v-for="(tab, index) in tabsData"
        :key="index"
        :class="['tab-header', { active: selectedTab === index }]"
        @click="selectTab(index)"
      >
        <h4>{{ tab.gameTypeShortName }}</h4>
        <p>{{ dayjs(tab.nextOpenTime).format('MM月DD日') }}</p>
      </div>
    </div>
    <div class="tab-content" v-if="tabsData[selectedTab]">
      <div class="tab-content-top">
        <p>
          第
          <span>{{ truncateString(tabsData[selectedTab].currentIssue) }}</span>
          期开奖结果
        </p>
        <a href="https://macao-jc.com/"><img :src="tabGif.src" /></a>
      </div>
      <LotteryBallDisplay :currentResult="tabsData[selectedTab].currentResult" />
      <div class="tab-content-bottom">
        <p>{{ tabsData[selectedTab].nextIssue }}</p>
        <a href="/lottery">历史记录</a>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
  a {
    color: #07c160;
  }
  .tabs {
    padding: 1rem 0.3rem;
    background-color: #eee;
    display: flex;
    flex-direction: column;
  }
  .tab-headers {
    display: flex;
    cursor: pointer;
    justify-content: space-evenly;
  }
  .tab-header {
    padding: 3px 0;
    text-align: center;
    display: flex;
    align-items: center;
    flex-direction: column;
    /* border-bottom: 2px solid transparent; */
    border-top-right-radius: 0.5rem;
    border-top-left-radius: 0.5rem;
    background-color: #fff;
    flex: 1;

    h4 {
      font-weight: bold;
    }
    p {
      font-size: 0.75rem;
      line-height: normal;
    }
  }
  .active {
    /* border-bottom: 2px solid #000; */
    color: #fff;
    background-color: #07c160;
  }

  .tab-content {
    padding: 0.3rem;
    background-image: none;
    border: 0.02rem solid #07c160;
    background-color: #fff;
    box-shadow: 0.04rem 0.04rem 0.1rem #eee;
    border-radius: 10px;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    .tab-content-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
      img {
        height: 1.5rem;
      }
      p > span {
        color: rgb(7, 193, 96);
      }
    }
    .tab-content-middle {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .tab-content-middle-left {
        display: flex;
      }
      .tab-content-middle-center {
        display: flex;
        font-size: 1.3rem;
      }
      .tab-content-middle-right {
        display: flex;
      }
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
  }
</style>
