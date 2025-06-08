<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { getBrowserEnvironment } from '../config'
import {
  isPWAInstalled,
  showInstallButton,
  showInstallPrompt,
  getIOSInstallGuide,
  getChromeInstallGuide,
  initInstallFeature,
} from '../install'

// 组件状态
const showInstallBtn = ref(false)
const installGuide = ref('')
const showGuide = ref(false)
const environment = ref(getBrowserEnvironment())

// 显示安装指南
const showInstallGuide = () => {
  // 根据浏览器环境选择指南
  if (environment.value.isIOS) {
    installGuide.value = getIOSInstallGuide()
  } else if (environment.value.isChrome) {
    installGuide.value = getChromeInstallGuide()
  } else {
    installGuide.value = `
      <div class="generic-install-guide">
        <p>请使用浏览器的"安装"或"添加到主屏幕"功能安装此应用</p>
      </div>
    `
  }
  showGuide.value = true
}

// 触发安装流程
const handleInstall = async () => {
  // 如果有安装提示，显示它
  if (window.deferredPrompt) {
    await showInstallPrompt()
  } else {
    // 根据环境判断安装指南类型
    if (environment.value.isIOS) {
      // iOS设备展示专用指南
      showInstallGuide()
    } else if (environment.value.isAndroid) {
      // Android设备展示针对Android的指南
      installGuide.value = `
        <div class="android-install-guide">
          <p>请点击浏览器菜单，然后选择"添加到主屏幕"或"安装应用"</p>
          <div class="android-install-steps">
            <div class="step">1. 点击浏览器的菜单按钮</div>
            <div class="step">2. 选择"添加到主屏幕"或"安装应用"</div>
            <div class="step">3. 根据提示完成安装</div>
          </div>
        </div>
      `
      showGuide.value = true
    } else {
      // 桌面浏览器可能不支持PWA或已经提供了内置安装按钮
      installGuide.value = `
        <div class="desktop-install-guide">
          <p>在桌面浏览器中，请查看浏览器地址栏右侧的安装图标</p>
          <div class="desktop-install-steps">
            <div class="step">1. 查看浏览器地址栏右侧</div>
            <div class="step">2. 点击"安装"图标</div>
            <div class="step">3. 点击"安装"按钮确认</div>
          </div>
          <div class="desktop-note">注意：如果您没有看到安装图标，可能是因为该浏览器不支持PWA或已经安装。</div>
        </div>
      `
      showGuide.value = true
    }
  }
}

// 关闭手动安装指南
const closeGuide = () => {
  showGuide.value = false
}

onMounted(() => {
  // 不在PWA环境中才显示安装按钮
  if (!isPWAInstalled()) {
    // 初始化安装功能
    initInstallFeature()

    // 监听安装按钮可见性变化
    const handleVisibilityChange = ((event: Event) => {
      const customEvent = event as CustomEvent
      if (customEvent.detail && typeof customEvent.detail.visible === 'boolean') {
        showInstallBtn.value = customEvent.detail.visible
      }
    }) as EventListener

    window.addEventListener('pwaInstallButtonVisibilityChange', handleVisibilityChange)

    // 更新访问计数 - 用于智能显示安装按钮
    const visitCount = parseInt(localStorage.getItem('visit_count') || '0', 10)
    localStorage.setItem('visit_count', (visitCount + 1).toString())

    // 注册清理函数
    onBeforeUnmount(() => {
      window.removeEventListener('pwaInstallButtonVisibilityChange', handleVisibilityChange)
    })

    // 强制显示安装按钮（可用于调试）
    // showInstallButton(true)
  }
})
</script>

<template>
  <div v-if="showInstallBtn" class="install-pwa">
    <button @click="handleInstall" class="install-button">
      <span class="install-icon material-icons-outlined">get_app</span>
      <span class="install-text">安装应用</span>
    </button>
  </div>

  <!-- 手动安装指南弹窗 -->
  <div v-if="showGuide" class="install-guide-overlay">
    <div class="install-guide-container">
      <div class="install-guide-header">
        <span>安装指南</span>
        <span class="close-button" @click="closeGuide">×</span>
      </div>
      <div class="install-guide-content" v-html="installGuide"></div>
    </div>
  </div>
</template>

<style scoped>
.install-pwa {
  position: fixed;
  bottom: 70px;
  right: 20px;
  z-index: 990;
}

.install-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #4096ff;
  color: white;
  border: none;
  border-radius: 24px;
  padding: 10px 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 14px;
  font-weight: 500;
}

.install-icon {
  margin-right: 6px;
  font-size: 18px;
}

/* 安装指南弹窗 */
.install-guide-overlay {
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

.install-guide-container {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 360px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.install-guide-header {
  padding: 16px;
  font-weight: 600;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.install-guide-content {
  padding: 16px;
}

.close-button {
  font-size: 20px;
  color: #999;
  cursor: pointer;
}

/* 各种平台的安装指南样式 */
:deep(.ios-install-guide),
:deep(.chrome-install-guide),
:deep(.android-install-guide),
:deep(.desktop-install-guide),
:deep(.generic-install-guide) {
  font-size: 14px;
}

:deep(.ios-install-steps),
:deep(.chrome-install-steps),
:deep(.android-install-steps),
:deep(.desktop-install-steps) {
  margin-top: 12px;
}

:deep(.step) {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.desktop-note) {
  margin-top: 16px;
  padding: 8px;
  background-color: #f9f9f9;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}

:deep(.ios-share-icon) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  margin: 0 2px;
}

@media (prefers-color-scheme: dark) {
  .install-button {
    background-color: #177ddc;
  }

  .install-guide-container {
    background-color: #2c2c2e;
  }

  .install-guide-header {
    border-bottom-color: #3a3a3c;
    color: #fff;
  }

  :deep(.step) {
    border-bottom-color: #3a3a3c;
  }

  :deep(.ios-share-icon) {
    background-color: #3a3a3c;
  }

  :deep(.desktop-note) {
    background-color: #1c1c1e;
    color: #a0a0a5;
  }
}
</style>
