<script setup lang="ts">
import HamburgerIcon from '@/assets/icons/hamburger-icon.svg'
import jumpTo from '@/utils/jumpTo'
import { Image, Tab, Tabs } from 'vant'
import { ref, watch } from 'vue'
import search from '@/utils/search'

const menu = [
  { name: '关注', value: 'follow' },
  { name: '话题', value: 'topic' },
  { name: '直播', value: 'live' },
  { name: '推荐', value: 'recommend' },
]
const emit = defineEmits(['toggleSideMenu', 'setActiveTab'])
const props = defineProps<{
  activeTab: string
  topicTop?: boolean
  liveTop: boolean
}>()
const activeTab = ref(props.activeTab ? props.activeTab : 'recommend')
interface TabType {
  name: string
}

const handleTabChange = (tab: TabType) => {
  activeTab.value = tab.name
  emit('setActiveTab', tab.name)
}
const showSideMenu = () => {
  emit('toggleSideMenu')
}

const tags = ref(['一不像', '二不像', '三不像', '四不像', '五不像', '六不像', '七不像', '八不像'])
watch(
  () => props.topicTop,
  () => {
    if ( props.topicTop) {
      handleTabChange({ name: 'topic' })
    }  
  }
)
watch(
  () => props.liveTop,
  () => {
    if (props.liveTop) {
      handleTabChange({ name: 'live' })
    }  
  }
)
</script>
<template>
  <div class="top-menu" :class="{ 'safe-area-inset-top': true }">
    <div class="btn-menu" @click="showSideMenu()">
      <Image :src="HamburgerIcon.src" class="hamburIcon" />
      <!-- <span class="material-icons-outlined">add_circle_outline</span> -->
    </div>
    <Tabs v-model:active="activeTab" class="tab-list" @click-tab="handleTabChange" color="#fff">
      <tab v-for="item in menu" :key="item.value" :title="item.name" :name="item.value">
        <template v-if="activeTab === 'type'">
          <ul class="tag-list">
            <li v-for="tag in tags">#{{ tag }}#</li>
          </ul>
        </template>
      </tab>
    </Tabs>
    <div class="btn-search">
      <span class="material-icons-outlined" @click="search('')">search</span>
    </div>
  </div>
</template>

<style scoped lang="less">
.top-menu {
  font-size: 30px;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.8);
  color: rgba(255, 255, 255, 0.7);
  padding: 6px 8px 0 8px;
  position: absolute;
  width: 100%;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  &.safe-area-inset-top {
    padding-top: constant(safe-area-inset-top);
    padding-top: env(safe-area-inset-top);
  }
  .tab-list {
    flex: 1;
    // padding: 0 20px;
  }
  .btn-menu {
    color: #fff;
  }
  .btn-search {
    color: #fff;
    cursor: pointer;
    span {
      font-size: 24px;
      line-height: 50px;
    }
  }
}
.top-menu :deep(.van-tabs__nav--line) {
  gap: 12px;
}
.top-menu :deep(.van-tabs__nav) {
  position: absolute;
  background: transparent;
}
.top-menu :deep(.van-tab) {
  color: rgba(var(--van-background), 0.7);
  font-size: 17px;
  font-weight: bold;
  min-width: 45px;
}
.top-menu :deep(.van-tabs__wrap) {
  padding-left: 11px;
  padding-right: 11px;
}
.top-menu :deep(.van-tab--active) {
  color: var(--van-text-color);
}
.top-menu :deep(.van-tabs__line) {
  width: 25px;
  background-color: rgb(235, 77, 96) !important;
}

.tag-list {
  overflow: hidden;
  margin-top: 15px;
  li {
    float: left;
    margin: 0 10px 20px;
    color: #fff;
    font-size: 12px;
  }
}
.hamburIcon {
  width: 24px;
  height: 26px;
}
</style>
