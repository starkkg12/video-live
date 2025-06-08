import VueQrcode from '@chenfengyuan/vue-qrcode'
import { Lazyload } from 'vant'
import type { App } from 'vue'
// import { initPWA } from './pwa'

// // 初始化PWA功能
// if (typeof window !== 'undefined') {
//   initPWA()
// }

export default (app: App) => {
  // 注册组件和插件
  app.component('qrc', VueQrcode)
  app.use(Lazyload)
  
  console.log('Application initialized successfully')
}
