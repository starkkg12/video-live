<template>
  <van-nav-bar class="header-nav" :border="false">
    <template #left>
      <van-button class="download-btn" size="small" plain> APP 下载 </van-button>
    </template>

    <template #title>
      <span class="title">六合直播</span>
    </template>

    <template #right>
      <div class="right-icons">
        <ShareComponent :share-text="shareText">
          <img v-if="isDarkMode" :src="share.src" alt="分享" class="icon-img" />
          <van-icon v-else name="share" size="20" color="black" />
        </ShareComponent>
        <van-icon name="search" class="search-icon" @click="goToSearch" />
      </div>
    </template>
  </van-nav-bar>
</template>

<script setup lang="ts">
import { Button as VanButton, Icon as VanIcon, NavBar as VanNavBar } from 'vant'
import ShareComponent from '@/components/ShareComponent.vue'
import { ref, computed } from 'vue'
import { share } from '@/assets/images/gallery'
import search from '@/utils/search'

const props = defineProps<{
  isDark?: boolean | string
}>()

const isDarkMode = computed(() =>
  typeof props.isDark === 'string' ? props.isDark === 'true' : !!props.isDark
)

const shareText = ref('六合直播 - 在线观看直播内容，下载我们的APP获取更多精彩内容！')

const goToSearch = () => {
  //window.location.href = '/video/search'
  search('')
}
</script>

<style scoped>
.header-nav {
  background-color: var(--van-background);
  border-bottom: 1px solid #333;
  height: 3.5rem;
}

.header-nav :deep(.van-nav-bar__content) {
  height: 3.5rem;
  padding: 0 1rem;
}

.header-nav :deep(.van-nav-bar__title) {
  color: var(--van-text-color);
  max-width: 60%;
}

.title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--van-text-color);
  white-space: nowrap;
}

.download-btn {
  color: var(--van-text-color);
  background: var(--van-background);
  border: 1px solid var(--van-text-color);
  border-radius: 30px;
  font-size: 0.875rem;
  padding: 0.25rem 0.75rem;
  height: 2rem;
}

.download-btn:active {
  opacity: 0.8;
}

.right-icons {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-img {
  cursor: pointer;
  position: relative;
  top: 3px;
  width: 18px;
}

.search-icon {
  color: var(--van-text-color);
  cursor: pointer;
  font-size: 1.875rem;
}
</style>
