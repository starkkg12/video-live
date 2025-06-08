<script setup lang="ts">
  type BackgroundType = '#07c160' | '#349cfc' | '#fc3434'
  defineProps<{
    bgColor: BackgroundType
    number: string
    description: string
  }>()
</script>
<template>
  <div class="container">
    <div class="image-container">
      <svg
        t="1727406242607"
        class="lottery-icon"
        :style="{ fill: bgColor }"
        viewBox="0 0 1058 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="6079"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        width="206.640625"
        height="200"
      >
        <path
          d="M531.968 0C248.832 0 19.968 229.376 19.968 512s229.376 512 512 512 512-229.376 512-512S814.592 0 531.968 0zM119.808 782.336c58.88 7.168 118.272 77.824 118.272 131.072-40.448-19.456-112.64-103.424-118.272-131.072z m348.16 49.664c-211.968 0-384-172.032-384-384s172.032-384 384-384 384 172.032 384 384-172.032 384-384 384z m116.736 161.792c30.72-66.56 244.224-162.304 294.4-157.184-36.352 90.112-210.432 169.984-294.4 157.184z m353.28-754.176c36.864 23.552 88.576 143.36 81.408 228.352-64-28.16-91.648-196.608-81.408-228.352z"
          p-id="6080"
        ></path>
      </svg>
      <div class="number">{{ number }}</div>
    </div>
    <div class="description">{{ description }}</div>
  </div>
</template>

<style scoped lang="less">
  .container {
    width: 100%;
    text-align: center;
    display: flex;
    flex-direction: column;

    .image-container {
      width: 100%;
      position: relative;

      .lottery-icon {
        width: 100%;
        height: 100%;
      }

      .number {
        position: absolute;
        top: 16%;
        left: 19%;
        font-size: min(5.5vw, 33px);
        transform: translateY(-10%);
      }
    }

    .description {
      font-size: 0.8rem;
    }
  }
</style>
