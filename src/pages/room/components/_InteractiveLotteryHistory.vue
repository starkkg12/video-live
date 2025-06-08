<template>
  <NavBar safe-area-inset-top placeholder class="nav-bar" title="历史开奖">
    <template #right>
      <van-icon name="cross" size="24" color="#434343" @click="emit('close')" />
    </template>
  </NavBar>
  <div class="interactive-history">
    <LotteryBallDisplayBySelf
      :game-code="room.info.value.gameTypeCode"
      :year="new Date().getFullYear().toString()"
      :isInRoom="true"
    />
  </div>
</template>

<script lang="ts" setup>
  import { Icon as VanIcon, NavBar } from 'vant'
  import LotteryBallDisplayBySelf from '@/components/LotteryBallDisplayBySelf.vue'

  const props = withDefaults(
    defineProps<{
      room: any
    }>(),
    {
      room: null,
    }
  )
  const emit = defineEmits<{
    close: [type?: 'all']
  }>()
</script>

<style scoped lang="less">
  .interactive-history {
    padding: 4px 8px 12px;
    background-color: #fff;
    .lottery-wrapper {
      padding: 8px;
      box-shadow: 0px 0px 8px 0px #0000001a;
      border-radius: 8px;
    }
  }
</style>
