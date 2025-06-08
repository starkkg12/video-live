<script setup lang="ts">
import { ref, watch, watchEffect } from 'vue'
import { Calendar } from 'vant'

const emit = defineEmits<{
  (e: 'confirm', payload: { start: string, end: string }): void
  (e: 'close'): void
}>()
const props = defineProps(['startDate', 'endDate'])
// 获取当前日期
const today = new Date();

// 获取当前年份和月份
const currentYear = today.getFullYear();
const currentMonth = today.getMonth(); // 注意：getMonth() 返回的月份是从 0 开始的

// 获取本月的最后一天
const maxDate = new Date(currentYear, currentMonth + 1, 0);
const minDate = new Date(1999, 11, 31);
const showCalendar = ref(true)
const currentDate = ref<[Date, Date]>([
  props.startDate !== null ?  new Date(props.startDate) : 
  new Date(new Date().setDate(new Date().getDate() - 1)),
  props.endDate !== null ? new Date(props.endDate) : new Date(),
])

const onConfirm = () => {
  const [start, end] = currentDate.value;
  emit('confirm', {
    start: formatDate(start),
    end: formatDate(end),
  });
  showCalendar.value = false;
};
const onSelect = (value: Date | [Date, Date]) => {
  if (Array.isArray(value)) {
    currentDate.value = value.length === 1 ? [value[0]] : value
  } else {
    currentDate.value = [value]
  }
}

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
watchEffect(() => {
  const val = currentDate.value
  if (val && val.length === 1) {
    currentDate.value = [val[0], undefined as any]
  }
})
watch(() => props.startDate, () => {
    currentDate.value = [new Date(props.startDate), new Date(props.endDate)]
})
</script>

<template>
     <Calendar
       calendar
       title="日期选择"
       :poppable="false"
       :show-confirm="false"
       @select="onSelect"
       color="#eb4d60"
       v-model:default-date="currentDate"
       :max-date="maxDate"
       :min-date="minDate"
        type="range"
    >
    <template #footer>

        <button 
          class="custom-footer" 
          :class="{'btn-disabled': !currentDate[1] }"
          :disabled="!currentDate[1]" @click=onConfirm>确认</button>
    </template>
    </Calendar>
</template>

<style scoped>
.date-picker {
  display: flex;
  flex-direction: column;
  height: 90vh;
  background: #fff;
  width: var(--custom-max-width);
  max-width: 100%;
  margin: 0 auto;
  overflow: hidden;
}

.header {
  background: #fff;
  z-index: 10;
}
.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
}
.header-top .title {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: bold;
}
.header-top .close {
  font-size: 18px;
  cursor: pointer;
}

/* Footer */
.footer {
  padding: 12px 16px;
  background: #fff;
  box-shadow: 0 -2px 6px rgba(0,0,0,0.1);
}
.custom-footer {
  width: 100%;
  background: #eb4d60;
  color: white;
  border: none;
  padding: 8px;
  font-size: 16px;
  text-align: center;
  border-radius: 999px;
}
.btn-disabled {
  color: white;
  background: #EB4D60;
  border-color: #EB4D60;
  opacity: 0.5;
}
.van-calendar {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #fff;
}
.van-calendar-body {
  font-size: 16px;
}
:deep(.van-calendar__footer) {
    height: var(--van-calendar-confirm-button-height);
    margin: var(--van-calendar-confirm-button-margin);
}
:deep(.van-calendar__month-title), 
:deep(.van-calendar__header-title), 
:deep(.van-calendar__header-subtitle) {
    color: #323233;
    height: 44px;
    font-weight: 600;
    line-height: 44px;
    text-align: center;
}

</style>
