<template>
  <div class="user-relation">{{ usersRelationDictionary[userId ?? '']?.relationText }}</div>
</template>

<script lang="ts" setup>
  import { onMounted, computed } from 'vue'
  import { type LiveRoomInterface } from '@/composables/useLiveRoom'

  const props = withDefaults(
    defineProps<{
      room?: LiveRoomInterface
      cacheData?: any
      userId?: string
      relationText?: string
    }>(),
    {}
  )

  const usersRelationDictionary = computed(() => {
    return props.relationText && props.userId
      ? { [props.userId]: { relationText: props.relationText } }
      : props.cacheData?.usersRelationDictionary.value || {}
  })

  onMounted(() => {
    if (!props.relationText && props.userId) {
      const addUsersRelationDictionary: any =
        props.cacheData?.addUsersRelationDictionary

      addUsersRelationDictionary && addUsersRelationDictionary([props.userId])
    }
  })
</script>

<style scoped lang="less">
  @import '@/styles/variables.less';
  .user-relation {
    font-size: 14px;
    color: @text-grey;
    white-space: nowrap;
  }
</style>
