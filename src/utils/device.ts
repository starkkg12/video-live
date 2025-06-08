/**
 * 设备检测相关工具函数
 */

/**
 * 检测是否为移动设备
 * @returns 是否为移动设备
 */
export function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
} 