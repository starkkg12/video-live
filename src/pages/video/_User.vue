<script setup lang="ts">
  import { ref } from 'vue'
  import { NavBar, Image, Button } from 'vant'
  import tempImg from '@/assets/icons/video/temp.png'
  import VideoItem from './components/_VideoItem.vue'
  import tempAvatar from '@/assets/icons/video/temp_avatar.png'

  const pageTitle = '用户主页'
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
  const userInfo = ref({
    avatar: tempAvatar.src,
    nickName: '我是作者',
    follow_count: 11,
    fan_count: 22,
    video_count: 33,
  })
</script>

<template>
  <div class="video-favorite">
    <NavBar class="nav-bar" fixed placeholder :title="pageTitle" left-arrow @click-left="onClickLeft"></NavBar>
    <div class="user-info">
      <Image :src="userInfo.avatar" class="user-avatar" width="52" height="52" round />
      <div class="user-name">
        <span>{{ userInfo.nickName }}</span>
        <Button plain size="small">已关注</Button>
      </div>
      <div class="count">
        <span>{{ userInfo.follow_count }} 关注</span>
        |
        <span>{{ userInfo.fan_count }} 粉丝</span>
        |
        <span>{{ userInfo.video_count }} 作品</span>
      </div>
    </div>
    <div class="my-video-list">
      <h3>作品列表</h3>
      <template v-for="item in videoList">
        <VideoItem :videoData="item" :showAuthor="false"></VideoItem>
      </template>
    </div>
  </div>
</template>

<style lang="less" scoped>
  :deep(.van-nav-bar) {
    background: #07c160;
    .van-nav-bar__title {
      color: #fff;
    }
    .van-icon {
      color: #fff;
    }
  }
  :deep(.van-hairline--bottom:after) {
    border: none;
  }
  .user-info {
    background: #07c160;
    color: #fff;
    padding: 15px 15px 30px;
    .user-avatar {
      float: left;
      margin-right: 10px;
    }
    .user-name {
      display: flex;
      align-items: center;
      padding-left: 10px;
      span {
        font-size: 15px;
        margin-right: 10px;
      }
      .van-button {
        border-radius: 20px;
        padding: 0 10px;
        background: transparent;
        color: #fff;
        height: 20px;
      }
    }
    .count {
      margin-top: 5px;
      font-size: 12px;
      span {
        padding: 0 10px;
      }
    }
  }
  .my-video-list {
    padding: 15px 15px 0;
    h3 {
      font-size: 15px;
      font-weight: bold;
    }
  }
</style>
