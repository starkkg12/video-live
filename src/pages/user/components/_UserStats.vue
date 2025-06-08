<script setup lang="ts">
import { useCurrentUser } from '@/composables/useCurrentUser'
import type { EnhancedUser } from '@/service/userEnhanced'
import utils from '@/utils'
import jumpTo from '@/utils/jumpTo'
import { computed } from 'vue'
import { formatNumber } from '../../../utils/format'

const props = defineProps<{
  userInfo?: EnhancedUser
}>()

const emit = defineEmits<{
  (e: 'follow'): void
}>()

const { isCurrentUser } = useCurrentUser()

const tab1 = computed(() => [
  {
    value: props.userInfo?.likedCount ?? 0,
    label: '获赞',
  },
  {
    value: props.userInfo?.followingCount ?? 0,
    label: '关注',
    onClick: () => {
      jumpTo(`/user/follow/${props.userInfo?.userId}?tab=following`)
    },
  },
  {
    value: props.userInfo?.followerCount ?? 0,
    label: '粉丝',
    onClick: () => {
      jumpTo(`/user/follow/${props.userInfo?.userId}?tab=followers`)
    },
  },
])

const tab2 = [
  {
    link: '/my/wallet',
    class: 'icon-wallet',
    label: '我的钱包',
    onClick: () => {
      utils.showDevelopingToast()
    },
  },
  {
    link: '/message',
    class: 'icon-xiaoxiguanl',
    label: '消息中心',
    onClick: () => {
      jumpTo('/message')
    },
  },
  {
    link: '/history',
    class: 'icon-jurassic_wait',
    label: '浏览记录',
    onClick: () => {
      jumpTo('/history')
    },
  },
]
</script>

<template>
  <div class="tab">
    <div class="desc-i">
      <div
        class="desc-i-i"
        v-for="item in tab1"
        :key="item.label"
        :class="{ clickable: item.onClick }"
        @click="item.onClick && item.onClick()"
      >
        <div>{{ formatNumber(item.value) }}</div>
        <div>{{ item.label }}</div>
      </div>
      <div style="flex: 1 1 0%"></div>
      <div v-if="isCurrentUser" class="desc-i-b" @click="jumpTo('/user/editinfo')">编辑主页</div>
    </div>

    <div class="desc-iii"></div>

    <div class="desc-iiii" v-if="isCurrentUser">
      <div v-for="item in tab2" :key="item.link" @click="item.onClick && item.onClick()">
        <span :class="['iconfont', 'desc-icon', item.class]"></span>
        <div class="desc-iiii-t">{{ item.label }}</div>
      </div>
    </div>

    <van-button
      v-else
      :class="{
        'follow-button': true,
        'follow-button-unfollow': userInfo?.isFollowing,
        'follow-button-active': !userInfo?.isFollowing,
      }"
      :type="userInfo?.isFollowing ? 'default' : 'primary'"
      size="small"
      @click="emit('follow')"
    >
      {{ userInfo?.isFollowing ? '已关注' : '关注' }}
    </van-button>
  </div>
</template>

<style scoped>
.tab {
  padding: 12px 16px 0;
}

.desc-i {
  display: flex;
  align-items: center;
}

.desc-i-i {
  margin-right: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.desc-i-i > div:nth-child(1) {
  font-size: 17px;
  color: var(--van-text-color);
}

.desc-i-i > div:nth-child(2) {
  font-size: 13px;
  color: var(--custom-fill-t);
}

.desc-i-i.clickable {
  cursor: pointer;
}

.desc-i-i.clickable:hover {
  opacity: 0.8;
}

.desc-iii {
  padding-top: 10px;
  display: flex;
}

.desc-iiii {
  padding: 20px 0 10px;
  display: flex;
}

.desc-iiii-t {
  padding-top: 5px;
  color: var(--van-text-color);
}

.desc-iiii > div {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 30px;
  font-size: 12px;
  color: var(--fill-t1, #333);
  padding-bottom: 5px;
}

.desc-i-b {
  height: 28px;
  padding: 0 16px;
  background: var(--van-gray-3);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  border-radius: 5px;
  line-height: 28px;
}

.follow-button {
  height: 30px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 5px;
  padding: 0 16px;
  user-select: none;
  width: 100%;
  margin-top: 10px;
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.follow-button-unfollow {
  background-color: var(--van-gray-3);
}

.follow-button-active {
  background-color: var(--van-primary-color);
}

.desc-icon {
  width: 26px;
  height: 28px;
  display: inline-block;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-position: center;
  flex-shrink: 0;
}

.icon-wallet {
  background-image: url('../../../assets/icons/wallet.svg');
}

.icon-xiaoxiguanl {
  background-image: url('../../../assets/icons/xiaoxiguanl.svg');
}

.icon-jurassic_wait {
  background-image: url('../../../assets/icons/jurassic_wait.svg');
}
</style>
