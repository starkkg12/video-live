<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { Icon, showConfirmDialog } from 'vant'

import trash from '@/assets/icons/trash.svg'
import search from '@/utils/search';

const historyList = ref<string[]>([]);
const props = defineProps(['historyKey']);
const emit = defineEmits(['clearHistory'])

const getSearchHistory = (): string[] =>{
    return JSON.parse(localStorage.getItem(props.historyKey) || '[]')
  }
const deleteData = () => {
    localStorage.removeItem(props.historyKey);
    historyList.value = [];
    emit('clearHistory')
}  
const deleteHistory = () => {
    showConfirmDialog({
        title: '提示',
        message: '确认删除全部历史记录',
        confirmButtonText: '确定',
        confirmButtonColor: '#1989fa',
        showCancelButton: true,
      }).then(deleteData)
   setTimeout(() => {
     const el = document.querySelector('.van-dialog')
     const el2 = document.querySelector('.van-button--default')
     const el3 = document.querySelector('.van-dialog__confirm')
     const btn = document.querySelector('.van-button')
     const header = document.querySelector('.van-dialog__header')
     btn?.classList.add('custom-style')
     if (el) {
       header.style.color = 'unset' 
       el.style.backgroundColor = '#ffffff'
       el2.style.backgroundColor = '#ffffff'
       el2.style.color = 'unset'
       btn.style.backgroundColor = '#ffffff'
       btn.style.borderColor = '#ebedf0'
       el3.style.backgroundColor = '#ffffff'
       el3.style.color = 'red'
      }
    }, 30)    
}        
onMounted(() => {
    document.body.classList.add('white-dialog-mode')
    historyList.value = getSearchHistory();
});
onBeforeUnmount(() => {
  document.body.classList.remove('white-dialog-mode')
})
</script>

<template>
  <div class="p-4 bg-white rounded shadow suggestions-wrap">
    <div class="headers">
      <span class="title">历史记录</span>
      <div class="reload-btn" >
        <Icon :name="trash.src" size="20" @click="deleteHistory()" />
      </div>
    </div>

    <div class="history-tags">
      <span
        v-for="(item, index) in historyList"
        :key="index"
        class="history-tag"
        @click="search(item)"
      >
        {{ item }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.suggestions-wrap {
  padding: 10px 14px;
}
.headers {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  margin-bottom: 12px;
}
.column {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  max-height: 58px;
}
.reload-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  color: rgb(117, 116, 116);
}
.history-wrapper {
  padding: 16px;
  background-color: #fff;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.title {
  font-weight: 600;
  font-size: 16px;
  color: #000;
}

.delete-icon {
  font-size: 18px;
  color: #999;
  cursor: pointer;
}

.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.history-tag {
  padding: 4px 12px;
  background-color: #f2f3f5;
  color: #333;
  font-size: 12px;
  border-radius: 999px;
  line-height: 1;
  max-width: 120px; /* 約能容納10字，可微調 */
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
:deep(.van-button.custom-style)::before {
  background: red;
  content: '';
  display: block;
  position: absolute;
  inset: 0;
  z-index: 0;
  opacity: 0.1;
}

:deep(.van-popup--center .van-popup) {
    background-color: #ffffff !important;
}
:deep(.van-popup--center .van-dialog) {
    background-color: #ffffff !important;
}
</style>
