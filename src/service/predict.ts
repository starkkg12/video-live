import interceptorChain from './interceptorChain'

const instance = interceptorChain().clientIdRequest().authRequest().tokenRefreshResponse().instance

// 查询所选彩种一级玩法
interface paramsGetPredictTypes {
  bizFlag: string
  gameType?: string
}
export function getPredictTypes(params: paramsGetPredictTypes) {
  return instance.post(`predict/type/list`, params)
}

// 竞猜发布
interface paramsAddPredict {
  bizId: string
  bizFlag: string
  playTypeCode: string
  predict: any
  fromIp: string
  playTypeCheckNumberCode?: string
  playTypeSubCode?: string
}
export function addPredict(params: paramsAddPredict) {
  const loginInstance = interceptorChain()
    .clientIdRequest()
    .authRequest()
    .loginRedirect()
    .tokenRefreshResponse().instance
  return loginInstance.post(`predict/createPredictForGallery`, params)
}

// 查询所选期刊竞猜小组的参与记录(期刊的参与记录)
interface paramsGetPredictListByPictureId {
  page: number
  size: number
  bizId?: string | null
  issueId?: string | null
}
export function getPredictListByPictureId(params: paramsGetPredictListByPictureId) {
  return instance.post('/predict/listPlayTypeForGallery', params)
}

// 获取竞猜统计
interface paramsGetPredictionStatisticsInfo {
  page: number
  size: number
  gameType: string
  playTypeCode: string
}
export function getPredictionStatisticsInfo(params: paramsGetPredictionStatisticsInfo) {
  return instance.post('/predict/getPredictionStatisticsInfo', params)
}

// 获取竞猜详情
interface paramsGetPredictDetail {
  predictId: string
}
export function getPredictDetail(params: paramsGetPredictDetail) {
  return instance.post('/predict/detailById ', params)
}

// 专家统计
interface paramsGetExpertStatisticsInfo {
  gameType: string
  playTypeCode: string
}
export function getExpertStatisticsInfo(params: paramsGetExpertStatisticsInfo) {
  return instance.post('/predict/expertStatistics ', params)
}
