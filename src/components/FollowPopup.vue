<script setup lang="ts">
  import { Button, Image, ActionSheet, showSuccessToast, showFailToast } from 'vant'
  import { computed, ref,watch } from 'vue'
  import { useFetchData, type UseFetchDataInterface } from '@/composables/useFetchData'
  import { getUserProfile, setFeedInteraction } from '@/service/api'
  import { getOtherUserInfo } from '@/service/bbs'
  import getImageUrl from '@/utils/getImageUrl'
  import femaleIcon from '@/assets/icons/female.svg'
  import maleIcon from '@/assets/icons/male.svg'
  import { FeedAction } from '@/service/api/feed'
  import { type LiveRoomInterface } from '@/composables/useLiveRoom'
  import utils from '@/utils'
  import { useCurrentUser } from '@/composables/useCurrentUser'
  import jumpTo from '@/utils/jumpTo'

  const { fetchData }: UseFetchDataInterface = useFetchData()

  const props = defineProps<{ 
    userId: string | null
    visible: boolean  
    liveRoom: LiveRoomInterface
  }>()
  const { myId } = useCurrentUser(props.userId)

  
  const isLoading = ref<boolean>(false)
  const userInfo = ref<Record<string, any>>({})
  const userStats = ref<any[]>([])
  const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
    (e: 'show-login'): void
  }>()
  const showFollowPopup = ref(false)
  const targetUserFollow = ref(false)
  // 获取性别颜色
  const genderColor = computed(() => {
    const genderValue = String(userInfo.value.gender || '')

    if (genderValue === 'm') return '#1989fa'
    if (genderValue === 'f') return '#ff6ba3'
    return '#969799'
    })
  const formattedGender = computed(() => {
    const genderValue = String(userInfo.value.gender || '')

    if (genderValue === 'm') return '男'
    if (genderValue === 'f') return '女'
    return ''
    })
  // 获取性别图标
  const genderIcon = computed(() => {
    const genderValue = String(userInfo.value.gender || '')
    if (genderValue === 'm') return maleIcon.src
    if (genderValue === 'f') return femaleIcon.src
    return ''
  })
  const getUserInfo = async (userId: string) => {
    if (!userId) return
    userInfo.value =
        (await fetchData({
            fetchFn: getOtherUserInfo,
            fetchParams: userId,
            openCache: true,
        })) || {}
    // userStats.value = [
    //     { label: '获赞', value: userInfo.value.likeCount ?? 0 },
    //     { label: '关注', value: userInfo.value.followCount ?? 0 },
    //     { label: '粉丝', value: userInfo.value.fansCount ?? 0 },
    // ]    
   
  }
  const isFollowed = computed(() => {
    return props.userId === props.liveRoom.ownerId.value
        ? props.liveRoom.followedOwner.value
        : targetUserFollow.value
    })
  const changeFollowStatus = async () => {
    if (utils.isLoggedIn() === 'not-logged-in') {
      emit('show-login')
      return
    }
    isLoading.value = true
    await followAction()
    //await props.liveRoom.changeFollowStatus(props.liveRoom.ownerId.value, props.liveRoom.followedOwner.value)
    isLoading.value = false
  }
  const getRelation = async () => {
    if (props.userId !== null) {
      const results = await Promise.allSettled([
        getUserProfile(props.userId),
      ]);
      if (results[0].status === 'fulfilled' && results[0].value?.data) {
          if (props.userId === props.liveRoom.ownerId.value) {
            props.liveRoom.followedOwner.value = results[0].value.data.isFollowing
          }     
          targetUserFollow.value = results[0].value.data.isFollowing  
          userStats.value = [
            { label: '获赞', value: results[0].value.data.likedCount ?? 0 },
            { label: '关注', value: results[0].value.data.followingCount ?? 0 },
            { label: '粉丝', value: results[0].value.data.followerCount ?? 0 },
        ]
      } else {
        console.warn('获取用户基本资料失败');
      }
    }    
  }
  const followAction = async () => {
    if (props.userId !== null) {
      try {
        const res = await setFeedInteraction(props.userId, {
          action: isFollowed.value ? FeedAction.Unfollow : FeedAction.Follow,
          objectType: 'user',
          clientType: 0,
        })
        if (res.data.success) {
          
          targetUserFollow.value = !isFollowed.value
          if (
            targetUserFollow.value &&
            props.userId === props.liveRoom.ownerId.value
          ) {
            props.liveRoom.sendFollow()
          }
          if (props.userId === props.liveRoom.ownerId.value) {
            props.liveRoom.followedOwner.value = targetUserFollow.value
          }
          getRelation()
          showSuccessToast( !isFollowed.value ?  '已取消关注' : '关注成功' )
         }
        
      } catch (error) {
        showFailToast({
          message: targetUserFollow.value ? '取消关注失败' : '关注失败',
          duration: 2000,
        })
      }
    }    
  }
  watch(
    () => props.visible,
    (val: boolean) => {
        showFollowPopup.value = val
    }
  )
  watch(() => props.userId, () => {
    if (props.userId) {
        console.log(props.userId);
      getUserInfo(props.userId)
      getRelation()
    }  
  })
  const handleClose = () => {
    emit('update:visible', false)
    isLoading.value = false
  }
</script>
<template>
 
    <ActionSheet v-model:show="showFollowPopup" @close="handleClose">
      <div class="user-info-popup">
      <div class="content">
        <div class="personal-info flex a-i-c padding-left-right" @click="jumpTo(`/user/${userId}`)">
            <div class="left-avatar">
               <Image :src="getImageUrl(userInfo?.avatar)" />
            </div>
            <div class="right-info">
               <div class="nickname-box">
                <div class="nickname">{{ userInfo?.nickname }}</div>
               </div>
               <div class="user-id-box">
                  <span class="user-id">用户ID： {{ userInfo?.userId }}</span>
               </div> 
               <div class="sex-box">
                  <div class="sex-icon" v-if="genderIcon !== ''">
                    <img class="gender-icon" :src="genderIcon" alt="性别" />
                    <span class="gender-text" :style="{ color: genderColor }">{{ formattedGender }}</span>
                  </div>  
               </div>
            </div>
        </div>
        <div class="data-info padding-left-right">
            <div class="data-info-box">
              <div class="data-info-item" v-for="(item, index) in userStats" :key="index">
                <div class="data">{{ item.value }}</div>
                <div class="desc">{{ item.label }}</div> 
              </div>
            </div>
            <div class="remark-box">
              <span class="remark"></span>
            </div>
            <div class="btn-box" v-if="myId !== userId">
                <Button 
                    class="btn" 
                    :loading="isLoading"
                    :class="{ 'is-follow': isFollowed }"
                    @click="changeFollowStatus">
                    {{ isFollowed ? '已关注' : '关注' }}
                </Button>
            </div>
        </div>
      </div>
      </div>
    </ActionSheet> 
</template>
<style lang="scss" scoped>
.user-info-popup {
  .content {
    padding: 20px 0;
    background: #fafafa;
  }
  .personal-info {
    padding: 8px 0;
    border-bottom: 1px solid #eee;
    display: flex;
    align-items: center    
  }
  .padding-left-right {
    padding-left: 20px !important;
    padding-right: 20px !important;
  }
  .left-avatar {
    width: 68px;
    height: 68px;
    border-radius: 50%;
    overflow: hidden;
  }
  .right-info {
    margin-left: 12px;
  }
  .nickname-box {
    margin-bottom: 2px;
    align-items: center;
    display: flex;
  }
  .nickname-box .nickname {
    font-size: 16px;
    font-family: Arial Bold, Arial Normal, Arial, sans-serif;
    font-weight: 600;
    color: #333;
  }
  .user-id-box {
    margin-bottom: 2px;
    align-items: center;
    display: flex;
  }
  .user-id-box .user-id {
    font-size: 12px;
    color: #323233;
  }
  .sex-icon {
    font-size: 8px;
    padding: 1px 4px;
    width: fit-content;
    border-radius: 4px;
    background: #f0f0f0
  }
  .data-info-box {
    align-items: center;
    display: flex;
  }
  .data-info {
    padding: 8px 0;
    font-size: 14px;
  }
  .data-info-item {
    margin-right: 20px;
    display: flex;
  }
  .data-info .data-info-item .data {
    color: #333;
    font-weight: 700
  }
  .data-info .data-info-item .desc {
    margin-left: 2px;
    color: #797979
  }
  .remark-box {
    margin-top: 10px;
  }
  .remark-box .remark {
    font-size: 12px;
    white-space: pre-wrap;
  }
  .btn-box {
    margin-top: 12px;
    color: #000;
  }
  .btn-box .btn {
    display: flex;
    width: 100%;
    height: 28px;
    color: #fff;
    border-radius: 6px;
    background: rgb(235, 77, 96);
    border: none;
    align-items: center;
    justify-content: center;

  }
  .is-follow {
    background: rgb(240, 240, 240)!important;
  }
}  
:deep(.user-info-popup) {
  background: #fff;
  padding: 10px;
  max-width: 100%;
  position: fixed;
}
@media screen and (min-width: 768px) {
  :deep(.van-popup) {
    width: 480px !important;
    margin: 0 auto;
  }
}
</style>