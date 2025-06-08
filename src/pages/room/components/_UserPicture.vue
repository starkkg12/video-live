<template>
  <div class="user-picture">
    <List
      class="list-for-picture"
      :class="{ 'long-list': showLongList }"
      @load="initData"
      :loading="isLoading"
      :finished="isFinished"
      finished-text="没有更多了..."
    >
      <div class="picture-item" v-for="(item, index) in listData" :key="index">
        <AsyncImage :src="utils.getImageUrl(item.issueDTO.imgPath)" alt="" />
        <div class="picture-item-label">{{ item.issueDTO.newspaperName }}</div>
      </div>
      <IntersectionObserver @change="handleObserver" />
    </List>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, ref } from 'vue'
  import { Image as VanImage, List } from 'vant'
  import utils from '@/utils'
  import service from '@/service'
  import IntersectionObserver from '@/components/IntersectionObserver.vue'
  import { useFetchListData, type UseFetchListDataInterface } from 'src/composables/useFetchListData'
  import AsyncImage from '@/components/AsyncImage.vue'

  const props = withDefaults(
    defineProps<{
      userId?: string
      showLongList?: boolean
    }>(),
    {
      userId: '',
      showLongList: false,
    }
  )

  const emits = defineEmits<{
    changeLongList: [boolean]
  }>()

  const { fetchList, listData, isLoading, isFinished }: UseFetchListDataInterface = useFetchListData()

  const handleObserver = (isShow: boolean) => {
    emits('changeLongList', !isShow)
  }

  const initData = async () => {
    await fetchList({
      fetchFn: service.room.getRoomList,
      fetchParams: {
        userId: props.userId,
      },
    })
  }

  onMounted(() => {
    // initData()
  })
</script>

<style scoped lang="less">
  .user-picture {
    padding: 8px 0;
    .list-for-picture {
      height: 160px;
      overflow-x: hidden;
      overflow-y: auto;
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      transition: height 0.3s ease-in;
      .picture-item {
        width: calc(33.3% - 8px);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        border-radius: 8px;
        background-color: #fff;
        box-shadow: 0 0 3px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        .van-image {
          width: 100%;
          height: 120px;
          img {
            object-fit: cover;
            width: 100%;
            height: 100%;
          }
        }
        .picture-item-label {
          height: 30px;
          line-height: 30px;
          font-size: 14px;
        }
      }
      &.long-list {
        height: calc(100vh - 160px);
      }
    }
  }
</style>
