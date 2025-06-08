<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  number: string | number;
  animal: string;
  element: string;
  color?: 'red' | 'blue' | 'green';
}

const props = defineProps<Props>();

const ballColor = computed(() => {
  switch (props.color) {
    case 'red':
      return {
        border: '#e74c3c',
        background: 'rgba(231, 76, 60, 0.1)'
      };
    case 'blue':
      return {
        border: '#3498db',
        background: 'rgba(52, 152, 219, 0.1)'
      };
    case 'green':
      return {
        border: '#2ecc71',
        background: 'rgba(46, 204, 113, 0.1)'
      };
    default:
      return {
        border: '#3498db',
        background: 'rgba(52, 152, 219, 0.1)'
      };
  }
});
</script>

<template>
  <div class="lottery-ball-container">
    <div class="lottery-ball" :style="{
      borderColor: ballColor.border,
      backgroundColor: ballColor.background
    }">
      <span class="lottery-number">{{ number }}</span>
    </div>
    <div class="lottery-label">{{ animal }}/{{ element }}</div>
  </div>
</template>

<style scoped>
.lottery-ball-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 5px;
}

.lottery-ball {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 4px solid;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 5px;
}

.lottery-number {
  font-size: 20px;
  font-weight: bold;
  color: var(--van-text-color);
}

.lottery-label {
  font-size: 14px;
  color: var(--van-text-color);
}
</style>