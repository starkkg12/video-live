<template>
  <div class="user-forum">
    <List
      class="list-for-forum"
      :class="{ 'long-list': showLongList }"
      @load="initData"
      :loading="isLoading"
      :finished="isFinished"
      finished-text="没有更多了..."
    >
      <div class="forum-item" v-for="(item, index) in listData" :key="index">
        <div class="forum-user">
          <AvatarsPro :src="item.avatar ?? ''" size="30px" />
          <div class="forum-user-info">
            <span class="nickname">{{ utils.getNickname(userInfo.nickname, userInfo.userId) }}</span>
            <span class="createtime">{{ utils.displayTime(item.postTime) }}</span>
          </div>
        </div>
        <div class="forum-content">
          <h6 class="forum-content-title">
            <span class="forum-issue" v-if="item.shortIssue">第{{ item.shortIssue }}期</span>
            {{ item.title }}
          </h6>
          <div class="forum-content-text" v-html="item.postContent" />
        </div>
        <div class="forum-attachments">
          <AsyncImage
            v-for="(i, index) in item.attachments"
            :key="index"
            :src="utils.getImageUrl(i.url)"
            width="100px"
            alt=""
          />
        </div>
        <div class="forum-total">
          <div class="forum-values">
            <div>
              <van-icon :name="heartIcon.src" size="16" round />
              {{ item.likeCount }}
            </div>
            <div>
              <van-icon :name="commentIcon.src" size="16" round />
              {{ item.threadCount }}
            </div>
            <!-- <div>{{ item.threadCount }}</div> -->
            <div>
              <van-icon :name="eyeIcon.src" size="16" round />
              {{ item.readCount }}
            </div>
          </div>
          <div class="forum-game-name">
            {{ utils.getGameByTypeOrCode({ gameType: item.gameTypeCode })?.name }}
          </div>
        </div>
      </div>
      <IntersectionObserver @change="handleObserver" />
    </List>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, watch } from 'vue'
  import { Image as VanImage, List, Icon as VanIcon } from 'vant'
  import utils from '@/utils'
  import service from '@/service'
  import IntersectionObserver from '@/components/IntersectionObserver.vue'
  import heartIcon from '@/assets/icons/room/heart.svg'
  import commentIcon from '@/assets/icons/room/comment.svg'
  import eyeIcon from '@/assets/icons/room/eye.svg'
  import AvatarsPro from '@/pages/room/components/_AvatarsPro.vue'
  import { useFetchListData, type UseFetchListDataInterface } from 'src/composables/useFetchListData'
  import AsyncImage from '@/components/AsyncImage.vue'

  const props = withDefaults(
    defineProps<{
      userInfo?: any
      showLongList?: boolean
    }>(),
    {
      userInfo: null,
      showLongList: false,
    }
  )

  const emits = defineEmits<{
    changeLongList: [boolean]
    checkHasListData: [boolean]
  }>()

  const { fetchList, listData, isLoading, isFinished, listTotal }: UseFetchListDataInterface = useFetchListData()

  const handleObserver = (isShow: boolean) => {
    emits('changeLongList', !isShow)
  }

  const initData = async () => {
    fetchList({
      fetchFn: service.bbs.getBBSForumPost,
      fetchParams: {
        postUserId: props.userInfo?.userId,
      },
    })
  }

  watch([listTotal], () => {
    emits('checkHasListData', listTotal.value > 0)
  })

  onMounted(() => {
    initData()
  })
</script>

<style scoped lang="less">
  @text-primary: #434343;
  @text-secondary: #656565;
  @text-grey: #aeaeb1;
  @text-blue: #6da8ff;
  @border-color: #e0e0e0;
  @bg-color: #dcf3ff;
  .user-forum {
    padding: 8px 0;
    height: 100%;
    .list-for-forum {
      height: 100%;
      overflow-x: hidden;
      overflow-y: auto;
      overscroll-behavior-y: none;
      .forum-item {
        padding: 8px;
        border-radius: 8px;
        margin: 8px 8px 12px;
        box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.1);
        color: @text-primary;
        .forum-user {
          display: flex;
          align-items: center;
          gap: 8px;
          &-info {
            display: flex;
            flex-direction: column;
            justify-content: center;
            font-size: 12px;
            line-height: 16px;
            .nickname {
              font-size: 16px;
              color: @text-secondary;
              font-weight: 600;
            }
            .createtime {
              color: @text-grey;
              font-size: 12px;
            }
          }
        }
        .forum-content {
          padding: 8px 0;
          &-title {
            font-size: 16px;
            font-weight: 600;
            .forum-issue {
              background-color: @bg-color;
              color: @text-blue;
              border-radius: 4px;
              font-size: 12px;
              padding: 4px;
              margin-right: 4px;
            }
          }
        }
        .forum-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          .forum-values {
            display: flex;
            align-items: center;
            gap: 8px;
            width: 80%;
            & > div {
              width: 25%;
              display: flex;
              align-items: center;
              gap: 4px;
              font-size: 14px;
              color: @text-grey;
            }
          }
          .forum-game-name {
            color: @text-grey;
            font-size: 16px;
          }
        }
      }
    }
  }
</style>
