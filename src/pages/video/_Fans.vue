<script setup lang="ts">
  import { ref } from 'vue'
  import { NavBar } from 'vant'
  import tempAvatar from '@/assets/icons/video/temp_avatar.png'
  import UserItem from './components/_UserItem.vue'

  const pageTitle = '我的粉丝'
  const onClickLeft = () => {
    history.go(-1)
  }

  const followList = ref([
    {
      auther: '视频作者A',
      poster: tempAvatar.src,
      comment_count: 100,
      collect_count: 77,
      like_count: 50,
    },
    {
      auther: '视频作者A',
      poster: tempAvatar.src,
      comment_count: 100,
      collect_count: 77,
      like_count: 50,
    },
    {
      auther: '视频作者A',
      poster: tempAvatar.src,
      comment_count: 100,
      collect_count: 77,
      like_count: 50,
    },
    {
      auther: '视频作者A',
      poster: tempAvatar.src,
      comment_count: 100,
      collect_count: 77,
      like_count: 50,
    },
  ])
</script>

<template>
  <div>
    <NavBar class="nav-bar" fixed placeholder :title="pageTitle" left-arrow @click-left="onClickLeft"></NavBar>
    <div class="follow-list">
      <template v-for="item in followList">
        <UserItem :userData="item"></UserItem>
      </template>
    </div>
  </div>
</template>

<style lang="less" scoped>
  .follow-list {
    padding: 0 16px;
  }
</style>
