<template>
  <div class="loading-container">
    <div class="ball ball-1"></div>
    <div class="ball ball-2"></div>
  </div>
</template>

<script>
export default {
  name: 'Loading',
}
</script>

<style scoped>
.loading-container {
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  z-index: 9999;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.ball {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  position: absolute;
  animation: move 1.5s infinite ease-in-out;
}

.ball-1 {
  background-color: #5ce0d8; /* 青色/绿色小球 */
  animation-delay: 0s;
}

.ball-2 {
  background-color: #ff5a7e; /* 粉红色/红色小球 */
  animation-delay: 0.75s; /* 半个动画周期的延迟，使两球交错运动 */
}

@keyframes move {
  0%,
  100% {
    transform: translateX(-10px);
  }
  50% {
    transform: translateX(10px);
  }
}
</style>
