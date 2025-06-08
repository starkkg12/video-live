import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import dayjs from 'dayjs'
dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

/**
 * 格式化时间
 *
 * @param date -第一个参数是时间戳
 * @param interval - 第二个参数是间隔天数
 * @returns 返回值是格式化后的时间
 */
export default function displayTime(date: number, interval: number = 10, format: string = 'YYYY-MM-DD HH:mm'): string {
  const now = dayjs() // Current date and time
  const postTime = dayjs(date) // Date to be formatted
  const diffDays = now.diff(postTime, 'day') // Difference in days

  if (diffDays > interval) {
    // If the difference exceeds the interval, format as 'YYYY-MM-DD HH:mm'
    return postTime.format(format)
  } else {
    // Otherwise, return a relative time string
    return postTime.fromNow()
  }
}
