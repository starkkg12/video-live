<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Header from './_Header.vue'
import StateManager from '@/components/StateManager.vue'
import Swipe from '@/components/Swipe.vue'
// import WaterfallLoad from '@/components/WaterfallLaod.vue'
import Tabs from '@/components/home/Tabs.vue'
import { NoticeBar, Icon } from 'vant'
import utils from '@/utils'
import constants from '@/constants'
import setLSItem from '@/utils/setLocalStorageItem'
import service from '@/service'
import type { IBizTkWebsiteListPageModel } from '@/types/Models'
import adImages from '@/assets/images/home_ad_imgs/index.ts'
import Lottery from './_Lottery.vue'

type GameTypeItem = {
  gameType: string
  gameTypeCode: string
  [key: string]: any
}

const NOTICE_TEXT =
  '抢红包啦！下载APP进入聊天室，参与每天准时多场派发红包，500-5000元（随机金额）特码不开红包不停，满100元即可提现！'
const DEFAULT_GAME_TYPE_CODE = 'a6'
const DEFAULT_GAME_TYPE = '2032'
const LIST_SIZE = 12

const props = defineProps<{ isDark?: boolean }>()
const isLoading = ref(false)
const isError = ref(false)
const refreshing = ref(false)
const tabsData = ref<GameTypeItem[]>([])
const listData = ref<IBizTkWebsiteListPageModel[]>([])

const selectedGameTypeCode = ref(
  utils.getLSItem(constants.localStorageKeys.GAME_TYPE_CODE) ?? DEFAULT_GAME_TYPE_CODE
)

const selectTab = (gameTypeCode: string) => {
  if (!gameTypeCode || gameTypeCode === selectedGameTypeCode.value) return

  selectedGameTypeCode.value = gameTypeCode
  setLSItem(constants.localStorageKeys.GAME_TYPE_CODE, gameTypeCode)

  const selectedTab = tabsData.value.find(item => item.gameTypeCode === gameTypeCode)
  if (selectedTab?.gameType) {
    setLSItem(constants.localStorageKeys.GAME_TYPE, selectedTab.gameType)
  }

  fetchWebGuideList(gameTypeCode)
}

const fetchWebGuideList = async (gameTypeCode: string) => {
  if (!gameTypeCode) return

  try {
    isLoading.value = true
    const manageSiteId = await utils.getManageSiteId()
    const res = await service.kv().getAllGamePlatform(gameTypeCode, manageSiteId).do()

    if (res?.[0]?.data) {
      listData.value = res[0].data.slice(0, 12)
    }
  } catch (error) {
    console.error('获取网站指南列表失败:', error)
    isError.value = true
  } finally {
    isLoading.value = false
  }
}

const getGamePlatform = async () => {
  isLoading.value = true

  try {
    const manageSiteId = await utils.getManageSiteId()
    const response = await service.kv().getGamePlatformWithManageSiteId(manageSiteId).do()

    if (!response?.[0]?.data?.length) {
      return
    }

    // 处理游戏数据
    handleGameData(response[0].data)

    // 获取游戏发行信息
    const instance = createIssueRequests(response[0].data)
    const res = await instance.do()

    // 合并数据
    tabsData.value = response[0].data.map((item: any, index: number) => ({
      ...item,
      ...res[index],
    }))
  } catch (error) {
    console.error('获取游戏平台数据失败:', error)
    isError.value = true
  } finally {
    isLoading.value = false
  }
}

const handleGameData = (data: any[]) => {
  // 保存游戏数据到会话
  utils.setSession(constants.sessionStorageKeys.GAME_DATA, JSON.stringify(data))

  // 初始化默认值
  initDefaultGameSettings(data[0])

  // 创建并保存游戏类型映射
  saveGameTypeMap(data)
}

const initDefaultGameSettings = (firstGame: any) => {
  const gameTypeCode = utils.getLSItem(constants.localStorageKeys.GAME_TYPE_CODE)
  const gameType = utils.getLSItem(constants.localStorageKeys.GAME_TYPE)

  if (!gameTypeCode) {
    setLSItem(constants.localStorageKeys.GAME_TYPE_CODE, firstGame.gameTypeCode || 'a6')
  }

  if (!gameType) {
    setLSItem(constants.localStorageKeys.GAME_TYPE, firstGame.gameType || '2032')
  }
}

const saveGameTypeMap = (data: any[]) => {
  const gameTypeMap: Record<string, object> = {}

  data.forEach(item => {
    gameTypeMap[item.gameType] = item
  })

  utils.setSession(constants.sessionStorageKeys.GAME_TYPE_MAP, JSON.stringify(gameTypeMap))
}

const createIssueRequests = (data: any[]) => {
  let instance = service.kv()

  data.forEach(item => {
    instance = instance.getGameIssueCurrent(item.gameTypeCode)
  })

  return instance
}

onMounted(async () => {
  await getGamePlatform()
  await fetchWebGuideList(selectedGameTypeCode.value)
})
</script>

<template>
  <Header :isDark="props.isDark" />

  <StateManager class="gallery" :loading="isLoading" :error="isError" @refresh="getGamePlatform">
    <section class="swipe-container">
      <Swipe :images="adImages" />
    </section>

    <NoticeBar :text="NOTICE_TEXT" class="notice-bar">
      <template #left-icon>
        <Icon name="volume" class="notice-icon" />
      </template>
    </NoticeBar>

    <Lottery
      v-if="tabsData.length"
      :tabsData="tabsData"
      :gameTypeCode="selectedGameTypeCode"
      :isDark="props.isDark"
      @tab-click="selectTab"
    />

    <!-- <Tabs v-if="tabsData.length" :tabsData="tabsData" :gameTypeCode="selectedGameTypeCode" @tab-click="selectTab" /> -->

    <!-- <WaterfallLoad v-if="!refreshing" :game-type-code="selectedGameTypeCode" /> -->
    <div v-else class="waterfallLoad-placeholder"></div>
  </StateManager>
</template>

<style scoped>
.gallery {
  background-color: var(--van-background);
  color: var(--van-text-color);
  padding: 0 20px;
}

.swipe-container {
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  overflow: hidden;
  margin-bottom: 10px;
  margin-top: 20px;
}

/* 使用深度选择器影响组件内部元素 */
.swipe-container :deep(.van-swipe),
.swipe-container :deep(.van-swipe-item) {
  border-radius: 10px 10px 0 0;
}

.notice-bar {
  background-color: var(--van-card-background);
  color: var(--van-text-color);
}

.notice-icon {
  color: var(--van-text-color);
  padding-right: 10px;
}

.waterfallLoad-placeholder {
  min-height: 200px;
}
</style>
