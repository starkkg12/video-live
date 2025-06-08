<script setup lang="ts">
  import { ref } from 'vue'
  import { Image, Button, Icon } from 'vant'

  interface VideoData {
    title: string
    auther: string
    poster: string
    comment_count: number
    collect_count: number
    like_count: number
    create_time: string
  }

  const props = withDefaults(
    defineProps<{
      videoData: VideoData
      showArrow?: boolean
      showAuthor?: boolean
    }>(),
    {
      showArrow: false,
      showAuthor: true,
    }
  )
</script>

<template>
  <div class="video-item">
    <div class="poster">
      <Image :src="videoData.poster" />
    </div>
    <div class="detail">
      <template v-if="showAuthor">
        <div class="title">
          {{ videoData.title }}
          <p class="info">{{ videoData.auther }} {{ videoData.create_time }}</p>
        </div>
        <p class="count">
          <span>{{ videoData.comment_count }} 评论</span>
          <span>{{ videoData.collect_count }} 收藏</span>
          <span>{{ videoData.like_count }} 赞</span>
        </p>
      </template>
      <template v-else>
        <div class="title">
          {{ videoData.title }}
          <p class="count">
            <span>{{ videoData.comment_count }} 评论</span>
            <span>{{ videoData.collect_count }} 收藏</span>
            <span>{{ videoData.like_count }} 赞</span>
          </p>
        </div>
        <p class="info">{{ videoData.create_time }}</p>
      </template>
    </div>
    <div class="icon" v-if="showArrow">
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
      .title {
        font-size: 15px;
        .info {
          font-size: 12px;
        }
      }
      .count {
        span {
          margin-right: 10px;
        }
      }
    }
    .icon {
      width: 20px;
      padding-top: 25px;
    }
  }
</style>
