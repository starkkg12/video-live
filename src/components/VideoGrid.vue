<script setup lang="ts">
import { useCurrentUser } from '@/composables/useCurrentUser'
import type { UserVideo } from '@/service/api'
import { Icon, Image as VanImage } from 'vant'
import { computed } from 'vue'
import { formatNumber } from '../utils/format'

const props = defineProps({
  videos: {
    type: Array as () => UserVideo[],
    default: () => [],
  },
  columns: {
    type: Number,
    default: 3,
  },
  showTitle: {
    type: Boolean,
    default: false,
  },
  aspectRatio: {
    type: String,
    default: '1/1',
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const { isCurrentUser } = useCurrentUser()

const emit = defineEmits(['itemClick'])

const columnWidth = computed(() => {
  // 计算每列的宽度(减去间隙)
  return `calc(${100 / props.columns}% - ${((props.columns - 1) * 8) / props.columns}px)`
})

const handleItemClick = (item: UserVideo) => {
  emit('itemClick', item)
}
</script>

<template>
  <div class="video-grid-container">
    <transition-group v-if="videos.length > 0" class="video-grid" name="video-item" tag="div">
      <div
        class="grid-item"
        v-for="item in videos"
        :key="item.id"
        @click="handleItemClick(item)"
        :style="{ width: columnWidth }"
        :data-id="item.id"
      >
        <div class="grid-item-poster" :style="{ aspectRatio }">
          <VanImage
            :src="item.poster || item.preview"
            alt="poster"
            fit="cover"
            radius="8"
            error-icon="photo-fail"
            loading-icon="photo"
          />
          <div class="likes">
            <Icon name="like-o" class="like-icon" />
            <span>{{ formatNumber(item?.likeCount || 0) }}</span>
          </div>
          <div v-if="!isCurrentUser"></div>
          <div v-else-if="item.auditStatus === 0" class="status-label status-audit">审核中</div>
          <div v-else-if="item.auditStatus === 2" class="status-label status-reject">审核拒绝</div>
          <div
            v-else-if="item.auditStatus === 1 && item.transcodingStatus === 1"
            class="status-label status-transcode"
          >
            转码中
          </div>
        </div>
        <div v-if="showTitle" class="grid-item-title">{{ item.title }}</div>
      </div>
    </transition-group>
    <div v-else-if="loading" class="loading-state">
      <div
        v-for="i in 15"
        :key="i"
        class="skeleton-item"
        :style="{ aspectRatio, width: columnWidth }"
      ></div>
    </div>
    <div v-else class="empty-data">
      <slot name="empty">暂无数据</slot>
    </div>
  </div>
</template>

<style lang="less" scoped>
.video-grid-container {
  width: 100%;
}

.video-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  position: relative;
  will-change: height;
}

/* 视频项移除动画 */
.video-item-enter-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.video-item-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
  z-index: 0;
}

.video-item-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}

.video-item-leave-to {
  opacity: 0;
  transform: scale(0.85);
}

.video-item-move {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
}

.grid-item {
  margin-bottom: 8px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;

  /* 添加待移除高亮效果 */
  &.pending-removal {
    background-color: rgba(255, 0, 0, 0.05);
    transform: scale(0.96);
    border-radius: 8px;
    box-shadow: 0 0 0 2px rgba(255, 0, 0, 0.2);
  }

  &-poster {
    position: relative;
    width: 100%;
    overflow: hidden;

    :deep(.van-image) {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .likes {
      position: absolute;
      bottom: 6px;
      left: 6px;
      background-color: rgba(0, 0, 0, 0.6);
      color: white;
      font-size: 12px;
      padding: 2px 6px;
      border-radius: 10px;
      display: flex;
      align-items: center;

      .like-icon {
        color: #ffffff;
        margin-right: 4px;
        font-size: 14px;
      }
    }

    .status-label {
      position: absolute;
      top: 6px;
      right: 6px;
      background-color: rgba(0, 0, 0, 0.6);
      color: white;
      font-size: 12px;
      padding: 2px 6px;
      border-radius: 10px;

      &.status-audit {
        background-color: rgba(255, 152, 0, 0.8);
      }

      &.status-reject {
        background-color: rgba(244, 67, 54, 0.8);
      }

      &.status-transcode {
        background-color: rgba(33, 150, 243, 0.8);
      }
    }
  }

  &-title {
    font-size: 12px;
    margin-top: 4px;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--van-text-color);
  }
}

.loading-state {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .skeleton-item {
    margin-bottom: 8px;
    background: linear-gradient(
      90deg,
      var(--van-gray-1) 25%,
      var(--van-gray-2) 50%,
      var(--van-gray-1) 75%
    );
    background-size: 200% 100%;
    animation: loading 2s infinite;
    border-radius: 8px;
  }
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.empty-data {
  text-align: center;
  padding: 40px 0;
  color: var(--van-text-color-secondary);
  font-size: 14px;
}
</style>
