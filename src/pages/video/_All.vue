<script setup lang="ts">
  import { ref } from 'vue'
  import { Row, Col } from 'vant'
  import tempImg from '@/assets/icons/video/temp.png'
  import tempAvatar from '@/assets/icons/video/temp_avatar.png'

  import BigVideoItem from './components/_BigVideoItem.vue'
  import TopMenu from '@/components/Video/TopMenu.vue'

  const pageTitle = '所有视频'
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
      avatar: tempAvatar.src,
    },
    {
      title: '澳彩231期视频独家揭秘',
      auther: '视频作者A',
      poster: tempImg.src,
      comment_count: 100,
      collect_count: 77,
      like_count: 50,
      create_time: '2023-11-22 13:34:12',
      avatar: tempAvatar.src,
    },
    {
      title: '澳彩231期视频独家揭秘',
      auther: '视频作者A',
      poster: tempImg.src,
      comment_count: 100,
      collect_count: 77,
      like_count: 50,
      create_time: '2023-11-22 13:34:12',
      avatar: tempAvatar.src,
    },
    {
      title: '澳彩231期视频独家揭秘',
      auther: '视频作者A',
      poster: tempImg.src,
      comment_count: 100,
      collect_count: 77,
      like_count: 50,
      create_time: '2023-11-22 13:34:12',
      avatar: tempAvatar.src,
    },
    {
      title: '澳彩231期视频独家揭秘',
      auther: '视频作者A',
      poster: tempImg.src,
      comment_count: 100,
      collect_count: 77,
      like_count: 50,
      create_time: '2023-11-22 13:34:12',
      avatar: tempAvatar.src,
    },
    {
      title: '澳彩231期视频独家揭秘',
      auther: '视频作者A',
      poster: tempImg.src,
      comment_count: 100,
      collect_count: 77,
      like_count: 50,
      create_time: '2023-11-22 13:34:12',
      avatar: tempAvatar.src,
    },
    {
      title: '澳彩231期视频独家揭秘',
      auther: '视频作者A',
      poster: tempImg.src,
      comment_count: 100,
      collect_count: 77,
      like_count: 50,
      create_time: '2023-11-22 13:34:12',
      avatar: tempAvatar.src,
    },
    {
      title: '澳彩231期视频独家揭秘',
      auther: '视频作者A',
      poster: tempImg.src,
      comment_count: 100,
      collect_count: 77,
      like_count: 50,
      create_time: '2023-11-22 13:34:12',
      avatar: tempAvatar.src,
    },
    {
      title: '澳彩231期视频独家揭秘',
      auther: '视频作者A',
      poster: tempImg.src,
      comment_count: 100,
      collect_count: 77,
      like_count: 50,
      create_time: '2023-11-22 13:34:12',
      avatar: tempAvatar.src,
    },
    {
      title: '澳彩231期视频独家揭秘',
      auther: '视频作者A',
      poster: tempImg.src,
      comment_count: 100,
      collect_count: 77,
      like_count: 50,
      create_time: '2023-11-22 13:34:12',
      avatar: tempAvatar.src,
    },
  ])
</script>

<template>
  <div class="all-video-list">
    <TopMenu />
    <div class="video-list">
      <Row :gutter="[10, 10]">
        <Col span="12" v-for="item in videoList">
          <BigVideoItem :videoData="item"></BigVideoItem>
        </Col>
      </Row>
    </div>
  </div>
</template>

<style lang="less" scoped>
  .all-video-list {
    background: #07c160;
    height: 100%;
    overflow: hidden;
  }
  .video-list {
    margin-top: 70px;
    padding: 20px 10px 100px;
    background: #fff;
    height: 100%;
    overflow-y: scroll;
  }
</style>
