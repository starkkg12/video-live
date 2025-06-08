/**
 * PWA功能模块入口
 * 提供所有PWA相关功能的统一导出
 */

// 配置模块
export * from './config'

// Service Worker注册模块
export * from './register'

// 更新管理模块
export * from './update'

// 安装管理模块
export * from './install'

// 导出组件
import UpdateNotification from './components/UpdateNotification.vue'
import InstallButton from './components/InstallButton.vue'

export { UpdateNotification, InstallButton }

// 初始化函数 - 由应用入口调用
export const initPWA = () => {
  // 这个函数将在应用入口调用，初始化所有PWA功能

  // 注册Service Worker（自执行）
  // 这里不需要显式调用，因为register.js已经内部执行了

  // 导出组件，让应用可以按需引入
  return {
    UpdateNotification,
    InstallButton
  }
}

export default {
  initPWA,
  UpdateNotification,
  InstallButton
} 