<script setup lang="ts">
  import { ref } from 'vue'
  import { NavBar } from 'vant'
  import tempImg from '@/assets/icons/video/temp.png'
  import VideoItem from './components/_VideoItem.vue'

  const pageTitle = '我的收藏'
  const onClickLeft = () => {
    history.go(-1)
  }

  const videoList = ref([
    {
      title: '澳彩231期视频独家揭秘',
      auther: '视频作者A',
      poster: tempImg.src,
      comment_count: 100,
      collect_count: 77,
      like_count: 50,
      create_time: '2023-11-22 13:34:12',
    },
    {
      title: '澳彩231期视频独家揭秘',
      auther: '视频作者A',
      poster: tempImg.src,
      comment_count: 100,
      collect_count: 77,
      like_count: 50,
      create_time: '2023-11-22 13:34:12',
    },
    {
      title: '澳彩231期视频独家揭秘',
      auther: '视频作者A',
      poster: tempImg.src,
      comment_count: 100,
      collect_count: 77,
      like_count: 50,
      create_time: '2023-11-22 13:34:12',
    },
    {
      title: '澳彩231期视频独家揭秘',
      auther: '视频作者A',
      poster: tempImg.src,
      comment_count: 100,
      collect_count: 77,
      like_count: 50,
      create_time: '2023-11-22 13:34:12',
    },
    {
      title: '澳彩231期视频独家揭秘',
      auther: '视频作者A',
      poster: tempImg.src,
      comment_count: 100,
      collect_count: 77,
      like_count: 50,
      create_time: '2023-11-22 13:34:12',
    },
  ])
</script>

<template>
  <div class="video-favorite">
    <NavBar class="nav-bar" fixed placeholder :title="pageTitle" left-arrow @click-left="onClickLeft"></NavBar>
    <div class="my-video-list">
      <template v-for="item in videoList">
        <VideoItem :videoData="item"></VideoItem>
      </template>
    </div>
  </div>
</template>

<style lang="less" scoped>
  .video-favorite {
    padding: 0 16px;
  }
</style>
