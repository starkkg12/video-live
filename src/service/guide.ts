import interceptorChain from './interceptorChain'

const instance = interceptorChain().clientIdRequest().instance

interface NewsInterface {
  page: number
  size: number
}
// 列表查询
export function gameTypeNewspaperIssue(params: NewsInterface) {
  return instance.post(`/gameTypeNewspaperIssue/list`, params)
}
// 侧边栏-资料大全
export function getCorPusDetail(manageSiteId: string) {
  return instance.get(`bbs/${manageSiteId}/corpus/detail`)
}
