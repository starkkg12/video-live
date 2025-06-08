<template>
  <div class="selected-item-wrapper" :class="{ actived: isNumberActived || selected }">
    <div class="checkbox-dot is-number-actived" v-if="isNumberActived">
      {{ isNumberActived ? selectedIndex + 1 : '' }}
    </div>
    <slot />
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'

  const props = withDefaults(
    defineProps<{
      selectedIndex?: number
      selected?: boolean
    }>(),
    {
      selectedIndex: -1,
      selected: false,
    }
  )

  const isNumberActived = computed(() => {
    return props.selectedIndex > -1
  })
</script>

<style scoped lang="less">
  @import '@/styles/variables.less';

  .selected-item-wrapper {
    position: relative;
    .checkbox-dot {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 20px;
      height: 20px;
      border-radius: 12px;
      background-color: @bg-black-opacity;
      border: 1px solid @text-grey;
      z-index: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #fff;
      font-size: 14px;
    }
    &.actived {
      &::before {
        content: ' ';
        border: 5px solid @text-green;
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: 3;
        border-radius: 8px;
      }

      .checkbox-dot {
        background-color: @text-green;
        border-color: @text-green;
      }
    }
  }
</style>
