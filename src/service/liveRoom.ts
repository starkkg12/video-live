import interceptorChain from './interceptorChain'

const instance = interceptorChain().clientIdRequest().authRequest().tokenRefreshResponse().instance

// 发送图片消息
export function sendImageMessage(data: any) {
  return instance.post('/liveRoom/sendImageMessage', data)
}

// 发送文本消息
export function sendTextMessage(data: any) {
  return instance.post('/liveRoom/sendTextMessage', data)
}
