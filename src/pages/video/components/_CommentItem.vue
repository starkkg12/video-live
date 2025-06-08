<script setup lang="ts">
  import { ref } from 'vue'
  import { Image, Button, Icon, Row, Col } from 'vant'

  interface attachment {
    url?: string
  }
  interface CommentData {
    title: string
    auther: string
    poster: string
    comment_count: number
    collect_count: number
    like_count: number
    create_time: string
    comment: string
    comment_time: string
    attachments: attachment[]
  }

  const props = defineProps<{
    commentData: CommentData
  }>()
</script>

<template>
  <div class="comment-item">
    <div class="comment-content">
      <div class="content">{{ commentData.comment }}</div>
      <Row type="flex" justify="start" wrap class="attachments">
        <Col v-for="(attach, index) in commentData.attachments" :key="index" :span="8" class="list-item">
          <Image :src="attach.url" fit="cover" />
        </Col>
      </Row>
      <div class="time">{{ commentData.comment_time }}</div>
    </div>
    <div class="video-item">
      <div class="detail">
        <div class="title">
          {{ commentData.title }}
          <p class="info">{{ commentData.auther }} {{ commentData.create_time }}</p>
        </div>
        <p class="count">
          <span>{{ commentData.comment_count }} 评论</span>
          <span>{{ commentData.collect_count }} 收藏</span>
          <span>{{ commentData.like_count }} 赞</span>
        </p>
      </div>
      <div class="poster">
        <Image :src="commentData.poster" />
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
  .comment-item {
    border-bottom: solid 1px #ccc;
    padding: 10px 0 20px;
    .comment-content {
      color: #333;
      .content {
        font-size: 15px;
        margin-bottom: 10px;
      }
      .time {
        text-align: right;
        font-size: 13px;
        margin-bottom: 5px;
      }
      .list-item {
        flex: 0 0 calc(33.33% - 10px);
        margin: 0 5px 10px;
        :deep(.van-image__img) {
          width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 5px;
          object-fit: cover;
        }
      }
    }
  }
  .video-item {
    border: solid 1px #ccc;
    border-radius: 5px;
    background: #f2f2f2;
    padding: 15px 30px;
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    .poster {
      width: 60px;
      margin-left: 10px;
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
