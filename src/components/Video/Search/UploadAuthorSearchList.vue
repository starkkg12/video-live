<script setup lang="ts">
  import { Button, Image, showConfirmDialog, showSuccessToast, showFailToast } from 'vant'
  import { nextTick, ref, watch } from 'vue'
  import { getSearchCreatorOrStreamer, setFeedInteraction } from '@/service/api'
  import { getUserBatchList } from '@/service/user'
  import type { UserBatchResponse } from '@/service/userEnhanced'
  import getImageUrl from '@/utils/getImageUrl'
  import { FeedAction } from '@/service/api/feed'
  import { Empty } from 'vant'
  import { useCurrentUser } from '@/composables/useCurrentUser'
  import jumpTo from '@/utils/jumpTo'
  const { myId } = useCurrentUser()
  const scrollContainer = ref<HTMLElement | null>(null)
  const props = defineProps(['keyWord','isActive', 'type'])
  const isLoading = ref<boolean>(false)
  const isFetching = ref<boolean>(false)
  const last = ref<boolean>(false)
  const requestCount = ref<number>(1)
  const dataList = ref<any[]>([])
  const scrollId = ref<string | number | null>(null)
  const tempData = ref<any[]>([])
  const page = ref<number>(1)
  const pageSize = ref<number>(20)
  const requestMaxLimit = 3
  const fetchOnce = async (): Promise<number> => {
    // API還沒有所以先註解掉
    const res = await getSearchCreatorOrStreamer(
        props.type,
        props.keyWord ?? null,
        page.value,
        pageSize.value
    )
    let datas: any[];
    datas = res.data.data.list || []
    page.value += 1
    const filteredVideos = dataList.value.length ? datas.filter(v => v.id !== dataList.value[0].id) : datas
    tempData.value.push(...filteredVideos)
    dataList.value.push(...filteredVideos)
    let userIds: string[] = [];
    await dataList.value.forEach((item: any) => {
      userIds.push(item.userId);
    })
    const userBatchResponse = await getUserBatchList(userIds) as UserBatchResponse;
    
    if (userBatchResponse?.data) {
      userBatchResponse.data.forEach((user: { userId: string | number,  [key: string]: any }) => {
        dataList.value.forEach((item: any) => {
          if (item.userId === user.userId) {
            item.avatar = user.avatar
            item.nickname = user.nickname
          }
        })
      })
    } 
    return filteredVideos.length
    
  }
  const loadData = async (isInitial = false) => {
    if ( isLoading.value  && isInitial || (!isInitial && last.value)) return
    isLoading.value = true
    requestCount.value = 1

    if (isInitial) {
        dataList.value = []
        page.value = 1
    } else {
        last.value = false
    }

    let totalNew = 0, emptyCount = 0
    try {
      while (requestCount.value <= requestMaxLimit) {
        const newCount = await fetchOnce()
        requestCount.value++
        totalNew += newCount
        if (newCount === 0) emptyCount++
        else requestCount.value--
        if (totalNew >= 20 || emptyCount >= 3) {
          if (!isInitial && emptyCount >= 3) last.value = true
          break
        }
      }
    } catch (e) {
        console.error('loadData error:', e)
    } finally {
      nextTick(() => {
        isLoading.value = false
        isFetching.value = false
      })
    }
  }
  const handleScroll = () => {
    // 若前面還沒渲染完則跳過
    if (isFetching.value) return
    const el = scrollContainer.value
    if (!el) return
    const { scrollTop, scrollHeight, clientHeight } = el
    if (!isLoading.value && !last.value && scrollTop + clientHeight >= scrollHeight - 100) {
      page.value += 1
      loadData(false)
    }
  }  
  const execAction = async (item: any) => {
    const isFollowingAuthor = item.isFollowing
    try {  
      const res = await setFeedInteraction(item.userId, {
          action:  isFollowingAuthor ? FeedAction.Unfollow : FeedAction.Follow,
          objectType: 'user',
          clientType: 0,
        })
        if (res.data.success) { 
          showSuccessToast( !isFollowingAuthor ? '关注成功' : '已取消关注')
          item.isFollowing = !isFollowingAuthor
        }
        
    } catch (error) {
      showFailToast({
        message: isFollowingAuthor ? '取消关注失败' : '关注失败',
        duration: 2000,
      })
    } 
    
  }
  const followAction = async (item: any) => {
    if (item.isFollowing) {
    showConfirmDialog({
        title: '提示',
        message: '确认取消关注',
        confirmButtonText: '确认',
        confirmButtonColor: '#1989fa',
        showCancelButton: true,
      }).then(() => {
        execAction(item)
      })
      setTimeout(() => {
        const el = document.querySelector('.van-dialog') as HTMLElement
        const el2 = document.querySelector('.van-button--default') as HTMLElement
        const el3 = document.querySelector('.van-dialog__confirm') as HTMLElement
        const btn = document.querySelector('.van-button') as HTMLElement
        const header = document.querySelector('.van-dialog__header') as HTMLElement
        const clear = document.querySelector('.van-dialog__cancel') as HTMLElement
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
          clear.style.color ='#646566'
        }
      }, 30)    
    } else {
      execAction(item)
    }  
  }
  watch(()=> props.isActive, () => {
    if (props.isActive && !last.value ) {
      loadData(false)
      scrollContainer.value = document.querySelector('.video-popularitys-wrap .tags-scrollable .tags-content .upload-author-wrap')
      scrollContainer.value?.addEventListener('scroll', handleScroll, { passive: true })
    }
  })
</script>
<template>
    <div class="upload-author-wrap" v-if="dataList.length > 0">
        <div class="all">共{{ dataList.length }}  个主播</div>
        <div class="author-item" v-for="(item, index) in dataList" :key="index">
            <div class="avatar-living">
                <div class="color-trans" @click="jumpTo(`/user/${item.userId}`)">
                    <Image :src="getImageUrl(item.avatar)"  round  size="65"/>
                </div>
            </div>
            <div class="author-item-con">
                <div>{{ item.nickname }}</div>
            </div>
            <Button 
              v-if="myId !== item.userId"
              class="cbtn"  
              type="primary"
              :class="{'is-follow': item.isFollowing, 'no-follow': !item.isFollowing}"
              @click="followAction(item)"
              >
              {{ !item.isFollowing ? '关注' : '已关注' }}
              </Button>
        </div>
        <div class="loading-indicator">
            <span v-if="isLoading && !last">加载..<Loading color="gray" size="19" /></span>
            <span v-else-if="last">- 暂无更多 -</span>
        </div>
        <div class="bottom-padding"></div>
    </div>
    <Empty v-else description="暂无数据" />
</template>
<style lang="scss" scoped>
.upload-author-wrap {
  position: relative;
  flex: 1;
  // height: calc(var(--vh) * 100 - 46px - env(safe-area-inset-bottom));
  height: auto;
  max-height: calc(var(--vh) * 100 - 46px - env(safe-area-inset-bottom));
  overflow-y: auto;
}
.all {
  padding: 12px 20px 0;
  font-size: 15px;
  color: #333;
  display: flex;
  align-items: center;
}
.all::before {
  content: " ";
  display: block;
  width: 4px;
  border-radius: 3px;
  height: 16px;
  margin-right: 10px;
  background: #333;
}
.avatar-living {
    width: 65px;
    height: 65px;
}

.author-item {
  border-bottom: .02rem solid rgba(0, 0, 0, .06);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 12px;
  padding: 12px 0;
  position: relative;
}
.color-trans {
    width: 65px;
    height: 65px;
    border: 2px solid var(--fill-b1);
    position: relative;
    animation: colorTransfrom 1s linear infinite;
    animation-delay: 1s
}
.author-item-con {
    flex: 1;
    padding: 0 12px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
}
.author-item-con>div:first-child {
    font-size: 14px;
    font-weight: 600;
}
.author-item-con>div:nth-child(2) {
    font-size: 13px;
    color: #666;
    margin-top: 4px;
}
.cbtn {
    width: 84px;
    height: 30px;
    line-height: 28px;
    font-size: 12px;
    color: rgb(255, 255, 255);
    background: rgb(235, 77, 96);
    border: none;
    border-radius: 4px;
}
.loading-indicator {
  margin-bottom: calc(env(safe-area-inset-bottom) + 50px);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  color: #c9c9c9;
  font-size: 14px;
}
.loading-indicator span {
  display: flex;
}
.bottom-padding {
  height: 60px;
}
</style>