<script setup lang="ts">
  import { ref } from 'vue'
  import { Image, Icon } from 'vant'

  interface userData {
    auther: string
    poster: string
    comment_count: number
    collect_count: number
    like_count: number
    create_time: string
  }

  const props = defineProps<{
    userData: userData
  }>()
</script>

<template>
  <div class="video-item">
    <div class="poster">
      <Image :src="userData.poster" />
    </div>
    <div class="detail">
      <div class="title">
        {{ userData.auther }}
      </div>
      <p class="count">
        <span>{{ userData.comment_count }} 评论</span>
        <span>{{ userData.collect_count }} 收藏</span>
        <span>{{ userData.like_count }} 赞</span>
      </p>
    </div>
    <div class="icon">
      <Icon name="arrow" size="20px" color="#999" />
    </div>
  </div>
</template>

<style lang="less" scoped>
  .video-item {
    padding: 15px 0;
    border-bottom: solid 1px #ccc;
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    .poster {
      width: 60px;
      margin-right: 10px;
    }
    .detail {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 10px 0;
      .title {
        font-size: 15px;
      }
    }
    .count {
      span {
        margin-right: 10px;
      }
    }
    .icon {
      width: 20px;
      padding-top: 25px;
    }
  }
</style>
