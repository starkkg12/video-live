import interceptorChain from './interceptorChain'

const instance = interceptorChain().clientIdRequest().authRequest().tokenRefreshResponse().instance

/**
 * 图纸报纸列表查询
 */
export function gameTypeNewspaperIssueList(data: any) {
  return instance.post('/gameTypeNewspaperIssue/list', data)
}
