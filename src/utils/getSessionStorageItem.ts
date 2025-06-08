/**
 * 获取 sessionStorage 中的值
 * SSR安全
 */
export default function getSession(key: string) {
  if (typeof window === 'undefined') return ''
  const value = window.sessionStorage.getItem(key)
  return value
}
