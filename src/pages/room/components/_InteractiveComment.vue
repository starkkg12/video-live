<template>
  <NavBar safe-area-inset-top placeholder class="nav-bar" title="看图解">
    <template #right>
      <van-icon name="cross" size="24" color="#434343" @click="emit('close')" />
    </template>
  </NavBar>
  <div class="interactive-comment">
    <div class="interactive-comment-no-issueId" v-if="!props.room.info.value.issueId">请先选择图纸</div>
    <List
      v-else
      class="interactive-comment-list"
      :loading="isLoading"
      @load="initData"
      finished-text="没有更多了..."
      :finished="isFinished"
    >
      <div class="item" v-for="(item, index) in listData" :key="index">
        <span class="label">图解：</span>
        <span v-html="item.postContent" />
      </div>
    </List>
  </div>
</template>

<script lang="ts" setup>
  import { List, Icon as VanIcon, NavBar } from 'vant'
  import service from '@/service'
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

  const { fetchList, listData, isLoading, isFinished }: UseFetchListDataInterface = useFetchListData()

  const initData = async () => {
    fetchList({
      fetchFn: service.bbs.getBBSDiagram,
      fetchParams: {
        issueId: props.room.info.value.issueId,
      },
    })
  }
</script>

<style scoped lang="less">
  @import '@/styles/variables.less';

  .interactive-comment {
    background-color: #fff;
    .interactive-comment-no-issueId {
      font-size: 16px;
      padding: 20px 0;
      text-align: center;
      color: @text-grey;
    }
    .interactive-comment-list {
      max-height: 70vh;
      overflow-y: auto;
      padding: 8px 0 0;
      .item {
        padding: 10px 12px;
        line-height: 20px;
        border-radius: 8px;
        margin: 0 8px 8px;
        box-shadow: 0px 0px 8px 0px #0000001a;
        .label {
          color: #30c656;
          font-size: 16px;
          font-weight: 900;
        }
      }
    }
  }
</style>
