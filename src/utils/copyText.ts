import { showToast } from 'vant'

export default async (text: string, message: string = '复制成功') => {
  if (typeof window === 'undefined') return

  try {
    if (navigator.clipboard) {
      // 使用 Clipboard API 进行复制
      await navigator.clipboard.writeText(text)
      showToast({ message })
    } else {
      // 使用 document.execCommand 进行降级处理
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      showToast({ message })
    }
  } catch (err) {
    console.error('复制失败', err)
    showToast({ message: '复制失败', type: 'fail' })
  }
}
