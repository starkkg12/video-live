<script setup lang="ts">
  import LotteryCard from './_LotteryCard.vue'
  import StateManager from '@/components/StateManager.vue'
  import FloatingGameTypeSelection, { type GameTypeMapItem } from '@/components/FloatingGameTypeSelection.vue'

  import service from '@/service'
  import utils from '@/utils'
  import {
    Popup as VanPopup,
    Button,
    Button as VanButton,
    DropdownMenu as VanDropdownMenu,
    DropdownItem as VanDropdownItem,
    Empty as VanEmpty,
    Picker as VanPicker,
    NavBar,
  } from 'vant'

  import { computed, onMounted, ref } from 'vue'
  import { useFetchListData, type UseFetchListDataInterface } from 'src/composables/useFetchListData'

  const props = withDefaults(
    defineProps<{
      room: any
    }>(),
    {
      room: null,
    }
  )
  const emit = defineEmits<{
    close: [type?: 'all']
  }>()

  const showPicker = ref(false)
  const selectedGame = ref<GameTypeMapItem | null>(utils.getGameByTypeOrCode({ gameType: '2032' }))
  const value1 = ref(0)
  const isAscending = ref(true)
  const isGray = ref(false)
  // 当前日期
  const currentYear = ref(new Date().getFullYear())
  const { fetchList, listData: lotteryDatesList, isLoading, isError }: UseFetchListDataInterface = useFetchListData()
  const selectedLottery = ref<any>(null)

  const sortType = computed(() => {
    return value1.value === 1 ? 'asc' : value1.value === 2 ? 'desc' : undefined
  })

  const option1 = [
    { text: '默认', value: 0 },
    { text: '平码升序', value: 1 },
    { text: '平码降序', value: 2 },
  ]

  const toggleOrder = () => {
    isAscending.value = !isAscending.value
    lotteryDatesList.value?.reverse()
  }

  const toggleGray = () => {
    isGray.value = !isGray.value
  }

  const openYearPicker = () => {
    showPicker.value = true
  }

  const handleSelectLottery = (item: any) => {
    selectedLottery.value = item
  }

  const reset = () => {
    value1.value = 0
    isAscending.value = true
    isGray.value = false
    selectedLottery.value = null
  }
  const confirm = () => {
    if (!selectedLottery.value) return
    const { issue, openTime, result } = selectedLottery.value
    props.room.wsClient.value.sendText(
      JSON.stringify({
        gameType: selectedGame.value?.gameType,
        recordTime: openTime,
        issue,
        openNo: result,
      }),
      4
    )
    emit('close', 'all')
  }

  const getGameResultHistory = async () => {
    fetchList({
      fetchFn: ({ gameTypeCode, currentYear }) => service.kv().getGameResultHistory(gameTypeCode, currentYear),
      fetchParams: {
        gameTypeCode: selectedGame.value?.gameTypeCode ?? '',
        currentYear: currentYear.value.toString(),
      },
      isKv: true,
      needCache: true,
    })
  }

  // 生成从当前年份到之前五年的年份数据
  const columns = Array.from({ length: 5 }, (_, i) => {
    const year = currentYear.value - i
    return { text: `${year}年`, value: year.toString() }
  })

  const handleSelectGameItem = async (game: GameTypeMapItem, isInit?: boolean) => {
    selectedGame.value = game
    getGameResultHistory()
  }

  const onConfirmPicker = ({ selectedValues }: { selectedValues: number[] }) => {
    currentYear.value = selectedValues[0]
    getGameResultHistory()
    showPicker.value = false
  }
  const onCancel = () => {
    showPicker.value = false
  }

  onMounted(async () => {
    getGameResultHistory()
  })
</script>

<template>
  <NavBar
    safe-area-inset-top
    placeholder
    class="nav-bar"
    title="历史开奖"
    left-arrow
    @click-left="emit('close')"
  ></NavBar>
  <div class="height-without-nav-bar">
    <StateManager :loading="isLoading" :error="isError">
      <div class="wrapper">
        <div class="current-year" @click="openYearPicker">{{ currentYear }}年</div>
        <div class="game-type-panel">
          <FloatingGameTypeSelection
            :selected-game-type-code="selectedGame?.gameTypeCode ?? ''"
            @tab-click-get-item="handleSelectGameItem"
          />
        </div>
        <section class="order">
          <p>{{ currentYear }}年开奖记录</p>
          <div class="order-btn">
            <van-button round size="mini" type="success" @click="toggleOrder">
              {{ isAscending ? '降序' : '升序' }}
            </van-button>
            <van-button round size="mini" :type="isGray ? 'default' : 'success'" @click="toggleGray">五行</van-button>
            <van-button round size="mini" type="success" color="#07c160">
              <div>
                <van-dropdown-menu :overlay="false" size="mini" active-color="#07c160">
                  <van-dropdown-item v-model="value1" :options="option1" />
                </van-dropdown-menu>
              </div>
            </van-button>
          </div>
        </section>

        <div class="lottery-content">
          <!-- 历史开奖列表部分 -->
          <van-empty v-if="lotteryDatesList?.length === 0" description="暂无数据" />
          <section
            v-else
            class="lottery"
            :class="{ actived: selectedLottery?.issue === item.issue }"
            v-for="(item, index) in lotteryDatesList"
            :key="index"
            @click="handleSelectLottery(item)"
          >
            <LotteryCard v-if="item.numInfo" :data="item" :noFiveElements="isGray" :sortType="sortType" />
          </section>
        </div>

        <div class="buttons">
          <Button class="button-reset" type="default" @click="reset" block>重置</Button>
          <Button class="button-submit" type="success" @click="confirm" block>提交</Button>
        </div>

        <!-- 选择年月部分 -->
        <section>
          <van-popup v-model:show="showPicker" position="bottom">
            <van-picker title="选择年" :columns="columns" @confirm="onConfirmPicker" @cancel="onCancel" />
          </van-popup>
        </section>
      </div>
    </StateManager>
  </div>
</template>

<style lang="less" scoped>
  @text-green: #34c759;
  @button-default: #f2f2f2;
  .wrapper {
    background-color: #f8f8f8;
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    .game-type-panel {
      padding: 8px;
      .wrapper--floating-game-type-selection {
        position: relative;
        bottom: 0;
        left: 0;
      }
    }
    .current-year {
      position: absolute;
      right: 0;
      top: -46px;
      z-index: 999;
      background-color: #fff;
      padding: 0 8px;
      height: 40px;
      line-height: 46px;
      color: @text-green;
      font-weight: 600;
      font-size: 14px;
    }
    .lottery-content {
      height: 100%;
      overflow-y: auto;
      padding: 0 8px;
    }
    .buttons {
      display: flex;
      justify-content: space-between;
      width: 100%;
      padding: 8px;
      gap: 8px;
      .button-reset,
      .button-submit {
        border-radius: 8px;
      }
      .button-reset {
        background-color: @button-default;
        border: none;
      }
      :deep(.van-button__text) {
        font-size: 18px;
        font-weight: 600;
      }
    }
  }

  .wrapper :deep(.van-dropdown-item) {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .wrapper :deep(.van-dropdown-item .van-popup) {
    max-width: 600px;
    margin-left: calc(max(50%, 300px) - 300px);
  }
  // 开奖日特殊样式
  :deep(.lottery-day) {
    display: flex;
    align-self: center;
    color: #fff;
    border-radius: var(--van-radius-md);
    background-color: #07c160;
    width: 14.285%;
    box-shadow: 0.125rem 0.125rem 0.3rem #eee;
  }

  :deep(.van-tabs__content) {
    padding: 1rem;
  }

  .order {
    display: flex;
    justify-content: space-between;
    padding: 8px;
    p {
      font-size: 0.9rem;
    }
    .order-btn {
      display: flex;
      gap: 0.5rem;
      :deep(.van-button--default) {
        background-color: #e2e2e2;
      }
    }
  }

  .lottery {
    margin-top: 8px;

    &.actived {
      position: relative;
      &::before {
        content: ' ';
        border: 5px solid @text-green;
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: 3;
        border-radius: 8px;
      }
    }
  }

  /* button和select样式 */
  :deep(.van-button__content) {
    overflow: hidden;
  }
  :deep(.van-button--mini) {
    padding: 0px 10px;
  }
  :deep(.van-dropdown-menu__bar) {
    background-color: inherit;
    color: #fff;
    font-size: 0.5rem;
  }
  :deep(.van-dropdown-menu__title) {
    font-size: 0.625rem;
    color: #fff;
  }

  :deep(.van-dropdown-menu__title .van-ellipsis) {
    color: white;
  }
</style>
