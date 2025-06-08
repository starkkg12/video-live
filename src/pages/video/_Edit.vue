<script setup lang="ts">
  import { ref } from 'vue'
  import { Image, Uploader, Progress, NavBar, Cell, ActionSheet, Switch, showToast, Field, Button } from 'vant'
  import { bg_video_add } from '@/assets/icons/video'
  import tempImg from '@/assets/icons/video/temp.png'

  const pageTitle = '修改视频'
  const onClickLeft = () => {
    history.go(-1)
  }
  const step = ref(3)
  const afterRead = () => {
    step.value = 2
    // TODO upload video
  }

  const upload_progress = ref(40)

  const show = ref(false)
  const canDanmu = ref(false)
  const canComment = ref(false)
  const canHear = ref(false)

  const tagList = ['一不像', '二不像', '三不像', '四不像', '五不像', '六不像', '七不像', '八不像']
  const selectedTags = ref<string[]>([])
  const toggleTags = (tag: string) => {
    if (selectedTags.value.includes(tag)) {
      selectedTags.value = selectedTags.value.filter(t => t !== tag)
    } else {
      if (selectedTags.value.length >= 3) {
        showToast('最多选择3个标签')
        return
      }
      selectedTags.value.push(tag)
    }
  }
  const showMore = ref(false)

  const canSave = ref(false)
</script>

<template>
  <div class="video-edit">
    <NavBar class="nav-bar" fixed placeholder :title="pageTitle" left-arrow @click-left="onClickLeft"></NavBar>
    <div class="">
      <div class="title">
        <Field placeholder="请输入此视频标题"></Field>
        <p class="tip">还可输入20个字符</p>
      </div>
      <div class="tag">
        <h3>选择标签（最多三个）</h3>
        <ul>
          <li
            v-for="tag in showMore ? tagList : tagList.slice(0, 6)"
            @click="toggleTags(tag)"
            :class="selectedTags.includes(tag) && 'selected'"
          >
            #{{ tag }}#
          </li>
          <li class="more" v-if="!showMore" @click="showMore = true">
            <span class="material-icons">add_circle</span>
            显示更多
          </li>
        </ul>
      </div>
      <div class="desc">
        <Field placeholder="请填写视频简介" type="textarea" rows="5"></Field>
        <p class="tip">还可输入20个字符</p>
      </div>
      <div class="button">
        <Button type="success" block>确定修改</Button>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
  .video-edit {
    height: 80%;
    font-size: 14px;
    flex: 1;
    span {
      color: #07c160;
      display: block;
    }
  }
  h3 {
    font-size: 14px;
    font-weight: bold;
  }
  .tag {
    padding: 0 0 20px;
    margin: 0 16px 10px;
    // border-bottom: solid 1px #ccc;
    ul {
      overflow: hidden;
      margin-top: 20px;
      li {
        float: left;
        color: #666;
        margin: 0 15px 15px 0;
        padding: 2px 5px;
        border-radius: 5px;
        font-size: 12px;
        &.selected {
          background: #07c160;
          color: #fff;
        }
        &.more {
          font-size: 10px;
          color: #000;
          font-weight: bold;
          display: flex;
          align-items: center;
          span {
            font-size: 16px;
            margin-right: 3px;
          }
        }
      }
    }
  }
  .desc {
    margin: 0 16px;
  }
  .van-field {
    border: solid 1px #ccc;
    background: #f2f2f2;
    border-radius: 5px;
    margin-bottom: 10px;
  }
  .tip {
    text-align: right;
    color: #666;
    font-size: 12px;
  }
  .title {
    margin: 15px 16px 20px;
  }
  .button {
    position: fixed;
    bottom: 10px;
    left: 16px;
    right: 16px;
  }
  .config {
    ul {
      padding: 10px 20px;
    }

    li {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-top: solid 1px #ccc;
      &:first-child {
        border: none;
      }
    }
  }
  :deep(.van-cell__title span) {
    font-weight: bold;
  }
</style>
