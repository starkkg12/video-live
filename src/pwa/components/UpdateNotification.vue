<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { showNotify } from 'vant'
import { isDebugMode } from '../config'
import { initUpdateDetection, loadVersionHistory, loadVersionInfo, refreshApp } from '../update'

// 类型定义
interface VersionData {
  current: string
  history: VersionHistoryItem[]
  [key: string]: any
}

interface VersionHistoryItem {
  version: string
  date: string
}

interface UpdateEvent {
  detail: {
    version: string
  }
}

// 组件状态
const showUpdatePrompt = ref(false)
const newVersion = ref('')
const currentVersion = ref('')
const updateReady = ref(false)
const showVersionInfo = ref(false)
const versionData = ref<any>({})
const versionHistory = ref<VersionHistoryItem[]>([])

// 从本地存储加载当前版本并更新组件状态
const initVersionData = () => {
  const data = loadVersionHistory() as VersionData
  if (data?.current) {
    currentVersion.value = data.current
    versionHistory.value = data.history || []
  }
}

// 显示更新通知
const showUpdateNotification = (version: string) => {
  // 只在有新版本且准备好时显示
  if (version && version !== currentVersion.value) {
    newVersion.value = version
    updateReady.value = true
    showUpdatePrompt.value = true

    // 同时显示顶部通知条
    showNotify({
      type: 'primary',
      message: '新版本可用，请刷新应用',
      duration: 5000,
    })
  }
}

// 格式化版本号显示
const formatVersion = (version: string): string => {
  if (!version) return '未知'

  // 如果是长版本号，只显示主要部分
  if (version.includes('-')) {
    const [baseVersion, buildDate, hash] = version.split('-')
    if (isDebugMode()) {
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

// 处理刷新应用
const handleRefreshApp = () => {
  refreshApp()
}

// 初始化网络状态处理器
let onlineDebounceTimer: number | undefined
const handleOnline = () => {
  if (onlineDebounceTimer) {
    clearTimeout(onlineDebounceTimer)
  }
  onlineDebounceTimer = window.setTimeout(() => {
    console.log('[PWA] 网络已恢复连接')
  }, 1000)
}

const handleOffline = () => {
  console.log('[PWA] 网络已断开连接')
}

onMounted(() => {
  // 初始化版本数据
  initVersionData()

  // 获取详细的版本信息
  loadVersionInfo()

  // 启动更新检测
  const cleanup = initUpdateDetection()

  // 监听更新事件
  const handleUpdateAvailable = ((event: Event) => {
    const customEvent = event as CustomEvent
    if (customEvent.detail && typeof customEvent.detail.version === 'string') {
      showUpdateNotification(customEvent.detail.version)
    }
  }) as EventListener

  window.addEventListener('pwaUpdateAvailable', handleUpdateAvailable)

  // 监听网络状态变化
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // 清理函数
  onBeforeUnmount(() => {
    cleanup()
    window.removeEventListener('pwaUpdateAvailable', handleUpdateAvailable)
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
    if (onlineDebounceTimer) {
      clearTimeout(onlineDebounceTimer)
    }
  })
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
            <br v-if="isDebugMode()" />
            <span v-if="isDebugMode()">新版本: {{ formatVersion(newVersion) }}</span>
          </div>
        </div>
      </div>

      <button class="update-button" @click="handleRefreshApp">更新</button>

      <span class="close-button" @click="showUpdatePrompt = false">×</span>
    </div>
  </div>

  <!-- 版本信息 -->
  <div v-if="isDebugMode() && showVersionInfo" class="version-info-popup">
    <div class="version-info-content">
      <div class="version-info-header">
        <span>应用版本信息</span>
        <span class="close-button" @click="showVersionInfo = false">×</span>
      </div>

      <div class="version-info-body">
        <div class="version-item">
          <span class="version-label">构建版本:</span>
          <span class="version-value">{{
            versionData.fullVersion || currentVersion || '未知'
          }}</span>
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
  <div v-if="isDebugMode()" class="version-button" @click="toggleVersionInfo">
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
