import interceptorChain from './interceptorChain'

const instance = interceptorChain().clientIdRequest().authRequest().tokenRefreshResponse().instance

export interface VoteInterface {
  gameType: string
  //   g guess竞猜 v 投票
  voteType: 'g' | 'v'
  year: number
  //   期数
  issue: number
}
export interface ExtendedVoteInterface extends VoteInterface {
  vote: string
  ipInfo: any
}
//获得个人投票详情 自己查看自己vote结果
export function getVoteDetail(data: VoteInterface) {
  return instance.post('/vote/get', data)
}
//查看所有人vote结果
export function getVoteResult(data: VoteInterface) {
  return instance.post('/vote/view', data)
}
//发起投票
export function addVote(data: ExtendedVoteInterface) {
  return instance.post('/vote/add', data)
}
