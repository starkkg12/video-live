<script setup lang="ts">
  import { ref } from 'vue'
  import { Image } from 'vant'

  interface VideoData {
    title: string
    auther: string
    poster: string
    comment_count: number
    collect_count: number
    like_count: number
    create_time: string
    avatar: string
  }

  const props = withDefaults(
    defineProps<{
      videoData: VideoData
    }>(),
    {}
  )
</script>

<template>
  <div class="video-item">
    <div class="poster">
      <Image :src="videoData.poster" />
    </div>
    <div class="video-info">
      <div class="title">
        {{ videoData.title }}
      </div>
      <div class="video-desc">
        <p class="info">
          <Image :src="videoData.avatar" round />
          {{ videoData.auther }}
        </p>
        <span class="count">
          <span class="material-icons-outlined">favorite</span>
          {{ videoData.like_count }}
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
  .video-item {
    position: relative;
    width: 100%;
    aspect-ratio: 9/11;
    overflow: hidden;
    font-size: 13px;
    color: #fff;
    text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.8);
    .poster {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      .van-image {
        width: 100%;
        object-fit: contain;
      }
    }
    .video-info {
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 10px;
      background: rgba(0, 0, 0, 0.6);
      .title {
        margin-bottom: 5px;
      }
      .video-desc {
        display: flex;
        justify-content: space-between;

        .info {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          .van-image {
            float: left;
            width: 20px;
            height: 20px;
            margin-right: 5px;
          }
        }
        .count {
          display: flex;
          align-items: center;
          span {
            font-size: 14px;
            margin-right: 5px;
          }
        }
      }
    }
  }
</style>
