<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { showConfirmDialog, showToast } from 'vant'

const deferredPrompt = ref<any>(null)
const showInstallButton = ref(false)

// 检测设备类型
const isIOS = ref(false)

// 检查是否已安装为PWA
const isPWAInstalled = () => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone ||
    document.referrer.includes('android-app://')
  )
}

// 显示安装提示
const showInstallPrompt = () => {
  // 检查是否有全局变量中的deferredPrompt
  if (window.deferredPrompt && !deferredPrompt.value) {
    deferredPrompt.value = window.deferredPrompt
  }

  if (!deferredPrompt.value) {
    // 如果没有install prompt事件，则显示手动安装指南
    showManualInstallGuide()
    return
  }

  showConfirmDialog({
    title: '安装应用',
    message: '将澳六直播添加到主屏幕，获得更好的体验',
    confirmButtonText: '安装',
    cancelButtonText: '稍后',
  })
    .then(() => {
      // 显示安装提示
      try {
        deferredPrompt.value.prompt()

        // 等待用户响应
        deferredPrompt.value.userChoice.then((choiceResult: { outcome: string }) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('用户接受安装')
            showToast('安装已开始')
          } else {
            console.log('用户拒绝安装')
          }
          // 无论如何，清除提示
          deferredPrompt.value = null
          window.deferredPrompt = null
          showInstallButton.value = false
        })
      } catch (err) {
        console.error('启动安装过程时出错:', err)
        showToast('安装失败，请通过浏览器菜单安装')
        showManualInstallGuide()
      }
    })
    .catch(() => {
      // 用户点击了取消
      console.log('用户暂时跳过安装')
    })
}

// 显示Chrome手动安装指南
const showManualInstallGuide = () => {
  showConfirmDialog({
    title: '手动安装应用',
    message:
      'Chrome用户：\n1. 点击浏览器右上角的菜单按钮 ⋮\n2. 选择"安装应用"或"添加到主屏幕"\n3. 按照提示完成安装',
    confirmButtonText: '知道了',
  })
}

// 监听安装事件
const handleBeforeInstallPrompt = (e: Event) => {
  console.log('PWA安装事件触发', e)
  // 阻止Chrome 76+版本自动显示安装提示
  e.preventDefault()
  // 保存事件以便稍后触发
  deferredPrompt.value = e
  // 显示安装按钮
  showInstallButton.value = true
}

// 监听应用安装后的事件
const handleAppInstalled = () => {
  // 应用已安装，隐藏安装按钮
  showInstallButton.value = false
  deferredPrompt.value = null
  if (window.deferredPrompt) window.deferredPrompt = null
  console.log('PWA已安装')
  showToast('应用已安装成功！')
}

const forceShowInstallButton = () => {
  // 强制显示安装按钮（用于测试）
  showInstallButton.value = true
}

onMounted(() => {
  console.log('InstallPWA组件已挂载')

  // 检查是否已安装
  if (isPWAInstalled()) {
    console.log('PWA已安装，不显示安装按钮')
    showInstallButton.value = false
    return
  }

  // 检查是否为iOS设备
  isIOS.value = /iPad|iPhone|iPod/.test(window.navigator.userAgent) && !(window as any).MSStream
  console.log('是否为iOS设备:', isIOS.value)

  // 添加事件监听器
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.addEventListener('appinstalled', handleAppInstalled)

  // 检查是否为Chrome浏览器
  const isChrome =
    /Chrome/.test(window.navigator.userAgent) && /Google Inc/.test(window.navigator.vendor)
  console.log('是否为Chrome浏览器:', isChrome)

  // 检查全局deferredPrompt
  if (window.deferredPrompt) {
    console.log('发现全局deferredPrompt, 使用它')
    deferredPrompt.value = window.deferredPrompt
    showInstallButton.value = true
  }

  if (isIOS.value && !isPWAInstalled()) {
    // iOS设备需要手动添加到主屏幕，所以我们展示不同的提示
    showInstallButton.value = true
    console.log('iOS设备，显示安装按钮')
  } else if (isChrome && !isPWAInstalled()) {
    // Chrome但没有触发beforeinstallprompt事件，5秒后显示按钮
    setTimeout(() => {
      if (!deferredPrompt.value && !isPWAInstalled()) {
        console.log('Chrome未触发安装事件，手动显示安装按钮')
        showInstallButton.value = true
      }
    }, 3000)
  }

  // 调试: 在控制台暴露方法以便测试
  if (typeof window !== 'undefined') {
    ;(window as any).showPWAInstallButton = forceShowInstallButton
    ;(window as any).triggerPWAInstall = showInstallPrompt
  }
})

onBeforeUnmount(() => {
  // 清理事件监听器
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.removeEventListener('appinstalled', handleAppInstalled)
})

// 对iOS设备显示安装指南
const showIOSInstallGuide = () => {
  showConfirmDialog({
    title: '添加到主屏幕',
    message: '1. 点击浏览器底部的"分享"按钮\n2. 在菜单中选择"添加到主屏幕"\n3. 确认添加',
    confirmButtonText: '知道了',
  })
}

// 在TypeScript中为Window增加deferredPrompt属性
declare global {
  interface Window {
    deferredPrompt: any
  }
}
</script>

<template>
  <div v-if="showInstallButton" class="install-pwa">
    <div class="install-banner">
      <div class="banner-content">
        <div class="app-icon">
          <img src="/share.png" alt="应用图标" />
        </div>
        <div class="app-info">
          <div class="app-name">澳六直播</div>
          <div class="app-desc">安装应用获得更好体验</div>
        </div>
      </div>

      <button class="install-button" @click="isIOS ? showIOSInstallGuide() : showInstallPrompt()">
        安装
      </button>

      <span class="close-button" @click="showInstallButton = false">×</span>
    </div>
  </div>
</template>

<style scoped>
.install-pwa {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
  padding: 10px;
}

.install-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  padding: 14px 16px;
  position: relative;
}

.banner-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.app-icon {
  width: 48px;
  height: 48px;
  margin-right: 14px;
  border-radius: 12px;
  overflow: hidden;
}

.app-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.app-info {
  flex: 1;
}

.app-name {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
}

.app-desc {
  font-size: 13px;
  color: #666;
}

.install-button {
  background-color: #eb4d60;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 18px;
  font-size: 14px;
  font-weight: 500;
  margin-right: 20px;
}

.close-button {
  position: absolute;
  top: 8px;
  right: 12px;
  font-size: 18px;
  color: #999;
  cursor: pointer;
}

@media (prefers-color-scheme: dark) {
  .install-banner {
    background-color: #2c2c2e;
  }

  .app-name {
    color: #fff;
  }

  .app-desc {
    color: #a0a0a5;
  }
}
</style>
