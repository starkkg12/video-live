<script setup lang="ts">
  import { ref, defineExpose } from 'vue'
  
  const show = ref(false)
  const showMask = ref(false)
  
  const items = [
    { label: '分享到', icon: '/icons/send.svg' },
    { label: '复制链接', icon: '/icons/link.svg' },
    { label: '保存至本地', icon: '/icons/download.svg' },
    { label: '调用视频', icon: '/icons/play.svg' },
  ]
  
  const open = () => {
    showMask.value = true
    requestAnimationFrame(() => {
      show.value = true
    })
  }
  
  const close = () => {
    show.value = false
  }
  
  defineExpose({ open })
  </script>
<template>
    <transition name="fade">
      <div v-if="showMask" class="share-mask" @click.self="close">
        <transition name="slide-up" @after-leave="$emit('closed')">
          <div v-if="show" class="share-popup">
            <div class="share-header">
              <span>推广</span>
              <span class="close" @click="close">✕</span>
            </div>
            <div class="share-options">
              <div v-for="(item, index) in items" :key="index" class="share-item">
                <div class="share-icon">
                  <span class="iconfont icon-shipin" />
                  <img :src="item.icon" alt="" />
                </div>
                <div class="share-label">{{ item.label }}</div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </template>
  <style scoped>
  .share-mask {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 100;
    display: flex;
    align-items: flex-end;
  }
  .share-popup {
    width: 100%;
    background: #fff;
    border-radius: 16px 16px 0 0;
    padding: 16px;
    box-sizing: border-box;
  }
  .share-header {
    display: flex;
    justify-content: space-between;
    font-weight: 600;
    font-size: 16px;
    padding-bottom: 10px;
  }
  .close {
    font-size: 18px;
    cursor: pointer;
  }
  .share-options {
    display: flex;
    justify-content: space-around;
    padding-top: 10px;
  }
  .share-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 14px;
    color: #333;
  }
  .share-icon {
    background: #f2f3f5;
    border-radius: 50%;
    width: 54px;
    height: 54px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .share-icon img {
    width: 24px;
    height: 24px;
  }
  .share-label {
    margin-top: 6px;
  }
  
  /* 動畫 */
  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.2s;
  }
  .fade-enter-from, .fade-leave-to {
    opacity: 0;
  }
  .slide-up-enter-active, .slide-up-leave-active {
    transition: all 0.3s ease;
  }
  .slide-up-enter-from, .slide-up-leave-to {
    transform: translateY(100%);
    opacity: 0;
  }
  </style>
  