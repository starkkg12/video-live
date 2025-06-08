<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { Image, PullRefresh, Search, Loading, Radio, RadioGroup } from 'vant'
  import { getSearchCreatorOrStreamer } from '@/service/api'
  import utils from '@/utils'
  import { getUserBatchList } from '@/service/user'
  import type { UserBatchResponse } from '@/service/userEnhanced'

  const refreshing = ref<boolean>(false)
  const keyWord = ref<string | null>(null)
  const isFocused = ref<boolean>(false)
  const page = ref<number>(1)
  const pageSize = ref<number>(20)
  const authorList = ref<any[]>([])
  const loadingMore = ref<boolean>(false)
  const hasMore = ref<boolean>(true)
  const selectedUserId = ref<number | null>(null)
  const emit = defineEmits(['confirmAuthor'])
  const last = ref<boolean>(false)

  const keyWordProxy = computed({
    get: () => keyWord.value ?? '',
    set: (val:any) => {
      keyWord.value = val === '' ? null : val
    }
  });
  const loadAuthorData = async() => {
    if (keyWord.value !== null && keyWord.value.trim() !== '') {
      loadingMore.value = true
      hasMore.value = true
      const res = await getSearchCreatorOrStreamer(
        'creator',
        keyWord.value,
        page.value,
        pageSize.value
      )
      if (authorList.value.length === 0) {
         authorList.value = res.data.data.list || []
      } else if (res.data.data.list.length > 0) {
        authorList.value =  [
          ...authorList.value,
          ...res.data.data.list
        ]
      }   
      if (res.data.data.list.length <= 0) {
        last.value = true
      }
      if (authorList.value.length === 0) {
        hasMore.value = false
      }
      loadingMore.value = false
      let userIds: string[] = [];
      await authorList.value.forEach((item: any) => {
        userIds.push(item.userId);
      })
      const userBatchResponse = await getUserBatchList(userIds) as UserBatchResponse;
      
      if (userBatchResponse?.data) {
        userBatchResponse.data.forEach((user: { userId: string | number,  [key: string]: any }) => {
          authorList.value.forEach((item: any) => {
            if (item.userId === user.userId) {
              item.nickname = user.nickname
              item.avatar = user.avatar
            }
          })
        })
      } 
    }
  }
  const onClear = () => {
    keyWord.value = null
  }
  const onRefresh = () => {
   loadAuthorData()
  }
  const onScroll = (e: Event) => {
    const el = e.target as HTMLElement
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20 && !last.value) {
      page.value += 1
      loadAuthorData()
    }
  }
  const search = () => {
    last.value = false
    page.value = 1
    authorList.value = []
    loadAuthorData()
  }
  watch(selectedUserId, (id) => {
    const matched = authorList.value.find(user => user.userId === id)
    if (matched) {
      emit('confirmAuthor', { userId: matched.userId, nickname: matched.nickname })
    }
  })
</script>
<template>
  <div class="author-search">
    <!-- 固定區域 -->
    <div class="search-fixed">
      <div class="search-header">
        <h3 class="search-author-title">搜索用户</h3>
        <span class="search-close" @click="emit('confirmAuthor')">✕</span>
      </div>
      <Search 
        v-model="keyWordProxy"
        placeholder="请输入搜索关键词"
        input-align="left"
        left-icon="search"
        show-action
        @focus="isFocused = true"
        @blur="isFocused = false"
        @keydown.enter="search"
        @search="search"
        @cancel="onClear"
      >
        <template #action>
          <span class="searchBtn" @click="search">搜索</span>
        </template>
      </Search>
    </div>

    <!-- 滾動內容 -->
    <RadioGroup v-model="selectedUserId" >
    <PullRefresh v-model="refreshing" @refresh="onRefresh" class="author-pull-refresh" :disabled="true">
      <div class="scroll-container" @scroll.passive="onScroll">
        <div>
          <div
            v-for="user in authorList"
            :key="user.userId"
            class="user-item"
          >
            <Image :src="utils.getImageUrl(user.avatar)" width="50" height="50" round class="avatar" />
            <div class="username">{{ user.nickname }}</div>
            <Radio :name="user.userId" class="user-radio" />
          </div>
        </div>
        <!-- 加載中 & 無更多 -->
        <div class="loading-text" v-if="loadingMore">
          加载中... <Loading color="gray" size="19" />
        </div>
        <div v-else-if="!hasMore" class="loading-text">没有更多了</div>
      </div>
    </PullRefresh>
    </RadioGroup>

  </div>
</template>

<style lang="less" scoped>
.search-header {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  height: 40px;
  padding: 0 16px;
}

.search-author-title {
  font-size: 16px;
  font-weight: bold;
  margin: 0 auto;
  line-height: 40px;
}
.search-close {
  position: absolute;
  right: 3px;
  font-size: 22px;
  font-weight: bold;
  line-height: 40px;
  color: #8999;
  cursor: pointer;
}
h3.search-author-title {
  text-align: center;
  padding-bottom: 10px;
  margin: 0;
}
.field-container {
  width: 100%;
  margin: 0 auto;
}

.author-search {
  font-size: 14px;
  width: 100%;
  line-height: 34px;
  padding: 0 16px 6px;
  min-height: 0;
}

.search-fixed {
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
  padding-top: 12px;
}

.searchBtn {
  color: #eb4d60;
  font-size: 15px;
}

.scroll-container {
  flex: 1 1 auto;
  overflow-y: auto;
  max-height: 50vh;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  min-height: 0;
  padding-right: 5px;

}

.user-item {
  display: flex;
  align-items: center;
  padding-top: 16px;
}

.user-item .avatar {
  display: block;
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.user-item .username {
  flex: 1;
  padding-left: 14px;
}

.user-radio {
  margin-left: auto;
  transform: scale(1.2);
}

.loading-indicator {
  // display: flex;
  // justify-content: center;
  // align-items: center;
  // gap: 10px;
  // margin: 16px 0;
  color: #666;
}

.loading-text {
  text-align: center;
  padding: 16px 0;
  color: #999;
}

.author-pull-refresh {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}
:deep(.van-pull-refresh) {
  overflow: auto;
    flex: 1 1 0%;
}

.author-search :deep(.van-search) {
  background: unset;
  padding: 0 !important;
}

.author-search :deep(.van-search__content) {
  border-radius: 999px;
  background: #f7f8fa;
}

.author-search :deep(.van-nav-bar__content) {
  background-color: white;
}

.author-search :deep(.van-field__control) {
  color: unset;
}
.author-search :deep(.van-field__control::placeholder) {
  color: #999 !important;
}
.author-search :deep(.van-search__action) {
  -webkit-tap-highlight-color: transparent;
  background-color: transparent !important;
}
.author-search :deep(.van-radio__icon--checked .van-icon ) {
  background: #eb4d60 !important;
  border-color: #eb4d60 !important;
}
</style>
