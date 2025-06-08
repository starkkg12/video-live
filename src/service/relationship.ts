import interceptorChain from './interceptorChain'

const instance = interceptorChain().clientIdRequest().authRequest().tokenRefreshResponse('ask-cancel-login').instance

//检索我的关注/我的粉丝
export function getRelationshipList(data: any) {
  return instance.post('/relationship/list', data, { headers: { businessType: import.meta.env.PUBLIC_BUSINESS_TYPE } })
}

//关注
interface paramsModifyRelation {
  toUserId: string
  ipInfo: string
}
export function addRelationship(data: paramsModifyRelation) {
  return instance.post('/relationship/add', data, { headers: { businessType: import.meta.env.PUBLIC_BUSINESS_TYPE } })
}

//取消关注
export function delRelationship(data: paramsModifyRelation) {
  return instance.post('/relationship/del', data, { headers: { businessType: import.meta.env.PUBLIC_BUSINESS_TYPE } })
}

//查询是否关注
interface paramsQueryRelation {
  targetUserId: string
  direct: string
}
export function getRelationship(data: paramsQueryRelation) {
  return instance.post('/relationship/get', data, { headers: { businessType: import.meta.env.PUBLIC_CLIENT_TYPE } })
}

//用户查询自己的黑名单一览
export function getBlockList(data: any) {
  return instance.post('/userBlocklist/list', data, { headers: { businessType: import.meta.env.PUBLIC_CLIENT_TYPE } })
}

//用户添加黑名单
interface paramsModifyBlock {
  blockUserId: string
}
export function addToBlock(data: paramsModifyBlock) {
  return interceptorChain()
    .clientIdRequest()
    .authRequest()
    .loginRedirect('ask-cancel-login')
    .tokenRefreshResponse('ask-cancel-login')
    .instance.post('/userBlocklist/add', data, { headers: { businessType: import.meta.env.PUBLIC_CLIENT_TYPE } })
}

//用户移除黑名单
export function delFromBlock(data: paramsModifyBlock) {
  return instance.post('/userBlocklist/del', data, { headers: { businessType: import.meta.env.PUBLIC_CLIENT_TYPE } })
}

//获取我和目标客户的互相拉黑的描述
export function getIsBlock(data: paramsQueryRelation) {
  return instance.post('/userBlocklist/get', data, { headers: { businessType: import.meta.env.PUBLIC_CLIENT_TYPE } })
}
