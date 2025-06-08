<template>
  <div class="wave-dance" :class="{ actived: hasVoice }">
    <template v-if="!closeNow">
      <div class="circle circle1"></div>
      <div class="circle circle2"></div>
      <div class="circle circle3"></div>
    </template>
    <slot />
  </div>
</template>

<script lang="ts" setup>
  const props = withDefaults(
    defineProps<{
      hasVoice?: boolean
      closeNow?: boolean
    }>(),
    {
      hasVoice: false,
      closeNow: false,
    }
  )
</script>

<style scoped lang="less">
  .wave-dance {
    position: relative;
    &.actived {
      > div.circle {
        animation: growAndFade 3s infinite ease-out;
        border-radius: 50%;
        height: 100%;
        opacity: 0;
        position: absolute;
        width: 100%;
        border: 1px solid #34c759;
        &.circle1 {
          animation-delay: 1s;
        }
        &.circle2 {
          animation-delay: 2s;
        }
        &.circle3 {
          animation-delay: 3s;
        }
      }
    }
  }

  @keyframes growAndFade {
    0% {
      opacity: 1;
      transform: scale(1);
      border-width: 3px;
    }
    100% {
      opacity: 0;
      transform: scale(1.4);
      border-width: 1;
    }
  }
</style>
