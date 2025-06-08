<script setup lang="ts">
import until from '@/utils'
import { formatMessageTime } from '@/utils/formatDate'
import { onMounted, ref } from 'vue'

const props = defineProps<{
  auther: string
  time: string
  content: string
  labels: Record<string, any>[]
  userId: number
  gameTypeName: string
}>()
const labelList = props.labels
const moreThanOneLine = ref(false)
const showAll = ref(false)
const descContent = ref<HTMLElement | null>(null)

const jumpToUser = () => {
  until.jumpTo(`/user/${props.userId}`)
}

const jumpToTag = (tag: string) => {
  until.jumpTo(`/?keyWord=${tag}`)
}

const checkIfShowMore = () => {
  if (descContent.value) {
    const element = descContent.value
    return element.scrollHeight > element.clientHeight
  }
  return false
}

onMounted(() => {
  moreThanOneLine.value = checkIfShowMore()
})
</script>
<template>
  <div class="video-description safe-area-inset-bottom">
    <div class="video-game-info" v-if="gameTypeName">
      <div class="video-game-info-name">
        {{ gameTypeName }}
      </div>
    </div>
    <div class="auther">
      <span @click="jumpToUser()">@{{ auther }}</span>
      <i>{{ formatMessageTime(new Date(time).getTime()) }}</i>
    </div>
    <div class="content">
      <div
        class="desc"
        :class="{
          'show-all': showAll,
        }"
        ref="descContent"
      >
        {{ content }}
        <template v-if="labels">
          <span
            v-for="label in labelList"
            :key="label.id"
            class="label"
            @click="jumpToTag(label.name)"
            >#{{ label.name }}</span
          >
        </template>
        <span class="more" v-if="moreThanOneLine && showAll" @click="showAll = false">收起</span>
      </div>
      <span class="more" v-if="moreThanOneLine && !showAll" @click="showAll = true">展开</span>
    </div>
  </div>
</template>

<style scoped lang="less">
.video-description {
  position: absolute;
  z-index: 99;
  padding: 10px;
  bottom: 30px;
  left: 0;
  right: 50px;
  color: var(--van-text-color);
  font-size: 14px;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.8);
  .auther {
    span {
      font-weight: bold;
      font-size: 16px;
    }
    i {
      font-size: 12px;
      font-style: normal;
      margin-left: 10px;
    }
  }
  .content {
    line-height: 20px;
    display: flex;
    .desc {
      flex: 1;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      .label {
        font-weight: bold;
        margin-right: 5px;
      }
    }
    .show-all {
      white-space: normal;
      height: auto;
      word-break: break-all;
      -webkit-line-clamp: 10;
    }
    .more {
      font-weight: bold;
      width: 30px;
    }
  }

  &.safe-area-inset-bottom {
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
  }
  .video-game-info {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: #ffffff1a;
    border-radius: 7px;
    padding: 5px 7px;
    gap: 4px;
    .video-game-info-name {
      font-size: 13px;
    }
  }
}
</style>
