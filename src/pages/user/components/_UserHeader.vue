<script setup lang="ts">
import femaleIcon from '@/assets/icons/female.svg'
import maleIcon from '@/assets/icons/male.svg'
import setting from '@/assets/icons/setting.svg'
import bgImage from '@/assets/images/bg.jpeg'
import defaultAvatar from '@/assets/images/default-avatar.png'
import CustomImage from '@/components/CustomImage.vue'
import { useCurrentUser } from '@/composables/useCurrentUser'
import type { EnhancedUser } from '@/service/userEnhanced'
import utils from '@/utils'
import jumpTo from '@/utils/jumpTo'
import { Icon, NavBar } from 'vant'
import { computed } from 'vue'

const props = defineProps({
  userId: {
    type: String,
    default: '',
  },
  userInfo: {
    type: Object as () => EnhancedUser | undefined,
    default: undefined,
  },
  isLoggedIn: {
    type: Boolean,
    default: false,
  },
})

const { isCurrentUser } = useCurrentUser()

const emit = defineEmits(['back', 'copy-id'])

const userBgImage = computed(() => {
  return `linear-gradient(0deg, rgba(0, 0, 0, 0.8) 10%, transparent 50%), url(${bgImage.src}) center center / cover no-repeat`

  return `linear-gradient(0deg, rgba(0, 0, 0, 0.8) 10%, transparent 50%), url(${utils.getImageUrl(props.userInfo?.avatar, 'avatar')}) center center / cover no-repeat`

  return `linear-gradient(0deg, rgba(0, 0, 0, 0.8) 10%, transparent 50%)`
})

const formattedGender = computed(() => {
  const genderValue = String(props.userInfo?.gender || '')

  if (genderValue === 'm') return '男'
  if (genderValue === 'f') return '女'
  return ''
})

// 获取性别颜色
const genderColor = computed(() => {
  const genderValue = String(props.userInfo?.gender || '')

  if (genderValue === 'm') return '#1989fa'
  if (genderValue === 'f') return '#ff6ba3'
  return '#969799'
})

// 获取性别图标
const genderIcon = computed(() => {
  const genderValue = String(props.userInfo?.gender || '')

  if (genderValue === 'm') return maleIcon.src
  if (genderValue === 'f') return femaleIcon.src
  return ''
})

// 是否显示性别
const showGender = computed(() => {
  const genderValue = String(props.userInfo?.gender || '')
  // 只有明确设置为男或女时才显示
  return genderValue === 'm' || genderValue === 'f'
})
</script>

<template>
  <div class="top" :style="{ background: userBgImage }">
    <div class="nav-wrap">
      <NavBar
        class="nav-bar"
        safe-area-inset-top
        title=""
        left-text=""
        left-arrow
        @click-left="emit('back')"
      >
        <template #right>
          <div class="nav-right" v-if="isCurrentUser">
            <Icon :name="setting.src" size="min(25px, 4vw)" @click="jumpTo('/user/set')" />
          </div>
        </template>
      </NavBar>
    </div>

    <div class="user-info">
      <CustomImage
        class="avatar"
        round
        fit="cover"
        :src="userInfo?.avatar"
        :style="{ visibility: isLoggedIn !== undefined ? 'visible' : 'hidden' }"
        height="80px"
        :error-image="defaultAvatar.src"
      />
      <div class="user-nickname-area">
        <div class="nickname-wrapper">
          <div class="nickname-info">
            <div class="nickname">{{ userInfo?.nickname }}</div>
          </div>
        </div>
        <div class="userId">
          <span>用户ID：{{ userInfo?.userId }}</span>
          <div class="fuzhi" @click="emit('copy-id')"></div>
        </div>
        <div v-if="showGender" class="user-gender">
          <img class="gender-icon" :src="genderIcon" alt="性别" />
          <span class="gender-text" :style="{ color: genderColor }">{{ formattedGender }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.top {
  overflow-y: hidden;
  aspect-ratio: 2 / 1;
  padding: 0 20px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: calc(env(safe-area-inset-top) + 25vh);
}

.nav-wrap {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1;
}

.nav-bar {
  background-color: transparent !important;
}

.user-info {
  display: flex;
  width: 100%;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px solid #fff;
}

.user-nickname-area {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  padding-left: 1rem;
  color: #fff;
}

.nickname-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 100%;
}

.nickname-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  overflow: hidden;
}

.nickname {
  font-size: min(5vw, 24px);
  font-weight: bold;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.userId {
  display: flex;
  gap: 5px;
  font-size: 11px;
  color: #fff;
}

.user-gender {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #fff;
  margin-top: 5px;
}

.gender-icon {
  width: 16px;
  height: 16px;
  vertical-align: middle;
}

.gender-text {
  margin-left: 2px;
}

.fuzhi {
  width: 13px;
  height: 13px;
  display: inline-block;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-position: center;
  flex-shrink: 0;
  background-image: url('../../../assets/icons/iconfuzhi.svg');
}

.nav-right {
  display: flex;
  align-items: center;
  padding: 0 8px;
}

:deep(.van-nav-bar) {
  background-color: transparent !important;
  box-shadow: none !important;
  border-bottom: none !important;
}

:deep(.van-nav-bar__title) {
  color: #fff !important;
}

:deep(.van-icon-arrow-left) {
  color: #fff !important;
}

:deep(.van-hairline--bottom::after) {
  display: none !important;
}
</style>
