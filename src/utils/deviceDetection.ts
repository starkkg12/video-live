import { ref, computed } from 'vue'

/**
 * 检测是否是iOS设备
 */
export const isIOS = computed(() => {
  if (typeof window === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
})

/**
 * 检测是否是添加到主屏幕的模式（iOS standalone mode）
 */
export const isStandaloneMode = computed(() => {
  if (typeof window === 'undefined') return false
  return !!window.navigator.standalone
})

/**
 * 检测是否是移动设备
 */
export const isMobileDevice = computed(() => {
  if (typeof window === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
})

/**
 * 检测是否是添加到主屏幕的Web应用 (PWA)
 * 适用于iOS和Android
 */
export const isPWA = computed(() => {
  if (typeof window === 'undefined') return false
  
  // iOS检测
  if (window.navigator.standalone) return true
  
  // Android/Chrome检测
  if (window.matchMedia('(display-mode: standalone)').matches) return true
  
  return false
}) 