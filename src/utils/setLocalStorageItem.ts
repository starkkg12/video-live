/**
 * 将数据存储到localStorage
 */
export default function setLSItem(key: string, value: any) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, value)
}
