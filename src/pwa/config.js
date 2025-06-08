/**
 * PWA配置和常量
 * 集中管理所有PWA相关的配置项和常量
 */

// 检查是否在浏览器环境中
const isBrowser = typeof window !== 'undefined'

// 应用前缀，用于localStorage等
export const APP_PREFIX = 'app_pwa'

// localStorage键名
export const STORAGE_KEYS = {
  VERSION_HISTORY: `${APP_PREFIX}_version_history`,
  DEBUG_MODE: 'debug'
}

// PWA相关常量
export const PWA_CONFIG = {
  // 安装相关
  INSTALL_PROMPT_TIMEOUT: 5000, // 等待安装提示的超时时间
  
  // 版本检查相关
  VERSION_CHECK_TIMEOUT: 3000, // 版本检查超时时间
  MAX_VERSION_CHECK_ATTEMPTS: 3, // 最大版本检查尝试次数
  
  // 重试策略
  INITIAL_RETRY_DELAY: 30000, // 初始重试延迟（30秒）
  MAX_RETRY_DELAY: 300000, // 最大重试延迟（5分钟）
  MAX_RETRIES: 2, // 最大重试次数
  
  // 服务路径
  VERSION_JSON_PATH: '/version.json', // 版本信息文件路径
  
  // 消息类型
  MESSAGE_TYPES: {
    CHECK_VERSION: 'CHECK_VERSION',
    VERSION_INFO: 'VERSION_INFO',
    SW_UPDATED: 'SW_UPDATED',
    SKIP_WAITING: 'SKIP_WAITING'
  }
}

// 检测是否是PWA环境（standalone模式或显示模式为standalone）
export const isPWAEnvironment = () => {
  if (!isBrowser) return false
  
  return (
    window.matchMedia('(display-mode: standalone)').matches || 
    window.navigator.standalone === true
  )
}

// 检测当前浏览器环境
export const getBrowserEnvironment = () => {
  if (!isBrowser) {
    return {
      isIOS: false,
      isAndroid: false,
      isChrome: false,
      isSafari: false,
      isPWA: false
    }
  }
  
  const ua = navigator.userAgent
  const isIOS = /iPhone|iPad|iPod/.test(ua)
  const isAndroid = /Android/.test(ua)
  const isChrome = /Chrome/.test(ua) && !/Edge/.test(ua)
  const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua)
  
  return {
    isIOS,
    isAndroid,
    isChrome,
    isSafari,
    isPWA: isPWAEnvironment()
  }
}

// 调试模式检测
export const isDebugMode = () => {
  if (!isBrowser) return false
  
  return import.meta.env.DEV || localStorage.getItem(STORAGE_KEYS.DEBUG_MODE) === 'true'
}

export default {
  APP_PREFIX,
  STORAGE_KEYS,
  PWA_CONFIG,
  isPWAEnvironment,
  getBrowserEnvironment,
  isDebugMode
} 