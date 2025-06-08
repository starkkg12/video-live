<script setup lang="ts">
  import { Button, Image, Loading, showToast, showConfirmDialog, showSuccessToast, showFailToast } from 'vant'
  import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
  import getImageUrl from '@/utils/getImageUrl'
  import { getLiveListData, setFeedInteraction } from '@/service/api'
  import { getUserBatchList } from '@/service/user'
  import { Empty } from 'vant'
  import jumpTo from '@/utils/jumpTo'
  import { FeedAction } from '@/service/api/feed'
  import { useCurrentUser } from '@/composables/useCurrentUser'
  import type { UserBatchResponse } from '@/service/userEnhanced'

  const { myId } = useCurrentUser()
  const scrollContainer = ref<HTMLElement | null>(null)
  const props = defineProps(['keyWord','isActive'])
  const isLoading = ref<boolean>(false)
  const isFetching = ref<boolean>(false)
  const last = ref<boolean>(false)
  const requestCount = ref<number>(1)
  const dataList = ref<any[]>([])
  const cursor = ref<string | null>(null)
  const tempData = ref<any[]>([])
  const requestMaxLimit = 3
  const pageSize = 20
  
  const fetchOnce = async (): Promise<number> => {
    // API還沒有所以先註解掉
    const res = await getLiveListData(
      {  cursor: cursor.value, keyword: props.keyWord, limit: pageSize }
    )
    let datas: any[];
    datas = res.data.data.rooms || []
    cursor.value = res.data.cursor || null
    if (cursor.value === null) {
      last.value = true
    }
    const filteredVideos = dataList.value.length ? datas.filter(v => v.id !== dataList.value[0].id) : datas
    tempData.value.push(...filteredVideos)
    dataList.value.push(...filteredVideos)
    let userIds: string[] = [];
    await dataList.value.forEach(item => {
      userIds.push(item.owner);
    })
    const userBatchResponse = await getUserBatchList(userIds) as UserBatchResponse;
    
    if (userBatchResponse?.data) {
      userBatchResponse.data.forEach((user: { userId: string | number,  [key: string]: any }) => {
        dataList.value.forEach(item => {
          if (item.owner === user.userId) {
            item.userAvatar = user.avatar
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
        cursor.value = null
    } else {
        last.value = false
    }

    let totalNew = 0, emptyCount = 0
    try {
        while (requestCount.value <= requestMaxLimit && !last.value) {
            const newCount = await fetchOnce()
            requestCount.value++
            totalNew += newCount
            if (newCount === 0) emptyCount++
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
        loadData(false)
    }
  }  
  const execAction = async (item: any) => {
    // const params = {
    //   toUserId: item.owner,
    //   ipInfo: await utils.getIpData(),
    // }
    const isFollowingAuthor = item.isFollowingAuthor
    // const res = isFollowingAuthor
    //   ? await delRelationship(params)
    //   : await addRelationship(params)

    // if (res.data.errCode === '0') {
    //   showToast(isFollowingAuthor ? '取消关注成功' : '关注成功')
    //   item.isFollowingAuthor = !isFollowingAuthor // ✅ 直接修改這筆資料
    // } else {
    //   showToast(res.data.errMessage)
    // }
    try {  
      const res = await setFeedInteraction(item.owner, {
          action:  isFollowingAuthor ? FeedAction.Unfollow : FeedAction.Follow,
          objectType: 'user',
          clientType: 0,
        })
        if (res.data.success) { 
          showSuccessToast( !isFollowingAuthor ? '关注成功' : '已取消关注')
          item.isFollowingAuthor = !isFollowingAuthor
        }
        
    } catch (error) {
      showFailToast({
        message: isFollowingAuthor ? '取消关注失败' : '关注失败',
        duration: 2000,
      })
    } 
    
  }
  const followAction = async (item: any) => {
    if (item.isFollowingAuthor) {
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
  const inLiveRoom = (newUrl: string) => {
      jumpTo(newUrl)
  } 
  watch(()=> props.isActive, () => {
    if (props.isActive && !last.value ) {
      loadData(false)
      scrollContainer.value = document.querySelector('.video-popularitys-wrap .tags-scrollable .tags-content .live-wrap')
      scrollContainer.value?.addEventListener('scroll', handleScroll, { passive: true })
    }
  })
  onBeforeUnmount(() => scrollContainer.value?.removeEventListener('scroll', handleScroll))
</script>
<template>
    <div class="live-wrap" v-if="dataList.length > 0">
        <div class="all">共{{ dataList.length }}  个直播</div>
        <div class="live-item" v-for="(item, index) in dataList" :key="index">
            <div class="avatar-living max-avatar">
                <div class="color-trans" @click="inLiveRoom(`/room/${item.room_id}?owner=${item.owner}`)">
                    <Image :src="getImageUrl(item.userAvatar)"  round  class="isliveing"/>
                </div>
                <div class="ising">
                    <div class="loading">
                        <i /><i /><i />
                    </div> &nbsp;
                    <span>直</span>
                    <span>播</span>
                    <span>中</span>
                </div>
            </div>
            <div class="live-item-con">
                <div>{{ item.name }}</div>
                <div>{{ item.description  }}</div>
            </div>
            <Button 
              v-if="myId !== item.owner"
              class="cbtn"  
              type="primary"
              :class="{'is-follow': item.isFollowingAuthor, 'no-follow': !item.isFollowingAuthor}"
              @click="followAction(item)"
              >
              {{ !item.isFollowingAuthor ? '关注' : '已关注' }}
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
.live-wrap {
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
.max-avatar {
    position: relative;
}

.live-item {
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
.isliveing {
    width: 100%;
    height: 100%;
    animation: isLive 1s linear infinite;
}
.ising {
    background: red; transform: translate(-50%, calc(50% - 7px)) scale(0.65);
    position: absolute;
    left: 50%;
    height: 14px;
    box-sizing: content-box;
    transform-origin: center center;
    padding: 4.3px 7.54px;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}
.loading {
    width: 14px;
    height: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    overflow: hidden;
}
.live-item-con {
    flex: 1;
    padding: 0 12px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
}
.live-item-con>div:first-child {
    font-size: 14px;
    font-weight: 600;
}
.live-item-con>div:nth-child(2) {
    font-size: 13px;
    color: #666;
    margin-top: 4px;
}
.loading i {
    background: #fff;
    display: inline-block;
    width: 3px;
    height: 20%;
    background: #fff;
    animation: scaleUp .25s linear infinite alternate;
}
.loading i:nth-child(2) {
    animation-delay: .1s;
}
.loading i:nth-child(3) {
    animation-delay: .2s;
}
.ising>span {
    color: #fff;
    font-size: 14px !important;
    line-height: 14px;
}
.max-avatar:before {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: .32px solid #ef2073;
    animation: scal 1s infinite;
    animation-delay: 1s;
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
.is-follow {
    background: rgb(240, 240, 240)!important;
}
.no-follow {
  color: rgb(255, 255, 255)!important;
  background: rgb(235, 77, 96)!important;
}
:deep(.van-popup--center .van-popup) {
    background-color: #ffffff !important;
}
:deep(.van-popup--center .van-dialog) {
    background-color: #ffffff !important;
}
@keyframes scal {
  100% { opacity: 1;transform: translate(-50%, -50%) scale(1.12);}  
  0%   { opacity: 0; transform: translate(-50%, -50%) scale(.95); }
}
@keyframes colorTransform {
  0%   { border-color: rgba(183,63,116,.6); }
  50%  { border-color: rgba(239,32,115,.9); }
  100% { border-color: rgba(183,63,116,.6); }
}
@keyframes isLive {
  0%  { transform: scale(.96); } 
  50%  { transform: scale(.89); }  
  100%  { transform: scale(.96); } 
}
@keyframes scaleUp {
  100%  { transform: scaleY(5); }
}
</style>