import interceptorChain from './interceptorChain'

const instance = interceptorChain()
  .clientIdRequest()
  .authRequest()
  .loginRedirect('ask-back-login')
  .tokenRefreshResponse('ask-back-login').instance

//获得自己的等级level数据
export function getLevelData() {
  return instance.get('/vip/myVip')
}
