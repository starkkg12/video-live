<script setup lang="ts">
  import { ref } from 'vue'
  import { NavBar } from 'vant'
  import tempImg from '@/assets/icons/video/temp.png'
  import CommentItem from './components/_CommentItem.vue'

  const pageTitle = '我的评论'
  const onClickLeft = () => {
    history.go(-1)
  }

  const commentList = ref([
    {
      title: '澳彩231期视频独家揭秘',
      auther: '视频作者A',
      poster: tempImg.src,
      comment_count: 100,
      collect_count: 77,
      like_count: 50,
      create_time: '2023-11-22 13:34:12',
      comment: '我是一个评论',
      comment_time: '2023-11-22 13:34:12',
      attachments: [{ url: tempImg.src }, { url: tempImg.src }, { url: tempImg.src }],
    },
    {
      title: '澳彩231期视频独家揭秘',
      auther: '视频作者A',
      poster: tempImg.src,
      comment_count: 100,
      collect_count: 77,
      like_count: 50,
      create_time: '2023-11-22 13:34:12',
      comment: '我是一个评论',
      comment_time: '2023-11-22 13:34:12',
      attachments: [
        { url: tempImg.src },
        { url: tempImg.src },
        { url: tempImg.src },
        { url: tempImg.src },
        { url: tempImg.src },
      ],
    },
    {
      title: '澳彩231期视频独家揭秘',
      auther: '视频作者A',
      poster: tempImg.src,
      comment_count: 100,
      collect_count: 77,
      like_count: 50,
      create_time: '2023-11-22 13:34:12',
      comment: '我是一个评论',
      comment_time: '2023-11-22 13:34:12',
      attachments: [],
    },
    {
      title: '澳彩231期视频独家揭秘',
      auther: '视频作者A',
      poster: tempImg.src,
      comment_count: 100,
      collect_count: 77,
      like_count: 50,
      create_time: '2023-11-22 13:34:12',
      comment: '我是一个评论',
      comment_time: '2023-11-22 13:34:12',
      attachments: [{ url: tempImg.src }, { url: tempImg.src }],
    },
    {
      title: '澳彩231期视频独家揭秘',
      auther: '视频作者A',
      poster: tempImg.src,
      comment_count: 100,
      collect_count: 77,
      like_count: 50,
      create_time: '2023-11-22 13:34:12',
      comment: '我是一个评论',
      comment_time: '2023-11-22 13:34:12',
      attachments: [],
    },
  ])
</script>

<template>
  <div class="my-video-comments">
    <NavBar class="nav-bar" fixed placeholder :title="pageTitle" left-arrow @click-left="onClickLeft"></NavBar>
    <div class="my-video-list">
      <template v-for="item in commentList">
        <CommentItem :commentData="item"></CommentItem>
      </template>
    </div>
  </div>
</template>

<style lang="less" scoped>
  .my-video-comments {
    padding: 0 16px;
  }
</style>
