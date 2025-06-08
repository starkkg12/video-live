<template>
  <div class="serial-picker">
    <div class="search-title">图纸系列</div>
    <div class="search-container">
      <van-field
        type="text"
        placeholder="请输入系列名称"
        left-icon="search"
        class="search-input"
        v-model="keyword"
        @input="handleSearch"
      />
      <!-- <Button class="search-button" type="success" size="small" @click="handleSearch">搜索</Button> -->
    </div>

    <List
      class="list"
      :loading="isLoading"
      @load="loadPeriods"
      :finished="isFinished"
      :finished-text="listData?.length ? '没有更多了...' : '没有系列数据'"
    >
      <div class="serial-panel">
        <div
          class="serial-item"
          :class="{ actived: item.seriesCode === selectedItem?.seriesCode }"
          v-for="(item, index) in listData"
          :key="index"
          @click="handleSelect(item)"
        >
          <span class="series-name">{{ item.seriesName }}</span>
          <span class="series-number">({{ item.issueSize }})</span>
        </div>
      </div>
    </List>
    <div class="buttons">
      <Button class="button-reset" type="default" :disabled="!listData?.length" @click="reset">重置</Button>
      <Button class="button-submit" type="success" :disabled="!listData?.length" @click="confirm">确认</Button>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import service from '@/service'
  import { ref, onMounted, watch } from 'vue'
  import { Button, Field as VanField, List } from 'vant'
  import { useFetchListData, type UseFetchListDataInterface } from 'src/composables/useFetchListData'

  const props = defineProps<{
    selectedGame: any
    gameType?: string
  }>()

  const emit = defineEmits<{
    onSelect: [item: string]
  }>()

  const selectedItem = ref<any>(null)
  const keyword = ref('')
  const { fetchList, listData, isLoading, isFinished }: UseFetchListDataInterface = useFetchListData()

  const searchTimeout = ref<any>(null)

  const reset = () => {
    selectedItem.value = null
  }
  const handleSelect = (item: any) => {
    selectedItem.value = item
  }

  const confirm = () => {
    emit('onSelect', selectedItem.value)
  }

  const handleSearch = () => {
    searchTimeout.value && clearTimeout(searchTimeout.value)
    searchTimeout.value = setTimeout(() => {
      loadPeriods(true)
      searchTimeout.value = null
    }, 300)
  }

  const loadPeriods = async (isNew: boolean = false) => {
    if (!props.selectedGame) return
    fetchList({
      fetchFn: service.newspaper.gameTypeNewspaperSeriesCount,
      fetchParams: {
        gameType: props.selectedGame?.gameType,
        sortName: 'sort_no',
        sortOrder: 'DESC',
        seriesName: keyword.value,
      },
      size: 50,
      isNew,
      needCache: true,
    })
  }

  watch(
    () => props.selectedGame,
    () => {
      loadPeriods()
    }
  )

  onMounted(() => {
    loadPeriods()
  })
</script>

<style scoped lang="less">
  @import '@/styles/variables.less';

  .serial-picker {
    position: relative;
    padding: 8px;
    .list {
      height: 60vh;
      overflow: auto;
      overflow-y: auto;
      overflow-x: hidden;
    }
    .serial-panel {
      display: flex;
      flex-flow: wrap;
      gap: 8px;
      .serial-item {
        width: calc(33.33% - 6px);
        background-color: #f2f2f2;
        border-radius: 8px;
        height: 36px;
        line-height: 36px;
        border: 1px solid #f2f2f2;
        padding: 0 8px;
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
        &.actived {
          border-color: @text-green;
          color: @text-green;
          font-weight: 900;
          .series-number {
            color: @text-green;
          }
        }
      }
    }
    .buttons {
      display: flex;
      justify-content: space-between;
      width: 100%;
      margin-top: 16px;
      gap: 8px;
      .button-reset {
        width: 33.33%;
      }
      .button-submit {
        width: 66.66%;
      }
    }
    .no-data {
      color: #ccc;
      text-align: center;
      padding: 8px 0 16px;
    }
  }

  .search-container {
    display: flex;
    align-items: center;
    font-family: Noto Sans;
    gap: 8px;
    margin-bottom: 8px;
  }

  .search-input {
    background-color: @bg-grey;
    border-radius: 20px;
    font-size: 14px;
    color: #666;
    outline: none;
    transition: border-color 0.3s;
    padding: 4px 12px;

    &:focus {
      border-color: #4caf50; // 绿色边框
    }
    &::after {
      display: none;
    }
  }

  // .search-button {
  //   background-color: #4caf50; // 绿色背景
  //   color: white;
  //   border: none;
  //   border-radius: 20px;
  //   font-size: 15px;
  //   cursor: pointer;
  //   transition: background-color 0.3s;
  //   padding: 4px 16px;
  //   white-space: nowrap;
  //   font-weight: 600;

  //   &:hover {
  //     background-color: #45a049; // 深绿色背景
  //   }
  // }
  .search-title {
    font-family: Noto Sans;
    font-weight: 600;
    font-size: 16px;
    color: @text-primary;
    margin-bottom: 4px;
  }
</style>
