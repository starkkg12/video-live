<template>
  <span @click="toggleShow" v-if="userId"><slot></slot></span>
  <van-popup
    v-model:show="showPopup"
    class="popup-for-user-panel"
    position="bottom"
    :round="!showProfile"
    teleport="body"
    v-on:close="closeUserInfo"
    close-icon="cross"
    :closeable="!showProfile"
    :class="{
      'show-profile': showProfile,
      'short-list': hasListData && !showLongList,
      'long-list': hasListData && showLongList,
      'is-self': hasListData && room?.checkIfSelf(userId),
    }"
  >
    <template v-if="!showProfile">
      <!-- <div v-if="!userInfo" class="loading-wrapper"><van-loading /></div> -->
      <div class="user-panel" v-if="userInfo">
        <div class="user-info" :class="{ small: showLongList }">
          <AvatarsPro :src="userInfo?.avatar ?? ''" :size="showLongList ? '32px' : '50px'" />
          <transition name="fade" appear>
            <div v-if="!showLongList" class="user-info-content">
              <div class="user-nickname">{{ utils.getNickname(userInfo.nickname, userInfo?.userId) }}</div>
              <div class="user-followers-likes">
                <div class="user-followers">
                  {{ utils.numberFormat(userInfo.fansCount) }}
                  <span>粉丝</span>
                </div>
                <div class="user-likes">
                  {{ utils.numberFormat(userInfo.acquireLikeCount + userInfo.likeCount) }}
                  <span>获赞与收藏</span>
                </div>
              </div>
              <div class="follow-wrapper">
                <Follow
                  :isRound="false"
                  v-if="room?.checkIfOwner(userId)"
                  :is-follow="room.followedOwner.value"
                  :user-id="userId"
                  size="small"
                  type="success"
                  cancel-text="已关注"
                  @change="room.getRelationWithOwner"
                ></Follow>
                <Follow
                  :isRound="false"
                  v-else
                  :user-id="userId"
                  size="small"
                  type="success"
                  cancel-text="已关注"
                ></Follow>
              </div>
            </div>
          </transition>
        </div>
        <div class="user-works" v-show="hasListData === true" v-if="userId">
          <UserForum
            :user-info="userInfo"
            :showLongList="showLongList"
            @changeLongList="changeLongList"
            @checkHasListData="checkHasListData"
          />
          <!-- <Tabs color="#07c160" shrink @change="handleTabChange">
            <Tab title="图纸" name="picture">
              <UserPicture :user-id="userId" :showLongList="showLongList" @changeLongList="changeLongList" />
            </Tab>
            <Tab title="论坛" name="forum">
              <UserForum :user-id="userId" :showLongList="showLongList" @changeLongList="changeLongList" />
            </Tab>
          </Tabs> -->
        </div>
        <div class="bottom-buttons">
          <Button class="button-profile" @click="toggleShowProfile">查看主页</Button>
        </div>
      </div>
    </template>
    <IframeWrapper v-else :src="`/user?userId=${userId}`" @close="toggleShowProfile" />
  </van-popup>
</template>

<script lang="ts" setup>
  import { onMounted, ref, onBeforeUnmount } from 'vue'
  import { Popup as VanPopup, Button } from 'vant'
  import utils from '@/utils'
  import service from '@/service'
  import UserForum from './_UserForum.vue'
  import IframeWrapper from './_IframeWrapper.vue'
  import Follow from '@/components/Follow.vue'
  import AvatarsPro from '@/pages/room/components/_AvatarsPro.vue'
  import { type RoomInterface } from 'src/composables/useRoom'

  const props = withDefaults(
    defineProps<{
      room?: RoomInterface
      userId?: string
    }>(),
    {
      userId: '',
    }
  )

  const showPopup = ref<boolean>(false)
  const userId = ref<string>(props.userId)
  const userInfo = ref<any>(null)
  const showProfile = ref<boolean>(false)
  const showLongList = ref<boolean>(false)
  // const shortLock = ref<boolean>(false)
  const hasListData = ref<boolean | null>(null)

  // const handleTabChange = (name: string) => {
  //   shortLock.value = true
  //   setTimeout(() => {
  //     shortLock.value = false
  //   }, 300)
  // }

  const checkHasListData = (value: boolean) => {
    hasListData.value = value
  }

  const changeLongList = (isShow: boolean) => {
    // if (shortLock.value) return
    showLongList.value = isShow
  }

  const initData = async () => {
    const response = await service.bbs.getOtherUserInfo(userId.value)
    if (response.data.errCode === '0') {
      userInfo.value = response.data.data
    }
  }

  const toggleShow = () => {
    if (!showPopup.value) {
      showUserInfo(userId.value)
    } else {
      closeUserInfo()
    }
  }

  const showUserInfo = (id: string) => {
    if (!id) return
    showPopup.value = true
    showLongList.value = false
    userId.value = id
    if (!userInfo.value) {
      initData()
    }
  }

  const closeUserInfo = () => {
    showPopup.value = false
    if (!props.userId) {
      userId.value = ''
      userInfo.value = null
    }
  }

  const toggleShowProfile = () => {
    showProfile.value = !showProfile.value
    if (!showProfile.value) {
      props.room?.getRelationWithOwner()
    }
  }

  onMounted(() => {
    props.room?.install('showUserInfo', showUserInfo)
  })

  onBeforeUnmount(() => {
    props.room?.uninstall('showUserInfo')
  })
</script>

<style scoped lang="less">
  @text-primary: #434343;
  @text-secondary: #656565;
  @text-green: #34c759;
  @border-color: #e0e0e0;
  @bg-color: #f2f2f2;
  @bg-color-green: #f4ffe8;
  @border-follow: #f82430;

  .popup-for-user-panel {
    overflow-y: visible;
    max-width: 600px;
    left: 50%;
    transform: translateX(-50%);
    transition: height 0.3s ease-in;

    &.short-list {
      height: 300px;
      .user-panel .user-works {
        height: calc(100% - 168px);
      }
    }
    &.long-list {
      height: calc(100% - 46px);
      .user-panel .user-works {
        height: calc(100% - 100px);
      }
    }

    &.is-self {
      height: 200px;
      &.short-list {
        height: 300px;
        .user-panel .user-works {
          height: calc(100% - 140px);
        }
      }
      &.long-list {
        height: calc(100% - 46px);
        .user-panel .user-works {
          height: calc(100% - 100px);
        }
      }
    }
    &.show-profile {
      transition: none;
      height: 100% !important;
    }
    :deep(.van-popup__close-icon) {
      color: @text-primary;
      top: 10px;
      right: 10px;
    }
    .user-panel {
      padding: 0 4px 10px;
      height: 100%;
      .loading-wrapper {
        height: 100px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .user-info {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin-top: -16px;
        .user-info-content {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        /* 定义动画 */
        .fade-enter-active,
        .fade-leave-active {
          transition: all 0.3s;
        }
        .fade-enter-from,
        .fade-leave-to {
          opacity: 0;
          height: 0;
        }
        .user-nickname {
          font-size: 18px;
          font-weight: 600;
          padding: 4px 0;
          color: @text-primary;
        }
        .user-followers-likes {
          display: flex;
          width: 100%;
          & > div {
            width: 50%;
            font-size: 16px;
            white-space: nowrap;
            line-height: 12px;
            color: @text-primary;
            font-weight: 600;
            span {
              color: @text-secondary;
              font-size: 12px;
              font-weight: 400;
            }
            &.user-followers {
              text-align: right;
              padding-right: 12px;
              border-right: 2px solid @border-color;
            }
            &.user-likes {
              text-align: left;
              padding-left: 12px;
            }
          }
        }
        &.small {
          border-bottom: 1px solid @border-color;
          padding: 6px 0;
          margin-top: 0;
        }
      }

      // .user-works {
      //   :deep(.van-tabs__wrap) {
      //     border-bottom: 1px solid #f1f1f1;
      //     .van-tab {
      //       font-size: 16px;
      //       color: #aaaaaa;
      //       &--active {
      //         font-size: 20px;
      //         color: #333;
      //       }
      //     }
      //   }
      // }

      .follow-wrapper {
        button {
          width: 100%;
          height: 24px;
          border-radius: 12px;
          border: 1px solid @border-follow;
          :deep(.van-button__text) {
            font-size: 14px;
            font-weight: 600;
            color: @border-follow;
          }
          &.is-follow {
            background-color: @bg-color !important;

            border: none !important;
            :deep(.van-button__text) {
              color: @text-secondary !important;
            }
          }
        }
      }
      .bottom-buttons {
        display: flex;
        justify-content: center;
        gap: 10px;
        padding: 0 8px;
        margin-top: 16px;
        button {
          width: 100%;
          height: 40px;
          border-radius: 8px;
          :deep(.van-button__text) {
            font-size: 18px;
            font-weight: 900;
          }
          &.is-follow {
            background-color: @bg-color !important;
            color: @text-secondary !important;
            border: none !important;
          }
          &.button-profile {
            background-color: @bg-color-green;
            color: @text-green;
          }
        }
      }
    }
    .iframe-wrapper {
      position: relative;
      .overwrite-back-button {
        position: absolute;
        top: 2px;
        left: 6px;
        width: 40px;
        height: 40px;
        z-index: 10;
      }
      .iframe-for-profile {
        height: calc(100vh - 7px);
        width: 100%;
        border: none;
      }
    }
  }
</style>
