import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn' // 导入中文语言包
import relativeTime from 'dayjs/plugin/relativeTime' // 相对时间插件
import weekday from 'dayjs/plugin/weekday' // 星期插件
import isToday from 'dayjs/plugin/isToday' // 是否为今天插件
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore' // 比较插件

// 加载插件
dayjs.extend(relativeTime)
dayjs.extend(weekday)
dayjs.extend(isToday)
dayjs.extend(isSameOrBefore)
dayjs.locale('zh-cn') // 使用中文

const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

/**
 * 格式化消息时间为相对友好格式
 * 今天：今天 HH:MM
 * 昨天：昨天 HH:MM
 * 本周：周X
 * 本年内：M月D日
 * 超过一年：YYYY年M月D日
 */
export function formatMessageTime(timestamp: number): string {
  const date = dayjs(timestamp)
  const now = dayjs()
  
  // 今天
  if (date.isToday()) {
    return `今天 ${date.format('HH:mm')}`
  }
  
  // 昨天
  const yesterday = now.subtract(1, 'day')
  if (date.date() === yesterday.date() && 
      date.month() === yesterday.month() && 
      date.year() === yesterday.year()) {
    return `昨天 ${date.format('HH:mm')}`
  }
  
  // 本周内（从周一开始计算一周）
  const startOfWeek = now.weekday(0).startOf('day')
  if (date.isAfter(startOfWeek)) {
    return weekDays[date.day()]
  }
  
  // 今年内
  if (date.year() === now.year()) {
    return date.format('M月D日')
  }
  
  // 超过一年
  return date.format('YYYY年M月D日')
} 