/**
 * Service Worker注册模块
 * 提供Service Worker的注册、安装检测和事件监听
 */

import { PWA_CONFIG } from './config'

// 检查是否在浏览器环境中
const isBrowser = typeof window !== 'undefined'

// 全局变量，保存安装提示事件
if (isBrowser) {
  window.deferredPrompt = null
}

/**
 * 注册Service Worker
 * @returns {Promise<ServiceWorkerRegistration|null>} ServiceWorker注册对象
 */
export const registerServiceWorker = async () => {
  if (!isBrowser) return null
  
  if (!('serviceWorker' in navigator)) {
    console.log('此浏览器不支持Service Worker')
    return null
  }
  
  try {
    const registration = await navigator.serviceWorker.register('/sw.js')
    console.log('ServiceWorker 注册成功，作用域是: ', registration.scope)
    return registration
  } catch (error) {
    console.log('ServiceWorker 注册失败: ', error)
    return null
  }
}

/**
 * 监听PWA安装事件
 * 捕获beforeinstallprompt事件并保存到全局变量
 */
export const listenForInstallEvent = () => {
  if (!isBrowser) return
  
  window.addEventListener('beforeinstallprompt', (e) => {
    // 阻止Chrome自动显示安装提示
    e.preventDefault()
    console.log('捕获到PWA安装事件')
    // 存储事件以便稍后使用
    window.deferredPrompt = e
    console.log('deferredPrompt已保存，可通过window.triggerPWAInstall()触发安装')
    
    // 分发自定义事件，通知组件安装提示已准备好
    window.dispatchEvent(new CustomEvent('pwaInstallReady'))
  })
  
  // 监听安装完成事件
  window.addEventListener('appinstalled', () => {
    console.log('PWA已安装')
    window.deferredPrompt = null
    // 分发安装完成事件
    window.dispatchEvent(new CustomEvent('pwaInstalled'))
  })
}

/**
 * 检查PWA安装状态
 * @returns {Object} PWA安装相关状态信息
 */
export const checkPWAStatus = () => {
  if (!isBrowser) return { isStandalone: false, hasServiceWorker: false, isHttps: false, hasDeferredPrompt: false }
  
  const status = {
    isStandalone: window.matchMedia('(display-mode: standalone)').matches || !!window.navigator.standalone,
    hasServiceWorker: 'serviceWorker' in navigator,
    isHttps: location.protocol === 'https:',
    hasDeferredPrompt: !!window.deferredPrompt
  }
  
  console.log('PWA安装状态检查:', status)
  return status
}

/**
 * 初始化PWA功能
 * 注册Service Worker和安装事件监听
 */
export const initPWA = () => {
  if (!isBrowser) return
  
  window.addEventListener('load', () => {
    // 注册Service Worker
    registerServiceWorker()
    
    // 监听安装事件
    listenForInstallEvent()
    
    // 检查PWA状态
    checkPWAStatus()
  })
}

// 自动初始化PWA功能
if (isBrowser) {
  initPWA()
}

export default {
  registerServiceWorker,
  listenForInstallEvent,
  checkPWAStatus,
  initPWA
} 