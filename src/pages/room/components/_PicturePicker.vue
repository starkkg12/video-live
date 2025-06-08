<template>
  <div class="picture-picker" v-if="!showMore">
    <div class="game-type-panel">
      <FloatingGameTypeSelection
        :selected-game-type-code="selectedGame?.gameTypeCode ?? ''"
        @tab-click-get-item="selectGameItem"
      />
    </div>
    <div class="series-panel-wrapper">
      <div class="series-panel" ref="seriesPanelRef">
        <div
          class="series-item"
          :class="{ actived: item.seriesCode === selectedSeries?.seriesCode }"
          v-for="(item, index) in seriesListWithFirstSelected"
          :key="index"
          @click="handleSeriesSelect(item)"
        >
          <ScrollToMyLocation
            :parent="seriesPanelRef"
            :offset="10"
            v-if="!initedScrollLocation && item.seriesCode === selectedSeries?.seriesCode"
          />
          {{ item.seriesName }}
        </div>
      </div>
      <div class="more-button" @click="handleShowMore">+更多</div>
    </div>

    <div class="picture-list" :class="{ 'in-room': scene === SCENE_IN_ROOM }" ref="pictureListRef">
      <List
        class="list"
        :loading="isLoading"
        @load="fetchData"
        :finished-text="!!pictureList?.length ? '没有更多了...' : '没有系列数据'"
        :finished="isFinished"
      >
        <div class="picture-panel-wrapper">
          <div class="picture-panel" v-for="(_, index) in Array.from({ length: 2 })" :key="index">
            <SelectedItemWrapper
              v-for="(item, _index) in pictureList?.filter((_, i) => i % 2 === index)"
              :key="_index"
              :selectedIndex="selectedMax > 1 ? getIndexInSelectedList(item.issueId) : undefined"
              :selected="selectedMax === 1 && getIndexInSelectedList(item.issueId) > -1"
              @click="handleSelectPicture(item)"
            >
              <div class="picture-item">
                <ScrollToMyLocation
                  :parent="pictureListRef"
                  :offset="30"
                  v-if="!initedScrollLocation && selectedMax === 1 && getIndexInSelectedList(item.issueId) > -1"
                />
                <PictureCard :data="item" min-height="160px" />
              </div>
            </SelectedItemWrapper>
          </div>
        </div>
      </List>
    </div>
    <div class="buttons">
      <Button class="button-reset" type="default" @click="reset" block>重置</Button>
      <Button class="button-submit" type="success" @click="confirm" block>提交</Button>
    </div>
  </div>
  <PicturePickerMore
    :selectedGame="selectedGame"
    :selectedYear="selectedYear"
    :selectedSeries="selectedSeries"
    :selectedTotal="listTotal"
    @onSelect="onSelect"
    @onTempSelect="fetchData"
    v-else
  />
</template>

<script lang="ts" setup>
  import service from '@/service'
  import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
  import { Button, List } from 'vant'
  import FloatingGameTypeSelection, { type GameTypeMapItem } from '@/components/FloatingGameTypeSelection.vue'
  import PicturePickerMore from '@/pages/room/components/_PicturePickerMore.vue'
  import PictureCard from './_PictureCard.vue'
  import SelectedItemWrapper from '@/pages/room/components/_SelectedItemWrapper.vue'
  import ScrollToMyLocation from '@/pages/room/components/_ScrollToMyLocation.vue'
  import { useFetchListData, type UseFetchListDataInterface } from 'src/composables/useFetchListData'

  const SIZE = 10
  const SCENE_IN_ROOM = 'in-room'

  const props = withDefaults(
    defineProps<{
      selectedGame?: any
      selectedYear?: any
      selectedSeries?: any
      selectedPicture?: any
      scene?: string
      selectedMax?: number
    }>(),
    {
      selectedMax: 1,
    }
  )

  const emit = defineEmits<{
    onSelect: [item: any]
  }>()

  const selectedGame = ref<GameTypeMapItem | null>(props.selectedGame)
  const selectedYear = ref<any>(props.selectedYear || new Date().getFullYear())
  const selectedSeries = ref<any>(props.selectedSeries)
  const firstSelected = ref<any>(props.selectedSeries)
  const selectedIssue = ref<any>({
    issue: Number(props.selectedPicture?.issue ?? 0),
  })
  const selectedItems = ref<any[]>(props.selectedPicture ? [props.selectedPicture] : [])

  const showMore = ref<boolean>(false)
  const seriesPanelRef = ref()
  const pictureListRef = ref()
  const initedScrollLocation = ref(false)
  const timer = ref<any>()
  const firstSearchInRoom = ref(props.scene === SCENE_IN_ROOM)

  const { fetchList: fetchSeriesList, listData: seriesList }: UseFetchListDataInterface = useFetchListData()
  const {
    fetchList: fetchPictureList,
    listData: pictureList,
    isLoading,
    isFinished,
    listTotal,
  }: UseFetchListDataInterface = useFetchListData()
  const seriesListWithFirstSelected = computed(() => {
    return !firstSelected.value ||
      !!seriesList.value?.find((item: { seriesCode: string }) => item.seriesCode === firstSelected.value.seriesCode)
      ? seriesList.value
      : [firstSelected.value, ...(seriesList.value || [])]
  })

  const onSelect = (data: any) => {
    selectedIssue.value = data.selectedPeriod
    selectedSeries.value = data.selectedSeries
    selectedYear.value = data.selectedYear
    firstSelected.value = data.selectedSeries
    firstSearchInRoom.value = false
    fetchData(true)
    showMore.value = false
    timer.value = setTimeout(() => (initedScrollLocation.value = true), 900)
  }

  const handleShowMore = () => {
    showMore.value = true
    initedScrollLocation.value = false
  }

  const selectGameItem = async (game: GameTypeMapItem, isInit?: boolean) => {
    selectedGame.value = game
    if (!isInit) {
      selectedSeries.value = null
      selectedIssue.value = null
      firstSelected.value = null
    }
    await getSerialList(isInit)
  }
  const handleSeriesSelect = async (item: any, isInit?: boolean) => {
    selectedSeries.value = item
    if (!isInit) {
      selectedIssue.value = null
      reset()
    }
    fetchData(true)
  }
  const reset = () => {
    selectedItems.value = []
  }

  const handleSelectPicture = (item: any) => {
    const indexInSelectedList = getIndexInSelectedList(item.issueId)
    if (indexInSelectedList > -1) {
      selectedItems.value.splice(indexInSelectedList, 1)
    } else if (selectedItems.value.length < props.selectedMax) {
      selectedItems.value.push(item)
    } else if (props.selectedMax === 1) {
      selectedItems.value = [item]
    }
  }

  const getIndexInSelectedList = (issueId: string) => {
    const reslut = selectedItems.value.findIndex((item: any) => item.issueId === issueId)
    return reslut
  }

  const confirm = () => {
    emit('onSelect', {
      selectedGame: selectedGame.value,
      selectedSeries: selectedSeries.value,
      selectedIssue: selectedIssue.value,
      ...(props.selectedMax === 1
        ? { selectedPicture: selectedItems.value[0] }
        : { selectedItems: selectedItems.value }),
    })
  }

  const fetchData = async (isNew?: boolean, tempData: Record<string, any> = {}) => {
    const gameType = selectedGame.value?.gameType
    const seriesCode = selectedSeries.value?.seriesCode
    if (!gameType || (!seriesCode && !selectedIssue.value)) return

    fetchPictureList({
      fetchFn: service.newspaper.getNewspaperList,
      fetchParams: {
        gameType: Number(gameType),
        seriesCode: seriesCode,
        year: selectedYear.value,
        sortName: 'issue',
        ...(firstSearchInRoom.value || !selectedIssue.value?.issue ? {} : { issue: selectedIssue.value.issue }),
        ...tempData,
      },
      size: SIZE,
      isNew,
      needCache: true,
    })
  }

  const getSerialList = async (isInit?: boolean) => {
    const gameType = selectedGame.value?.gameType
    if (gameType) {
      await fetchSeriesList({
        fetchFn: service.newspaper.gameTypeNewspaperSeriesCount,
        fetchParams: {
          gameType,
          sortName: 'sort_no',
          sortOrder: 'DESC',
        },
        isNew: true,
      })
      handleSeriesSelect(selectedSeries.value || (seriesList?.value ?? [])[0], isInit)
    }
  }

  watch(
    () => !firstSelected.value?.seriesName && !!pictureList.value && pictureList.value[0],
    newValue => {
      if (newValue && firstSelected.value?.seriesCode === newValue.seriesCode) {
        firstSelected.value = newValue
        selectedSeries.value = newValue.seriesCode === selectedSeries.value.seriesCode ? newValue : selectedSeries.value
      }
    }
  )

  onMounted(() => {
    selectGameItem(props.selectedGame, true)
    timer.value = setTimeout(() => (initedScrollLocation.value = true), 900)
  })

  onBeforeUnmount(() => {
    timer.value && clearTimeout(timer.value)
  })
</script>

<style scoped lang="less">
  @bg-color: #fafafa;
  @text-primary: #434343;
  @text-grey: #aeaeb1;
  @button-default: #f2f2f2;
  @text-green: #34c759;

  .picture-picker {
    padding: 8px 0;
    background-color: @bg-color;
    height: 100%;
    .picture-list {
      max-height: calc(100% - 160px);
      min-height: calc(100% - 160px);
      overflow-x: hidden;
      overflow-y: auto;
      padding: 8px;
      margin-top: 8px;
      padding-top: var(--safe-area-top);
      padding-bottom: var(--safe-area-bottom);
    }
    .game-type-panel {
      padding: 0 8px;
    }
    .picture-panel-wrapper {
      display: flex;
      gap: 8px;
    }
    .picture-panel {
      width: 50%;
      .picture-item {
        margin-bottom: 8px;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0px 0px 8px 0px #0000001a;
        &.actived {
          position: relative;
          &::before {
            content: ' ';
            border: 5px solid @text-green;
            position: absolute;
            width: 100%;
            height: 100%;
            z-index: 3;
          }
          // .checked {
          //   position: absolute;
          //   right: 4px;
          //   top: 4px;
          // }
        }
        .van-image {
          min-height: 50px;
        }
        .picture-name {
          font-size: 16px;
          font-weight: 600;
          display: -webkit-box; /* 必须设置用于多行省略 */
          -webkit-box-orient: vertical; /* 指定方向为垂直 */
          overflow: hidden; /* 超出部分隐藏 */
          text-overflow: ellipsis; /* 文本溢出时显示省略号 */
          -webkit-line-clamp: 2; /* 限制显示的行数 */
          line-height: 1.2; /* 行高可调 */
          max-height: calc(1.5em * 2); /* 控制最大高度，两行时为2倍行高 */
          padding: 6px 12px 0 10px;
          width: 100%;
          text-align: left;
        }
        .picture-series-like {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          padding: 4px 10px 8px;
          color: @text-grey;
          font-size: 14px;
          .picture-series {
          }
          .picture-like {
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }
      }
    }
    .buttons {
      display: flex;
      justify-content: space-between;
      width: 100%;
      margin-top: 16px;
      padding: 0 8px;
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
    .wrapper--floating-game-type-selection {
      position: relative;
      bottom: 0;
      left: 0;
      box-shadow: none;
    }

    .series-panel-wrapper {
      position: relative;
      margin-top: 16px;
      .more-button {
        position: absolute;
        right: 0;
        top: 0;
        white-space: nowrap;
        height: 41px;
        line-height: 41px;
        background-color: #fff;
        padding: 0 8px;
        color: @text-green;
      }
    }
    .series-panel {
      display: flex;
      gap: 16px;
      overflow-y: hidden;
      overflow-x: auto;
      white-space: nowrap;
      padding: 8px 16px;
      border-radius: 8px 8px 0 0;
      box-shadow: 0px -2px 12px 0px #0000001a;
      padding-right: 70px;
      background-color: #fff;
      .series-item {
        color: @text-grey;
        &.actived {
          color: @text-primary;
          font-weight: 900;
        }
      }
    }
    .issue-list {
      display: flex;
      gap: 10px;
      overflow-y: hidden;
      overflow-x: auto;
      white-space: nowrap;
      padding: 8px 0;
      .issue-item {
        &.actived {
          color: @text-green;
          font-weight: 900;
          border: 1px solid @text-green;
          padding: 0 8px;
          border-radius: 4px;
        }
      }
    }
  }
</style>
