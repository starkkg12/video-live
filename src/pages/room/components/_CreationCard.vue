<template>
  <div class="creation-card">
    <AsyncImage :src="utils.getImageUrl(data.attachments[0]?.url)" alt="" />
    <h5 class="creation-title">{{ data.title }}</h5>
    <div class="creation-name-like">
      <AvatarsPro :src="data?.avatar ?? ''" size="22px" />
      <span class="creation-name">{{ utils.getNickname(data.nickname, data.postUserId) }}</span>
      <span class="creation-like">
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
  import AvatarsPro from '@/pages/room/components/_AvatarsPro.vue'
  import AsyncImage from '@/components/AsyncImage.vue'

  const props = defineProps<{
    data: any
    selectedIndex?: number
  }>()
</script>

<style scoped lang="less">
  @import '@/styles/variables.less';

  .creation-card {
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    box-shadow: 0px 0px 8px 0px #0000001a;
    border-radius: 8px;
    overflow: hidden;
    .van-image {
      min-height: 50px;
    }
    .creation-title {
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
    .creation-name-like {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 4px 10px 8px;
      color: @text-grey;
      font-size: 14px;
      gap: 4px;
      .creation-name {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        width: 100%;
        text-align: left;
      }
      .creation-like {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }
</style>
