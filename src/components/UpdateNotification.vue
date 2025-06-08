<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { showNotify } from 'vant'

const showUpdatePrompt = ref(false)
const newVersion = ref('')
const currentVersion = ref('')
const updateReady = ref(false)
const updateChecked = ref(false)
const showVersionInfo = ref(false)
const versionData = ref<any>({})
const versionHistory = ref<any[]>([])

// 调试模式（开发环境显示更多信息）
const isDebugMode = ref(import.meta.env.DEV || localStorage.getItem('debug') === 'true')

// 添加请求控制和限流变量
const requestFailed = ref(false)
const failureCount = ref(0)
const maxRetries = 2 // 降低最大重试次数
const retryBackoff = ref(30000) // 增加初始重试延迟到30秒

// 重置网络错误状态
const resetNetworkFailure = () => {
  requestFailed.value = false
  failureCount.value = 0
  retryBackoff.value = 30000
}

// 从本地存储获取当前版本
const loadCurrentVersion = () => {
  try {
    const versionData = JSON.parse(localStorage.getItem('pwa_version_history') || '{}')
    if (versionData.current) {
      currentVersion.value = versionData.current
      versionHistory.value = versionData.history || []
      console.log('[PWA] 1. 已加载本地版本:', currentVersion.value)
    }
  } catch (err) {
    console.error('[PWA] 加载版本信息出错:', err)
  }
}

// 从服务器加载详细版本信息
const loadVersionInfo = async () => {
  // 如果已经失败3次以上，则增加重试间隔，避免过度请求
  if (failureCount.value >= maxRetries) {
    console.log(`[PWA] 已达到最大重试次数(${maxRetries})，放弃加载版本信息`)
    return
  }

  try {
    console.log('[PWA] 开始加载版本信息...')
    const response = await fetch('/version.json', {
      // 添加超时控制
      signal: AbortSignal.timeout(5000),
    })
    if (response.ok) {
      versionData.value = await response.json()
      console.log('[PWA] 加载版本详情成功:', versionData.value)
      resetNetworkFailure() // 重置失败状态

      // 如果没有本地版本信息，使用加载的版本
      if (!currentVersion.value && versionData.value.fullVersion) {
        currentVersion.value = versionData.value.fullVersion
        console.log('[PWA] 已设置当前版本:', currentVersion.value)
      }
    } else {
      console.error('[PWA] 加载版本信息失败:', response.status, response.statusText)
      requestFailed.value = true
      failureCount.value++
    }
  } catch (err) {
    console.error('[PWA] 加载版本详情出错:', err)
    requestFailed.value = true
    failureCount.value++

    // 指数退避，每次失败后增加等待时间，最大5分钟
    retryBackoff.value = Math.min(retryBackoff.value * 2, 300000)
    console.log(`[PWA] 下次重试将在${Math.round(retryBackoff.value / 1000)}秒后进行`)
  }
}

// 格式化版本号显示
const formatVersion = (version: string): string => {
  if (!version) return '未知'

  // 如果是长版本号，只显示主要部分
  if (version.includes('-')) {
    const [baseVersion, buildDate, hash] = version.split('-')
    if (isDebugMode.value) {
      return `${baseVersion} (${buildDate?.substring(0, 8) || ''}${hash ? '-' + hash : ''})`
    }
    return baseVersion
  }

  return version
}

// 格式化日期
const formatDate = (dateStr: string): string => {
  if (!dateStr) return ''

  try {
    const date = new Date(dateStr)
    return date.toLocaleString()
  } catch (e) {
    return dateStr
  }
}

// 切换版本信息显示
const toggleVersionInfo = () => {
  showVersionInfo.value = !showVersionInfo.value
}

// 监听Service Worker发送的更新消息
const handleServiceWorkerMessage = (event: MessageEvent) => {
  const message = event.data
  console.log(message)

  if (message && message.type === 'SW_UPDATED') {
    // 记录新版本号
    newVersion.value = message.version
    console.log(`[PWA] 检测到新版本: ${newVersion.value}`)

    // 避免重复版本更新提示
    if (newVersion.value !== currentVersion.value) {
      updateReady.value = true
      showUpdateNotification()
    }
  }

  if (message && message.type === 'VERSION_INFO') {
    const receivedVersion = message.version
    console.log(`[PWA] 收到版本信息: ${receivedVersion}`)

    // 如果没有本地版本，设置为当前版本
    if (!currentVersion.value) {
      currentVersion.value = receivedVersion
    }
    // 如果与当前不同，可能是新版本
    else if (receivedVersion !== currentVersion.value) {
      newVersion.value = receivedVersion
      updateReady.value = true
      showUpdateNotification()
    }

    updateChecked.value = true
  }
}

// 显示更新通知
const showUpdateNotification = () => {
  // 只在有新版本且准备好时显示
  if (updateReady.value && newVersion.value && newVersion.value !== currentVersion.value) {
    showUpdatePrompt.value = true

    // 同时显示顶部通知条
    showNotify({
      type: 'primary',
      message: '新版本可用，请刷新应用',
      duration: 5000,
    })
  }
}

// 刷新应用
const refreshApp = () => {
  if ('serviceWorker' in navigator) {
    // 在刷新前先缓存版本信息
    try {
      const versionData = JSON.parse(localStorage.getItem('pwa_version_history') || '{}')
      if (versionData && newVersion.value) {
        // 更新当前版本前先保存到历史
        if (versionData.current) {
          versionData.history = versionData.history || []
          versionData.history.push({
            version: versionData.current,
            date: new Date().toISOString(),
          })
        }
        // 设置新版本为当前版本
        versionData.current = newVersion.value
        localStorage.setItem('pwa_version_history', JSON.stringify(versionData))
      }
    } catch (err) {
      console.error('[PWA] 更新版本信息出错:', err)
    }

    try {
      console.log('[PWA] 发送跳过等待命令')

      // 使用MessageChannel创建可靠的双向通信
      const messageChannel = new MessageChannel()

      // 监听响应（即使不需要）
      messageChannel.port1.onmessage = event => {
        console.log('[PWA] Service Worker响应:', event.data)
        messageChannel.port1.close()
      }

      // 发送SKIP_WAITING命令
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' }, [
          messageChannel.port2,
        ])
      }
    } catch (error) {
      console.error('[PWA] 发送跳过等待命令出错:', error)
      // 降级到普通消息
      navigator.serviceWorker.controller?.postMessage({ type: 'SKIP_WAITING' })
    }

    // 设置一个短暂延迟允许Service Worker处理消息
    setTimeout(() => {
      console.log('[PWA] 刷新页面...')
      window.location.reload()
    }, 300)
  }
}

// 检查版本
const checkVersion = () => {
  if (!updateChecked.value && navigator.serviceWorker && navigator.serviceWorker.controller) {
    // 如果网络离线，不进行检查
    if (!navigator.onLine) {
      console.log('[PWA] 当前网络离线，跳过版本检查')
      return
    }

    console.log('[PWA] 检查Service Worker版本')
    try {
      // 使用带超时的MessageChannel
      const messageChannel = new MessageChannel()
      let timeoutId: number | undefined = undefined

      // 设置安全的响应处理，避免多次处理
      let hasResponded = false

      const handleResponse = (receivedVersion: string) => {
        // 防止重复处理
        if (hasResponded) return
        hasResponded = true

        // 清除超时计时器
        if (timeoutId !== undefined) {
          clearTimeout(timeoutId)
          timeoutId = undefined
        }

        // 处理版本信息
        console.log(`[PWA] 收到版本信息: ${receivedVersion}`)
        if (!currentVersion.value) {
          currentVersion.value = receivedVersion
        } else if (receivedVersion !== currentVersion.value) {
          newVersion.value = receivedVersion
          updateReady.value = true
          showUpdateNotification()
        }

        updateChecked.value = true
      }

      // 设置接收器
      messageChannel.port1.onmessage = event => {
        if (timeoutId !== undefined) {
          clearTimeout(timeoutId)
        }
        const message = event.data
        if (message && message.type === 'VERSION_INFO') {
          const receivedVersion = message.version
          console.log(`[PWA] 通过MessageChannel收到版本信息: ${receivedVersion}`)

          try {
            messageChannel.port1.close() // 正常关闭端口
          } catch (e) {
            console.warn('[PWA] 关闭MessageChannel时出错:', e)
          }

          handleResponse(receivedVersion)
        }
      }

      // 设置通信超时（3秒）
      timeoutId = window.setTimeout(() => {
        console.warn('[PWA] 版本检查超时，尝试备用方式')
        try {
          messageChannel.port1.close()
        } catch (e) {
          // 忽略关闭错误
        }

        // 标记该消息已经被处理过，避免重复处理
        hasResponded = true

        // 此时我们不再等待回复，避免资源占用
        updateChecked.value = true

        console.log('[PWA] 版本检查已中止，假设使用当前版本')
      }, 3000)

      // 发送消息并传递端口
      navigator.serviceWorker.controller.postMessage(
        {
          type: 'CHECK_VERSION',
          timestamp: Date.now(), // 添加时间戳避免缓存
        },
        [messageChannel.port2]
      )
    } catch (error) {
      console.error('[PWA] 版本检查过程中出错:', error)
      // 出错时也标记为已检查，避免重复
      updateChecked.value = true
    }
  }
}

// 后台自动检查更新
const setupBackgroundUpdates = () => {
  // 上次检查时间
  let lastCheckTime = Date.now()
  // 上次检查是否失败
  let lastCheckFailed = false
  // 连续失败次数
  let consecutiveFailures = 0
  // 最大失败次数
  const maxConsecutiveFailures = 5

  // 检查网络状态
  const isOnline = () => {
    return navigator.onLine
  }

  // 执行更新检查，带有重试限制
  const performUpdateCheck = async () => {
    // 如果离线或达到最大失败次数，跳过检查
    if (!isOnline()) {
      console.log('[PWA] 网络离线，跳过更新检查')
      return
    }

    if (consecutiveFailures >= maxConsecutiveFailures) {
      console.log(`[PWA] 已连续失败${consecutiveFailures}次，暂停更新检查1小时`)
      // 一小时后重置失败计数
      setTimeout(
        () => {
          consecutiveFailures = 0
        },
        60 * 60 * 1000
      )
      return
    }

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready
        await registration.update()
        console.log('[PWA] 后台检查更新完成')
        lastCheckFailed = false
        consecutiveFailures = 0 // 成功后重置计数
      }
    } catch (err) {
      lastCheckFailed = true
      consecutiveFailures++
      console.error(
        `[PWA] 后台更新检查失败(${consecutiveFailures}/${maxConsecutiveFailures}):`,
        err
      )
    } finally {
      lastCheckTime = Date.now()
    }
  }

  // 网络状态变化时检查
  window.addEventListener('online', () => {
    console.log('[PWA] 网络已恢复连接，检查更新')
    // 网络恢复后延迟检查，避免网络不稳定
    setTimeout(performUpdateCheck, 5000)
  })

  // 定期检查，基础间隔1小时，但根据网络状况调整
  const scheduleNextCheck = () => {
    // 计算下次检查时间
    let nextInterval = 60 * 60 * 1000 // 基础间隔：1小时

    // 如果上次检查失败，增加间隔
    if (lastCheckFailed) {
      const failureFactor = Math.min(consecutiveFailures, 5)
      nextInterval = Math.min(nextInterval * (1 + failureFactor * 0.5), 6 * 60 * 60 * 1000) // 最多6小时
    }

    console.log(`[PWA] 下次更新检查将在${Math.round(nextInterval / 60000)}分钟后进行`)

    setTimeout(() => {
      if (isOnline()) {
        performUpdateCheck()
      }
      scheduleNextCheck() // 递归安排下一次检查
    }, nextInterval)
  }

  // 初始检查
  if (isOnline()) {
    // 页面加载后等待一段时间再检查，避免启动时资源竞争
    setTimeout(performUpdateCheck, 30000)
  }

  // 安排定期检查
  scheduleNextCheck()
}

// 页面加载后注册Service Worker事件处理并检查版本
const registerServiceWorker = () => {
  if (navigator.serviceWorker) {
    // 1. 先添加消息监听器
    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage)
    console.log('[PWA] 已注册Service Worker消息监听器')

    let versionCheckAttempts = 0
    const maxVersionCheckAttempts = 3

    // 安全检查版本的函数，带有失败计数和退避
    const safeCheckVersion = () => {
      if (!updateChecked.value && navigator.serviceWorker && navigator.serviceWorker.controller) {
        if (versionCheckAttempts >= maxVersionCheckAttempts) {
          console.log(`[PWA] 已达到最大版本检查尝试次数(${maxVersionCheckAttempts})，不再尝试`)
          return
        }

        if (!navigator.onLine) {
          console.log('[PWA] 网络离线，暂不检查版本')
          return
        }

        versionCheckAttempts++
        console.log(
          `[PWA] 检查Service Worker版本 (尝试 ${versionCheckAttempts}/${maxVersionCheckAttempts})`
        )
        checkVersion()
      }
    }

    // 2. 等待Service Worker激活后再检查版本
    if (navigator.serviceWorker.controller) {
      // 如果已有控制页面的SW，等待2秒后检查版本
      console.log('[PWA] Service Worker已激活，稍后将检查版本')
      setTimeout(safeCheckVersion, 2000)
    } else {
      // 监听controllerchange事件，当新的Service Worker接管页面时触发
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[PWA] 新的Service Worker已接管页面')
        // 当新的SW接管后，等待1秒再检查版本
        setTimeout(safeCheckVersion, 1000)
      })

      console.log('[PWA] 等待Service Worker激活...')
    }

    // 失败时的重试机制
    window.addEventListener('online', () => {
      if (!updateChecked.value) {
        console.log('[PWA] 网络已恢复，将尝试检查版本')
        setTimeout(safeCheckVersion, 3000)
      }
    })

    // 3. 设置后台更新检查
    setupBackgroundUpdates()
  }
}

// 网络状态处理器
let onlineDebounceTimer: number | undefined
// 网络恢复处理器
const handleOnline = () => {
  // 防抖处理
  if (onlineDebounceTimer) {
    clearTimeout(onlineDebounceTimer)
  }

  onlineDebounceTimer = window.setTimeout(() => {
    console.log('[PWA] 网络已恢复连接')
  }, 1000)
}

// 网络断开处理器
const handleOffline = () => {
  console.log('[PWA] 网络已断开连接')
}

// 添加网络状态事件监听器清理函数
const cleanupNetworkListeners = () => {
  // 移除可能在其他地方添加的相同事件处理器
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
}

onMounted(() => {
  // 加载本地存储的版本
  loadCurrentVersion()

  // 获取详细的版本信息
  loadVersionInfo()

  // 注册Service Worker事件并检查版本
  registerServiceWorker()

  // 清理可能存在的处理器并重新绑定
  cleanupNetworkListeners()
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
})

onBeforeUnmount(() => {
  // 移除消息监听器
  if (navigator.serviceWorker) {
    navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage)
  }

  // 移除网络状态事件监听器
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
})
</script>

<template>
  <!-- 更新通知 -->
  <div v-if="showUpdatePrompt" class="update-notification">
    <div class="update-banner">
      <div class="update-content">
        <div class="update-icon">
          <span class="material-icons-outlined">system_update</span>
        </div>
        <div class="update-info">
          <div class="update-title">新版本可用</div>
          <div class="update-desc">
            <span>当前版本: {{ formatVersion(currentVersion) }}</span>
            <br v-if="isDebugMode" />
            <span v-if="isDebugMode">新版本: {{ formatVersion(newVersion) }}</span>
          </div>
        </div>
      </div>

      <button class="update-button" @click="refreshApp()">更新</button>

      <span class="close-button" @click="showUpdatePrompt = false">×</span>
    </div>
  </div>

  <!-- 版本信息 -->
  <div v-if="isDebugMode && showVersionInfo" class="version-info-popup">
    <div class="version-info-content">
      <div class="version-info-header">
        <span>应用版本信息</span>
        <span class="close-button" @click="showVersionInfo = false">×</span>
      </div>

      <div class="version-info-body">
        <div class="version-item">
          <span class="version-label">构建版本:</span>
          <span class="version-value">{{ versionData.fullVersion || '未知' }}</span>
        </div>

        <div class="version-item">
          <span class="version-label">构建时间:</span>
          <span class="version-value">{{ formatDate(versionData.buildDate) || '未知' }}</span>
        </div>

        <div class="version-item">
          <span class="version-label">Git提交:</span>
          <span class="version-value">{{ versionData.git?.hash || '未知' }}</span>
        </div>

        <div class="version-item">
          <span class="version-label">分支:</span>
          <span class="version-value">{{ versionData.git?.branch || '未知' }}</span>
        </div>

        <div class="version-history">
          <div class="history-title">更新历史</div>
          <div v-if="versionHistory.length === 0" class="no-history">无更新历史记录</div>
          <div v-else class="history-list">
            <div v-for="(item, index) in versionHistory" :key="index" class="history-item">
              <span class="history-version">{{ formatVersion(item.version) }}</span>
              <span class="history-date">{{ formatDate(item.date) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 调试模式下显示版本信息按钮 -->
  <div v-if="isDebugMode" class="version-button" @click="toggleVersionInfo">
    v{{ currentVersion.split('-')[0] }}
  </div>
</template>

<style scoped>
.update-notification {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000; /* 确保在InstallPWA上面 */
  padding: 10px;
}

.update-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  padding: 14px 16px;
  position: relative;
}

.update-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.update-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-right: 14px;
  border-radius: 12px;
  background-color: #f0f9ff;
  color: #4096ff;
}

.update-icon span {
  font-size: 24px;
}

.update-info {
  flex: 1;
}

.update-title {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
}

.update-desc {
  font-size: 13px;
  color: #666;
}

.update-button {
  background-color: #4096ff;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 18px;
  font-size: 14px;
  font-weight: 500;
  margin-left: 12px;
}

.close-button {
  position: absolute;
  top: 8px;
  right: 12px;
  font-size: 18px;
  color: #999;
  cursor: pointer;
}

/* 版本信息按钮（仅调试模式） */
.version-button {
  position: fixed;
  bottom: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 12px;
  padding: 4px 8px;
  font-size: 10px;
  z-index: 999;
  cursor: pointer;
}

/* 版本信息弹窗 */
.version-info-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.version-info-content {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
}

.version-info-header {
  padding: 16px;
  font-weight: 600;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.version-info-body {
  padding: 16px;
}

.version-item {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
}

.version-label {
  font-weight: 500;
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.version-value {
  font-size: 14px;
  word-break: break-all;
}

.version-history {
  margin-top: 20px;
}

.history-title {
  font-weight: 600;
  margin-bottom: 12px;
  font-size: 14px;
}

.no-history {
  color: #999;
  font-size: 14px;
  padding: 10px 0;
}

.history-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.history-version {
  font-weight: 500;
}

.history-date {
  color: #666;
  font-size: 13px;
}

@media (prefers-color-scheme: dark) {
  .update-banner {
    background-color: #2c2c2e;
  }

  .update-icon {
    background-color: #1a365d;
  }

  .update-title {
    color: #fff;
  }

  .update-desc {
    color: #a0a0a5;
  }

  .update-button {
    background-color: #177ddc;
  }

  .version-info-content {
    background-color: #2c2c2e;
  }

  .version-info-header {
    border-bottom-color: #3a3a3c;
    color: #fff;
  }

  .version-label {
    color: #a0a0a5;
  }

  .version-value {
    color: #fff;
  }

  .no-history {
    color: #a0a0a5;
  }

  .history-item {
    border-bottom-color: #3a3a3c;
  }

  .history-date {
    color: #a0a0a5;
  }
}
</style>
