/**
 * PWA更新管理模块
 * 处理版本检查、版本历史记录和更新通知
 */

import { STORAGE_KEYS, PWA_CONFIG } from './config'

// 检查是否在浏览器环境中
const isBrowser = typeof window !== 'undefined'

// 存储当前状态
const state = {
  currentVersion: '',
  newVersion: '',
  versionHistory: [],
  updateReady: false,
  updateChecked: false,
  failureCount: 0,
  retryBackoff: PWA_CONFIG.INITIAL_RETRY_DELAY,
  versionCheckAttempts: 0
}

/**
 * 从localStorage加载版本历史
 * @returns {Object} 版本历史数据
 */
export const loadVersionHistory = () => {
  if (!isBrowser) return { current: '', history: [] }
  
  try {
    const versionData = JSON.parse(localStorage.getItem(STORAGE_KEYS.VERSION_HISTORY) || '{}')
    if (versionData.current) {
      state.currentVersion = versionData.current
      state.versionHistory = versionData.history || []
      console.log('[PWA] 2. 已加载本地版本:', state.currentVersion)
    }
    return versionData
  } catch (err) {
    console.error('[PWA] 加载版本信息出错:', err)
    return { current: '', history: [] }
  }
}

/**
 * 保存版本历史到localStorage
 * @param {string} newVersion - 新版本号
 */
export const saveVersionHistory = (newVersion) => {
  if (!isBrowser) return null
  
  try {
    const versionData = loadVersionHistory()
    
    // 只有当存在旧版本且与新版本不同时，才添加到历史
    if (versionData.current && versionData.current !== newVersion) {
      versionData.history = versionData.history || []
      versionData.history.push({
        version: versionData.current,
        date: new Date().toISOString()
      })
    }
    
    // 设置新的当前版本
    versionData.current = newVersion
    localStorage.setItem(STORAGE_KEYS.VERSION_HISTORY, JSON.stringify(versionData))
    console.log('[PWA] 版本已更新:', newVersion)
    
    // 更新状态
    state.currentVersion = newVersion
    state.versionHistory = versionData.history
    
    return versionData
  } catch (err) {
    console.error('[PWA] 更新版本信息出错:', err)
    return null
  }
}

/**
 * 从服务器加载详细版本信息
 * @returns {Promise<Object|null>} 版本信息
 */
export const loadVersionInfo = async () => {
  if (!isBrowser) return null
  
  // 如果已经失败到达最大重试次数，则放弃
  if (state.failureCount >= PWA_CONFIG.MAX_RETRIES) {
    console.log(`[PWA] 已达到最大重试次数(${PWA_CONFIG.MAX_RETRIES})，放弃加载版本信息`)
    return null
  }

  try {
    console.log('[PWA] 开始加载版本信息...')
    const response = await fetch(PWA_CONFIG.VERSION_JSON_PATH, {
      // 添加超时控制
      signal: AbortSignal.timeout(5000),
    })
    
    if (response.ok) {
      const versionData = await response.json()
      console.log('[PWA] 加载版本详情成功:', versionData)
      
      // 重置失败状态
      state.failureCount = 0
      state.retryBackoff = PWA_CONFIG.INITIAL_RETRY_DELAY
      
      // 如果没有本地版本信息，使用加载的版本
      if (!state.currentVersion && versionData.fullVersion) {
        state.currentVersion = versionData.fullVersion
        saveVersionHistory(versionData.fullVersion)
        console.log('[PWA] 已设置当前版本:', state.currentVersion)
      }
      
      return versionData
    } else {
      console.error('[PWA] 加载版本信息失败:', response.status, response.statusText)
      state.failureCount++
      return null
    }
  } catch (err) {
    console.error('[PWA] 加载版本详情出错:', err)
    state.failureCount++
    
    // 指数退避，每次失败后增加等待时间
    state.retryBackoff = Math.min(state.retryBackoff * 2, PWA_CONFIG.MAX_RETRY_DELAY)
    console.log(`[PWA] 下次重试将在${Math.round(state.retryBackoff / 1000)}秒后进行`)
    return null
  }
}

/**
 * 检查Service Worker版本
 * @returns {Promise<boolean>} 是否检查成功
 */
export const checkVersion = () => {
  if (!isBrowser) return Promise.resolve(false)
  
  return new Promise((resolve) => {
    if (!state.updateChecked && navigator.serviceWorker && navigator.serviceWorker.controller) {
      // 如果达到最大尝试次数，不再尝试
      if (state.versionCheckAttempts >= PWA_CONFIG.MAX_VERSION_CHECK_ATTEMPTS) {
        console.log(`[PWA] 已达到最大版本检查尝试次数(${PWA_CONFIG.MAX_VERSION_CHECK_ATTEMPTS})，不再尝试`)
        state.updateChecked = true
        resolve(false)
        return
      }
      
      // 如果网络离线，不进行检查
      if (!navigator.onLine) {
        console.log('[PWA] 当前网络离线，跳过版本检查')
        resolve(false)
        return
      }
      
      state.versionCheckAttempts++
      console.log(`[PWA] 检查Service Worker版本 (尝试 ${state.versionCheckAttempts}/${PWA_CONFIG.MAX_VERSION_CHECK_ATTEMPTS})`)
      
      // 使用MessageChannel进行可靠通信
      const messageChannel = new MessageChannel()
      let timeoutId = null
      let hasResponded = false
      
      // 超时处理
      timeoutId = window.setTimeout(() => {
        if (!hasResponded) {
          console.warn('[PWA] 版本检查超时')
          try {
            messageChannel.port1.close()
          } catch (e) {
            // 忽略关闭错误
          }
          state.updateChecked = true
          resolve(false)
        }
      }, PWA_CONFIG.VERSION_CHECK_TIMEOUT)
      
      // 设置接收器
      messageChannel.port1.onmessage = (event) => {
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
        
        if (hasResponded) return
        hasResponded = true
        
        const message = event.data
        if (message && message.type === PWA_CONFIG.MESSAGE_TYPES.VERSION_INFO) {
          const receivedVersion = message.version
          console.log(`[PWA] 通过MessageChannel收到版本信息: ${receivedVersion}`)
          
          try {
            messageChannel.port1.close()
          } catch (e) {
            console.warn('[PWA] 关闭MessageChannel时出错:', e)
          }
          
          // 处理版本信息
          handleVersionUpdate(receivedVersion)
          state.updateChecked = true
          resolve(true)
        }
      }
      
      // 发送消息并传递端口
      try {
        navigator.serviceWorker.controller.postMessage(
          {
            type: PWA_CONFIG.MESSAGE_TYPES.CHECK_VERSION,
            timestamp: Date.now()
          },
          [messageChannel.port2]
        )
      } catch (error) {
        console.error('[PWA] 版本检查过程中出错:', error)
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        state.updateChecked = true
        resolve(false)
      }
    } else {
      // 不满足检查条件
      resolve(false)
    }
  })
}

/**
 * 处理Service Worker消息
 * @param {MessageEvent} event - 消息事件
 */
export const handleServiceWorkerMessage = (event) => {
  if (!isBrowser) return
  
  const message = event.data
  
  if (!message || !message.type) return
  
  switch (message.type) {
    case PWA_CONFIG.MESSAGE_TYPES.SW_UPDATED:
      // 记录新版本号
      state.newVersion = message.version
      console.log(`[PWA] 检测到新版本: ${state.newVersion}`)
      
      // 避免重复版本更新提示
      if (state.newVersion !== state.currentVersion) {
        state.updateReady = true
        // 触发更新事件
        window.dispatchEvent(new CustomEvent('pwaUpdateAvailable', { 
          detail: { version: state.newVersion } 
        }))
      }
      break
      
    case PWA_CONFIG.MESSAGE_TYPES.VERSION_INFO:
      const receivedVersion = message.version
      console.log(`[PWA] 收到版本信息: ${receivedVersion}`)
      handleVersionUpdate(receivedVersion)
      state.updateChecked = true
      break
  }
}

/**
 * 处理版本更新
 * @param {string} receivedVersion - 接收到的版本号
 */
const handleVersionUpdate = (receivedVersion) => {
  if (!isBrowser) return
  
  // 如果没有本地版本，设置为当前版本
  if (!state.currentVersion) {
    state.currentVersion = receivedVersion
    saveVersionHistory(receivedVersion)
  }
  // 如果与当前不同，可能是新版本
  else if (receivedVersion !== state.currentVersion) {
    state.newVersion = receivedVersion
    state.updateReady = true
    // 触发更新事件
    window.dispatchEvent(new CustomEvent('pwaUpdateAvailable', { 
      detail: { version: receivedVersion } 
    }))
  }
}

/**
 * 刷新应用以应用更新
 */
export const refreshApp = () => {
  if (!isBrowser) return
  
  if (!('serviceWorker' in navigator)) return
  
  // 在刷新前保存版本信息
  if (state.newVersion) {
    saveVersionHistory(state.newVersion)
  }
  
  // 发送跳过等待命令
  try {
    console.log('[PWA] 发送跳过等待命令')
    
    // 使用MessageChannel创建双向通信
    const messageChannel = new MessageChannel()
    
    // 监听响应
    messageChannel.port1.onmessage = (event) => {
      console.log('[PWA] Service Worker响应:', event.data)
      messageChannel.port1.close()
    }
    
    // 发送跳过等待命令
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(
        { type: PWA_CONFIG.MESSAGE_TYPES.SKIP_WAITING }, 
        [messageChannel.port2]
      )
    }
  } catch (error) {
    console.error('[PWA] 发送跳过等待命令出错:', error)
    // 降级到普通消息
    navigator.serviceWorker.controller?.postMessage({ 
      type: PWA_CONFIG.MESSAGE_TYPES.SKIP_WAITING 
    })
  }
  
  // 设置一个短暂延迟允许Service Worker处理消息
  setTimeout(() => {
    console.log('[PWA] 刷新页面...')
    window.location.reload()
  }, 300)
}

/**
 * 初始化PWA更新检测
 */
export const initUpdateDetection = () => {
  if (!isBrowser) return () => {}
  
  // 加载版本历史
  loadVersionHistory()
  
  // 加载详细版本信息
  loadVersionInfo()
  
  // 监听Service Worker消息
  if (navigator.serviceWorker) {
    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage)
  }
  
  // 版本检查
  setTimeout(() => {
    checkVersion()
  }, 2000)
  
  // 监听网络状态变化
  window.addEventListener('online', () => {
    if (!state.updateChecked) {
      console.log('[PWA] 网络已恢复，将尝试检查版本')
      setTimeout(() => checkVersion(), 3000)
    }
  })
  
  // 清理函数
  return () => {
    if (navigator.serviceWorker) {
      navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage)
    }
  }
}

export default {
  state,
  loadVersionHistory,
  saveVersionHistory,
  loadVersionInfo,
  checkVersion,
  handleServiceWorkerMessage,
  refreshApp,
  initUpdateDetection
} 