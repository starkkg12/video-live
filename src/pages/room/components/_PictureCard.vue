<template>
  <div class="picture-card" :style="{ minHeight: minHeight || 0 }">
    <div class="picture-card-image">
      <AsyncImage :src="utils.getImageUrl(data.imgPath || data.imgUrl)" alt="" />
    </div>
    <h5 class="picture-name">{{ data.newspaperName || data.newsPaperName }}</h5>
    <div class="picture-series-like">
      <span class="picture-series">{{ data.seriesName }}</span>
      <span class="picture-like">
        <van-icon :name="heartIcon.src" size="14" />
        {{ utils.numberFormat(data.likeCount || 0) }}
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { Image as VanImage, Icon as VanIcon } from 'vant'
  import utils from '@/utils'
  import heartIcon from '@/assets/icons/room/heart.svg'
  import AsyncImage from '@/components/AsyncImage.vue'

  const props = defineProps<{
    data: any
    minHeight?: string
  }>()
</script>

<style scoped lang="less">
  @text-grey: #aeaeb1;
  .picture-card {
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    box-shadow: 0px 0px 8px 0px #0000001a;
    border-radius: 8px;
    overflow: hidden;
    .picture-card-image {
      min-height: 60px;
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
</style>
