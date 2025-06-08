<script setup lang="ts">
  import { ref } from 'vue'
  import { Image, NavBar, Button, Icon } from 'vant'
  import tempImg from '@/assets/icons/video/temp.png'
  import Actions from './components/_VideoView.vue'

  const pageTitle = '我的视频'
  const onClickLeft = () => {
    history.go(-1)
  }

  const videoList = [
    {
      id: 1,
      title: '澳彩231期视频独家揭秘',
      poster: tempImg.src,
      audit_state: '已通过',
      tags: ['一不像', '二不像', '三不像', '四不像'],
      state: '正常显示',
      create_time: '2023-11-22 13:34:12',
    },
    {
      id: 2,
      title: '澳彩231期视频独家揭秘',
      poster: tempImg.src,
      audit_state: '已通过',
      tags: ['一不像', '二不像', '三不像', '四不像'],
      state: '正常显示',
      create_time: '2023-11-22 13:34:12',
    },
    {
      id: 3,
      title: '澳彩231期视频独家揭秘',
      poster: tempImg.src,
      audit_state: '已通过',
      tags: ['一不像', '二不像', '三不像', '四不像'],
      state: '正常显示',
      create_time: '2023-11-22 13:34:12',
    },
    {
      id: 4,
      title: '澳彩231期视频独家揭秘',
      poster: tempImg.src,
      audit_state: '已通过',
      tags: ['一不像', '二不像', '三不像', '四不像'],
      state: '正常显示',
      create_time: '2023-11-22 13:34:12',
    },
  ]
</script>

<template>
  <div class="video-my">
    <NavBar class="nav-bar" fixed placeholder :title="pageTitle" left-arrow @click-left="onClickLeft"></NavBar>
    <div class="my-video-list">
      <ul>
        <li class="video-item" v-for="video in videoList">
          <div class="title">
            <Actions />
            {{ video.title }}
          </div>
          <div class="content">
            <div class="poster">
              <Image :src="video.poster" width="126" height="155" />
            </div>
            <div class="detail">
              <div class="tags">
                <span v-for="tag in video.tags">#{{ tag }}#</span>
              </div>
              <dl>
                <dt>审核状态</dt>
                <dd class="success">{{ video.audit_state }}</dd>
              </dl>
              <dl>
                <dt>显示状态</dt>
                <dd class="success">{{ video.state }}</dd>
              </dl>
              <dl>
                <dt>发布时间</dt>
                <dd>{{ video.create_time }}</dd>
              </dl>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="less" scoped>
  .my-video-list {
    padding: 0 16px;
    .video-item {
      padding: 15px 0;
      border-bottom: solid 1px #ccc;
    }
  }
  .title {
    font-size: 15px;
    margin-bottom: 10px;
    padding-right: 100px;
    position: relative;
    // height: 20px;
    // text-overflow: ellipsis;
    // white-space: nowrap;
    // overflow: hidden;
    .action {
      position: absolute;
      right: 0;
      top: 0;
      .action-list {
        position: absolute;
        z-index: 2;
        width: 100%;
        transform: translateY(5px);
        border: solid 1px #ccc;
        border-radius: 5px;
        text-align: center;
        padding: 0 5px;
        background: #fff;
        li {
          padding: 10px 0;
          border-bottom: solid 1px #ccc;
          &:last-child {
            border: none;
          }
        }
      }
    }
  }
  .content {
    display: flex;
    justify-content: space-between;
    .poster {
      border: solid 1px #ccc;
      border-radius: 5px;
      width: 126px;
      height: 155px;
      margin-right: 10px;
      float: left;
      img {
        max-width: 100%;
        max-height: 100%;
      }
    }
    .detail {
      flex: 1;
    }
    .tags {
      overflow: hidden;
      height: 95px;
      span {
        float: left;
        color: #666;
        margin: 0 10px 10px 0;
        font-size: 12px;
      }
    }
    dl {
      overflow: hidden;
      font-size: 12px;
      line-height: 20px;
      dt {
        float: left;
        margin-right: 5px;
      }
      dd {
        &.success {
          color: #07c160;
        }
      }
    }
  }
</style>
