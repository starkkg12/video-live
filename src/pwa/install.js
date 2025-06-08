/**
 * PWA安装管理模块
 * 处理PWA安装流程和安装按钮控制
 */

import { getBrowserEnvironment, PWA_CONFIG } from './config'

// 检查是否在浏览器环境中
const isBrowser = typeof window !== 'undefined'

// 状态管理
const state = {
  installPromptDeferred: null,
  installButtonVisible: false,
  isInstalled: false,
  installTimeout: null
}

/**
 * 检查PWA是否已安装
 * @returns {boolean} 是否已安装
 */
export const isPWAInstalled = () => {
  if (!isBrowser) return false
  
  // 检查方法1: display-mode是否为standalone
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  
  // 检查方法2: iOS上的standalone标志
  const isIOSStandalone = window.navigator.standalone === true
  
  // 检查方法3: 检查localStorage中的安装标记
  const hasInstallMarker = localStorage.getItem('pwa_installed') === 'true'
  
  // 检查方法4: 检查应用安装状态API (如果浏览器支持)
  const hasRelatedApps = !!(
    navigator.getInstalledRelatedApps && 
    navigator.getInstalledRelatedApps().then(apps => apps.length > 0)
  )
  
  // 检查方法5: 检查屏幕尺寸和方向，在桌面浏览器上禁用安装提示
  const isDesktopBrowser = window.innerWidth > 1024 && !window.orientation
  
  // 根据平台提供不同的检测策略
  const env = getBrowserEnvironment()
  
  if (env.isIOS) {
    // iOS上主要依赖于navigator.standalone
    return isIOSStandalone || hasInstallMarker
  } else if (env.isAndroid) {
    // Android上依赖于display-mode和localStorage标记
    return isStandalone || hasInstallMarker
  } else if (isDesktopBrowser) {
    // 桌面浏览器上，除非用户手动要求，否则不显示安装选项
    return true
  }
  
  // 组合所有检测方法
  return isStandalone || isIOSStandalone || hasInstallMarker
}

/**
 * 显示安装按钮
 * @param {boolean} force - 是否强制显示，忽略安装状态
 */
export const showInstallButton = (force = false) => {
  if (!isBrowser) return
  
  if (force || (!state.isInstalled && window.deferredPrompt)) {
    state.installButtonVisible = true
    window.dispatchEvent(new CustomEvent('pwaInstallButtonVisibilityChange', {
      detail: { visible: true }
    }))
  }
}

/**
 * 隐藏安装按钮
 */
export const hideInstallButton = () => {
  if (!isBrowser) return
  
  state.installButtonVisible = false
  window.dispatchEvent(new CustomEvent('pwaInstallButtonVisibilityChange', {
    detail: { visible: false }
  }))
}

/**
 * 触发PWA安装流程
 * @returns {Promise<boolean>} 安装是否成功
 */
export const showInstallPrompt = async () => {
  if (!isBrowser) return false
  
  // 检查是否有延迟的安装提示
  if (!window.deferredPrompt) {
    console.log('没有可用的安装提示')
    return false
  }
  
  try {
    // 显示安装提示
    const deferredPrompt = window.deferredPrompt
    deferredPrompt.prompt()
    
    // 等待用户响应
    const choiceResult = await deferredPrompt.userChoice
    
    // 清除延迟的提示
    window.deferredPrompt = null
    
    // 根据用户选择处理
    if (choiceResult.outcome === 'accepted') {
      console.log('用户接受了PWA安装')
      state.isInstalled = true
      // 在LocalStorage设置安装标记，持久化安装状态
      localStorage.setItem('pwa_installed', 'true')
      hideInstallButton()
      
      // 分发安装成功事件
      window.dispatchEvent(new CustomEvent('pwaInstalled', {
        detail: { timestamp: Date.now() }
      }))
      
      return true
    } else {
      console.log('用户拒绝了PWA安装')
      // 用户拒绝安装，记录以减少提示频率
      const now = Date.now()
      localStorage.setItem('pwa_install_declined', now.toString())
      return false
    }
  } catch (error) {
    console.error('PWA安装过程中出错:', error)
    return false
  }
}

/**
 * 提供iOS安装指南
 * @returns {string} 安装指南HTML
 */
export const getIOSInstallGuide = () => {
  return `
    <div class="ios-install-guide">
      <p>请点击<span class="ios-share-icon">分享</span>按钮，然后选择"添加到主屏幕"</p>
      <div class="ios-install-steps">
        <div class="step">1. 点击下方分享按钮</div>
        <div class="step">2. 滚动并选择"添加到主屏幕"</div>
        <div class="step">3. 点击"添加"确认</div>
      </div>
    </div>
  `
}

/**
 * 获取Chrome安装指南
 * @returns {string} 安装指南HTML
 */
export const getChromeInstallGuide = () => {
  return `
    <div class="chrome-install-guide">
      <p>请点击浏览器右上角的菜单按钮，然后选择"安装应用"选项</p>
      <div class="chrome-install-steps">
        <div class="step">1. 点击右上角⋮菜单按钮</div>
        <div class="step">2. 选择"安装应用"选项</div>
        <div class="step">3. 在弹出确认框点击"安装"</div>
      </div>
    </div>
  `
}

/**
 * 初始化PWA安装功能
 */
export const initInstallFeature = () => {
  if (!isBrowser) return
  
  // 检查是否已安装
  state.isInstalled = isPWAInstalled()
  
  // 如果已经安装，无需执行后续逻辑
  if (state.isInstalled) {
    console.log('PWA已安装，不启用安装功能')
    return
  }
  
  // 检查是否最近拒绝过安装（减少频繁提示）
  const lastDeclined = localStorage.getItem('pwa_install_declined')
  if (lastDeclined) {
    const declinedTime = parseInt(lastDeclined, 10)
    const now = Date.now()
    const ONE_DAY = 24 * 60 * 60 * 1000
    
    // 如果24小时内拒绝过，不再提示
    if (now - declinedTime < ONE_DAY) {
      console.log('用户在24小时内拒绝过安装，暂不显示按钮')
      return
    }
  }
  
  // 获取当前环境
  const env = getBrowserEnvironment()
  
  // 仅在移动设备上显示安装提示
  if (!env.isIOS && !env.isAndroid && window.innerWidth > 768) {
    console.log('非移动设备，不显示安装按钮')
    return
  }
  
  // iOS设备上直接显示安装按钮（因为无法捕获beforeinstallprompt事件）
  if (env.isIOS) {
    console.log('iOS设备，直接显示安装按钮')
    setTimeout(() => {
      showInstallButton(true)
    }, 3000) // 延迟3秒显示，避免干扰首次用户体验
    return
  }
  
  // 监听安装就绪事件
  window.addEventListener('pwaInstallReady', () => {
    showInstallButton()
  })
  
  // 监听安装完成事件
  window.addEventListener('pwaInstalled', () => {
    state.isInstalled = true
    hideInstallButton()
  })
  
  // 为移动设备设置超时，如果没有收到安装事件，考虑显示安装按钮
  if (env.isAndroid) {
    state.installTimeout = setTimeout(() => {
      if (!window.deferredPrompt && !state.isInstalled) {
        // 判断用户访问次数，仅对访问多次的用户显示
        const visitCount = parseInt(localStorage.getItem('visit_count') || '0', 10)
        if (visitCount >= 2) {
          console.log('安装提示超时，且用户访问次数≥2，显示安装按钮')
          showInstallButton(true)
        }
      }
    }, PWA_CONFIG.INSTALL_PROMPT_TIMEOUT)
  }
  
  // 暴露全局方法用于调试
  window.triggerPWAInstall = showInstallPrompt
  window.showPWAInstallButton = () => showInstallButton(true)
}

// 导出状态和方法
export default {
  state,
  isPWAInstalled,
  showInstallButton,
  hideInstallButton,
  showInstallPrompt,
  getIOSInstallGuide,
  getChromeInstallGuide,
  initInstallFeature
} 