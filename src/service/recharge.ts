import interceptorChain from './interceptorChain'

const instance = interceptorChain().clientIdRequest().authRequest().loginRedirect().tokenRefreshResponse().instance

interface PayOrderListInterface {
  page: number
  size: number
  state?: number
  beginCreateTime?: string
  endCreateTime?: string
}

/**
 * 支付配置获取
 */
export function getPayConfig() {
  return instance.get('/payment/getPayConfig')
}
/**
 * 获取用户积分
 */
export function getCurrentScore() {
  return instance.get('/userScore/balance')
}
/**
 * 获取用户支付跳转form表单
 */
export function getPayOrder(data: { score: number; payType: string; ipInfo: string }) {
  return instance.post('/payment/getPayOrder', data, {
    headers: {
      clientType: import.meta.env.PUBLIC_CLIENT_TYPE,
      businessType: import.meta.env.PUBLIC_BUSINESS_TYPE,
    },
  })
}
/**
 * 用户支付历史订单
 */
export function getPayByOrderId(data: { payOrderId: number }) {
  return instance.post('/payment/payByOrderId', data)
}
/**
 * 支付记录
 */
export function getPayOrderList(data: PayOrderListInterface) {
  return instance.post('/payment/payOrderList', data)
}
