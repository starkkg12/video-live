<script setup lang="ts">
  import { ref } from 'vue'
  import { Button, Icon } from 'vant'
  const showActions = ref(false)
  const toggleActions = () => {
    showActions.value = !showActions.value
  }
  const editVideo = () => {
    // Edit video logic
    console.log('Edit video')
    window.location.href = '/video/edit'
  }
  const setStatus = () => {
    // Set video status logic
    console.log('Set video status')
  }
</script>

<template>
  <div class="action">
    <Button type="success" size="small" @click="toggleActions()">
      查看
      <Icon v-if="showActions" name="arrow-up" />
      <Icon v-else="showActions" name="arrow-down" />
    </Button>
    <ul class="action-list" v-if="showActions">
      <li @click="editVideo()">修改</li>
      <li @click="setStatus()">下架</li>
    </ul>
  </div>
</template>

<style lang="less" scoped>
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
</style>
