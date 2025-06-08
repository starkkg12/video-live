<script setup lang="ts"></script>
<template>
  <div class="noData-wrap">
    <div class="content">
      <p class="iconfont desc-icon icon-no-data"></p>
      <div class="text">暂无数据</div>
    </div>
  </div>
</template>
<style scoped>
.noData-wrap {
  padding: 10px 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c9c9c9;
  padding-top: 15vh;
  padding-bottom: 20vh;
}
.noData-wrap .content {
  width: 80%;
  transform: scale(1.2);
  animation: scaleAnimation-af3e8e38 0.35s forwards;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
.noData-wrap .content .desc-icon {
  width: 107px;
  height: 76px;
  display: inline-block;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-position: center;
  flex-shrink: 0;
}
.icon-no-data {
  font-size: 70px;
  color: rgb(160, 160, 160);
  background-image: url('../assets/icons/nodata.svg');
}

.icon-no-data .text {
  font-size: 13px;
  color: #a0a0a0;
  margin-top: 10px;
}
</style>
