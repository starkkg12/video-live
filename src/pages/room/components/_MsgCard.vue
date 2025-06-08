<template>
  <div class="msg-card" v-html="htmlString"></div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    msg?: string
  }>(),
  {}
)
const htmlString = computed(() => {
  const urlRegex = /(\b(https?:\/\/|www\.)[^\s]+)/gi // 支持 www. 和 http(s)://
  const result = (props.msg ?? '').replace(urlRegex, url => {
    const idMatch = url.match(/voiceRoom\/(\d+)/)
    const targetType = !!idMatch ? '_self' : '_blank'
    const href = url.startsWith('http') ? url : `http://${url}` // 自动补全协议
    return `<a href="${href}" target="${targetType}">${url}</a>`
  })

  return result
})
</script>

<style scoped lang="less">
@import '@/styles/variables.less';

.msg-card {
  font-size: 14px;
  line-height: 16px;
  display: inline;
  :deep(a) {
    color: @bg-blue;
  }
}
</style>
