<template>
  <div class="picture-picker-more">
    <div class="title-label">
      期数
      <div class="years-panel">
        <div
          v-for="(item, index) in years"
          :key="index"
          :class="{ actived: selectedYear === item }"
          @click="selectYear(item)"
        >
          {{ item }}
        </div>
      </div>
    </div>
    <div class="period-panel">
      <div class="more" v-if="showMorePeriods" @click="showMorePeriods = !showMorePeriods">-收起</div>
      <div
        v-for="(item, index) in periodsList"
        :key="index"
        :class="{ actived: selectedPeriod?.issue === item.issue }"
        @click="selectPeriod(item)"
      >
        {{ truncateString(item.issue) }}
      </div>
      <div class="more" v-if="!showMorePeriods" @click="showMorePeriods = !showMorePeriods">+更多</div>
    </div>
    <div class="title-label">图纸系列</div>
    <div class="search-series"><van-field v-model="keyword" left-icon="search" placeholder="请输入系列名称" /></div>
    <List
      class="series-panel"
      :loading="isLoading"
      @load="loadPeriods"
      :finished="isFinished"
      finished-text="没有更多了..."
    >
      <div class="more" @click="showMoreSeries = !showMoreSeries" v-if="showMoreSeries">-收起</div>
      <template v-for="(item, index) in seriesList" :key="index">
        <div
          v-if="index === 0 || item.seriesCode !== firstSelected.seriesCode"
          :class="{ actived: selectedSeries?.seriesCode === item.seriesCode }"
          @click="selectSeries(item)"
        >
          <span class="series-name">{{ item.seriesName }}</span>
          <span class="series-number">({{ index === 0 ? selectedTotal : item.issueSize }})</span>
        </div>
      </template>
      <div
        class="more"
        @click="showMoreSeries = !showMoreSeries"
        v-if="!isLoading && !showMoreSeries && allSeriesList?.length > 8"
      >
        +更多
      </div>
    </List>
  </div>
  <div class="bottom-buttons">
    <Button class="button-reset" type="default" @click="reset" block>重置</Button>
    <Button class="button-submit" type="success" @click="confirm" block>提交</Button>
  </div>
</template>

<script lang="ts" setup>
  import service from '@/service'
  import { ref, onMounted, computed, watch } from 'vue'
  import { Button, Field as VanField, List } from 'vant'
  import { useFetchListData, type UseFetchListDataInterface } from 'src/composables/useFetchListData'

  const PAGE_SIZE = 10
  const props = defineProps<{
    selectedGame?: any
    selectedYear?: any
    selectedSeries?: any
    selectedTotal?: number
  }>()

  const selectedYear = ref<number>(props.selectedYear || new Date().getFullYear())
  const allPeriodsList = ref<any[]>([])
  const selectedPeriod = ref<any>(null)
  const showMorePeriods = ref<boolean>(false)
  const seriesList = ref<any[]>([])
  const selectedSeries = ref<any>(props.selectedSeries)
  const firstSelected = ref<any>(props.selectedSeries)
  const showMoreSeries = ref<boolean>(false)
  const keyword = ref<string>('')
  const finalKeyword = ref<string>('')
  const { fetchList, listData: allSeriesList, isLoading, isFinished }: UseFetchListDataInterface = useFetchListData()

  let timer: any = null

  const emit = defineEmits<{
    onSelect: [item: any]
    onTempSelect: [isNew: boolean, tempData: any]
  }>()

  const years = computed(() => {
    const currentYear = new Date().getFullYear()
    return [currentYear, currentYear - 1, currentYear - 2, currentYear - 3]
  })

  const periodsList = computed(() => {
    return showMorePeriods.value ? allPeriodsList.value : allPeriodsList.value.slice(0, 7)
  })

  const truncateString = (str: string): string => {
    if (str && str.length >= 5) {
      return str.slice(4)
    }
    return str
  }

  const selectPeriod = async (item?: any) => {
    selectedPeriod.value = item && selectedPeriod.value?.issue === item.issue ? null : item
    showMoreSeries.value = false
    firstSelected.value = selectedSeries.value
    loadPeriods(true)
    emit('onTempSelect', true, {
      year: selectedYear.value,
      issue: selectedPeriod.value?.issue,
      seriesCode: selectedSeries.value.seriesCode,
    })
  }
  const loadPeriods = async (isNew: boolean = false) => {
    if (!isNew && allSeriesList.value?.length && !showMoreSeries.value) return
    if (isNew) showMoreSeries.value = false
    await fetchList({
      fetchFn: service.newspaper.gameTypeNewspaperSeriesCount,
      fetchParams: {
        gameType: props.selectedGame?.gameType,
        year: selectedYear.value,
        ...(selectedPeriod.value?.issue ? { issue: selectedPeriod.value?.issue } : {}),
        sortName: 'sort_no',
        sortOrder: 'DESC',
        seriesName: finalKeyword.value,
      },
      size: PAGE_SIZE,
      isNew,
    })
  }

  const selectSeries = async (item: any) => {
    selectedSeries.value = item
  }

  const reset = () => {
    selectedPeriod.value = null
    selectedSeries.value = null
    selectPeriod()
  }

  const confirm = () => {
    emit('onSelect', {
      selectedYear: selectedYear.value,
      selectedPeriod: selectedPeriod.value,
      selectedSeries: selectedSeries.value,
    })
  }

  const selectYear = async (year: number) => {
    showMorePeriods.value = false
    selectedYear.value = year
    firstSelected.value = selectedSeries.value
    const gameTypeCode = props.selectedGame?.gameTypeCode
    const latestOne: { nextIssue: string }[] | null =
      selectedYear.value === new Date().getFullYear()
        ? await service.kv().getGameIssueNextIssueInfo(gameTypeCode).do()
        : []
    const response = await service.kv().getGameResultHistory(gameTypeCode, selectedYear.value.toString()).do()
    allPeriodsList.value = [...(latestOne[0] ? [{ issue: latestOne[0].nextIssue }] : []), ...(response[0]?.data || [])]
    selectPeriod()
    emit('onTempSelect', true, {
      year: selectedYear.value,
      issue: '',
      seriesCode: selectedSeries.value.seriesCode,
    })
  }

  watch([allSeriesList, showMoreSeries], () => {
    const _allSeriesList = allSeriesList.value || []
    let result = _allSeriesList.length >= PAGE_SIZE ? [firstSelected.value, ..._allSeriesList] : _allSeriesList
    finalKeyword.value && (result = result.filter((item: any) => item.seriesName.indexOf(finalKeyword.value) !== -1))
    seriesList.value = showMoreSeries.value ? result : result.slice(0, 8)
  })

  watch([keyword], () => {
    timer && clearTimeout(timer)
    timer = setTimeout(() => {
      finalKeyword.value = keyword.value
      loadPeriods(true)
    }, 300)
  })

  watch([showMoreSeries], () => {
    if (showMoreSeries.value) {
      loadPeriods()
    }
  })

  onMounted(() => {
    selectYear(selectedYear.value)
  })
</script>

<style scoped lang="less">
  @import '@/styles/variables.less';

  .picture-picker-more {
    padding: 0 12px 12px;
    height: calc(100% - 56px);
    .title-label {
      display: flex;
      align-items: center;
      color: @text-primary;
      font-size: 16px;
      font-weight: 600;
      padding: 4px 0;
      gap: 8px;
    }
    .years-panel {
      display: flex;
      align-items: center;
      gap: 8px;
      & > div {
        color: @text-grey;
        font-weight: 600;
        &.actived {
          color: @text-green;
        }
      }
    }
    .period-panel,
    .series-panel {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      padding: 4px 0 12px;
      max-height: calc(50% - 50px);
      overflow-x: hidden;
      overflow-y: auto;
      & > div {
        width: calc(25% - 6px);
        text-align: center;
        background-color: @bg-grey;
        border-radius: 8px;
        color: @text-secondary;
        height: 30px;
        line-height: 28px;
        border: 1px solid transparent;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        padding: 0 8px;
        &.actived {
          color: @text-green;
          background-color: @bg-actived;
          border-color: @text-green;
          font-weight: 600;
        }
        &.more {
          background-color: transparent;
          border-color: @bg-grey;
          font-size: 14px;
          justify-content: center;
        }
      }
      &.series-panel {
        & > div {
          width: calc(33.3% - 6px);
          display: flex;
          align-items: baseline;

          .series-name {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .series-number {
            font-size: 11px;
            color: @text-tag;
          }
        }
        :deep(.van-list__finished-text) {
          width: 100%;
        }
        :deep(.van-list__loading) {
          width: 100%;
        }
      }
    }
    .search-series {
      padding: 4px 0;
      :deep(.van-field) {
        background-color: @bg-grey;
        border-radius: 20px;
        padding: 4px 16px;
      }
    }
  }
</style>
