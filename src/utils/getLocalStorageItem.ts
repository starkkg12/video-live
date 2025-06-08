/**
 * 获取 localStorage 中的值
 * SSR安全
 */
export default function getLSItem(key: string) {
  if (typeof window === 'undefined') return ''
  const value = window.localStorage.getItem(key)
  return value
}
