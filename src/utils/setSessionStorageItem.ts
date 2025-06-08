/**
 * 将数据存储到 sessionStorage
 */
export default function setSession(key: string, value: any) {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(key, value)
}
