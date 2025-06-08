import interceptorChain from './interceptorChain'

const instance = interceptorChain().clientIdRequest().instance

/**
 * 查询竞选活动列表(后台默认排序)(竞选专家链接)
 * /biz/campaign/list
 */

export function getCampaignList(page: number, size: number, gameType: string, sortName?: string) {
  return instance.post('/campaign/list', { size, page, gameType, sortName })
}

/**
 * 获取我的竞选活动信息接口(我的竞选链接)
 * /campaign/getJoinCampaignWithUser
 */
export function getJoinCampaignWithUser(page: number, size: number, gameType: string, sortName?: string) {
  return interceptorChain()
    .clientIdRequest()
    .authRequest()
    .tokenRefreshResponse()
    .instance.post('/campaign/getJoinCampaignWithUser', { size, page, gameType, sortName })
}

/**
 * 查询所选活动的参与记录或者查询历史参与记录(竞选活动的参与记录)
 * /predict/listPlayTypeForCampaign
 */
export function listPlayTypeForCampaign(page: number, size: number, bizId: number, bizFlag: string, sortName?: string) {
  return interceptorChain()
    .clientIdRequest()
    .authRequest()
    .tokenRefreshResponse()
    .instance.post('/predict/listPlayTypeForCampaign', { size, page, bizId, bizFlag, sortName })
}

/**
 * 获取竞选结果接口(点击竞选专家已结束的活动)
 * /biz/predict/getPredictResult
 */
export function getPredictResult(page: number, size: number, bizId: number, sortName?: string) {
  return instance.post('/predict/getPredictResult', { size, page, bizId, sortName })
}

/**
 * 我的参与记录
 * /biz/predict/listPlayTypeWithUserForCampaign
 */
export function listPlayTypeWithUserForCampaign(
  page: number,
  size: number,
  bizId: number,
  bizFlag: string,
  sortName?: string
) {
  return interceptorChain()
    .clientIdRequest()
    .authRequest()
    .loginRedirect()
    .tokenRefreshResponse()
    .instance.post('/predict/listPlayTypeWithUserForCampaign', { size, page, bizId, bizFlag, sortName })
}

/**
 * 查询所选彩种一级玩法和一级玩法对应的二级玩法
 * /biz/predict/type/list
 * @param bizFlag 彩种标识 b(bbs) t(图库) p(竞选) r(心水)
 * @param gameType 彩种类型
 */
export function typeList(bizFlag: string, gameType: number) {
  return instance.post('/predict/type/list', { bizFlag, gameType })
}

/**
 * 提交参与竞选接口
 * /biz/predict/createPredict
 */
export function createPredict(
  bizId: number,
  bizFlag: string,
  playTypeCode: string,
  predict: string[],
  fromIp: string,
  playTypeSubCode?: string,
  playTypeCheckNumberCode?: string,
  predictTitle?: string
) {
  return interceptorChain()
    .clientIdRequest()
    .authRequest()
    .tokenRefreshResponse()
    .instance.post('/predict/createPredict', {
      bizId,
      bizFlag,
      predict,
      fromIp,
      playTypeSubCode,
      playTypeCheckNumberCode,
      predictTitle,
      playTypeCode,
    })
}

/**
 * 获取六合王用户信息接口
 * /biz/predict/sixKing
 * @param page 页码
 * @param size 每页条数
 * @param gameType 游戏类型
 * @param playTypeCode 玩法类型
 * @param issue 最近几期
 * @param current 是否仅显示当前期发布心水的用户(y:是 n:不是)
 * @param sortName 排序字段
 * @param bizFlag 业务类型:b(bbs),t(图库),p(竞选),r(心水) 这个接口应该传p
 */
export function getSixKingResult(
  page: number,
  size: number,
  gameType: string,
  playTypeCode: string,
  issue: number,
  current: string,
  sortName?: string,
  bizFlag?: string
) {
  return interceptorChain().clientIdRequest().authRequest().tokenRefreshResponse().instance.post('/predict/sixKing', {
    size,
    page,
    gameType,
    playTypeCode,
    issue,
    current,
    sortName,
    bizFlag,
  })
}

/**
 * 发布心水
 * /biz/predict/createPreferredChoicePredict
 * @param gameType 游戏类型
 * @param playTypeCode 玩法类型
 * @param predictTitle 心水标题
 * @param predict 心水内容
 * @param fromIp ip地址
 * @param predictScore 查看积分
 */
export function createPreferredChoicePredict(
  gameType: number,
  playTypeCode: string,
  predictTitle: string,
  predict: string[],
  fromIp: string,
  predictScore: number
) {
  return interceptorChain()
    .clientIdRequest()
    .authRequest()
    .loginRedirect()
    .tokenRefreshResponse()
    .instance.post('/predict/createPreferredChoicePredict', {
      bizFlag: 'r',
      gameType,
      playTypeCode,
      predictTitle,
      predict,
      fromIp,
      predictScore,
    })
}

/**
 * 获取连胜榜列表
 * /biz/predict/continueWinList
 * @param page 页码
 * @param size 每页条数
 * @param playTypeCode 玩法类型
 * @param isAll 是否查询全部
 * @param gameType 游戏类型
 */
export function continueWinList(
  page: number,
  size: number,
  playTypeCode: string,
  isAll: boolean,
  gameType: number,
  sortName: string = 'update_time',
  sortOrder: 'ASC' | 'DESC' = 'ASC'
) {
  return interceptorChain()
    .clientIdRequest()
    .authRequest()
    .tokenRefreshResponse()
    .instance.post('/predict/continueWinList', {
      size,
      page,
      playTypeCode,
      isAll,
      gameType,
      sortName,
      sortOrder,
    })
}

/**
 * 获取当前用户上一次发布的心水信息
 * /biz/predict/myLastIssue
 */
export function myLastIssue(gameType: number, playTypeCode: string) {
  return interceptorChain()
    .clientIdRequest()
    .authRequest()
    .loginRedirect()
    .tokenRefreshResponse()
    .instance.post('/predict/myLastIssue', {
      gameType,
      playTypeCode,
    })
}

/**
 * 淘料市场信息列表
 * /biz/predict/platformSwitchInfo
 */
export function platformSwitchInfo(gameType: string) {
  return interceptorChain()
    .clientIdRequest()
    .authRequest()
    .tokenRefreshResponse()
    .instance.post('/predict/platformSwitchInfo', {
      gameType,
    })
}

/**
 * 买料
 * /biz/predict/buy
 * @param predictionId 心水ID
 * @param predictionUser 卖心水用户ID
 * @param point 花费积分，包赔时传的也是单价
 * @param guaranteed 是否包赔
 */
export function buy(predictionId: string, predictionUser: string, point: number, guaranteed: string) {
  return interceptorChain()
    .clientIdRequest()
    .authRequest()
    .loginRedirect()
    .tokenRefreshResponse()
    .instance.post('/predict/buy', {
      predictionId,
      predictionUser,
      point,
      guaranteed,
    })
}

/**
 * 卖料记录
 * /biz/predict/saleList
 */
export function saleList(gameType: number, page: number, size: number, sortName?: string) {
  return interceptorChain()
    .clientIdRequest()
    .authRequest()
    .loginRedirect()
    .tokenRefreshResponse()
    .instance.post('/predict/saleList', {
      gameType,
      size,
      page,
      sortName,
    })
}

/**
 * 买料记录
 * /biz/predict/buyList
 */
export function buyList(page: number, size: number, sortName?: string) {
  return interceptorChain()
    .clientIdRequest()
    .authRequest()
    .loginRedirect()
    .tokenRefreshResponse()
    .instance.post('/predict/buyList', {
      size,
      page,
      sortName,
    })
}

/**
 * 历史冠军
 * /biz/predict/historicalChampion
 */
export function historicalChampion(gameType: number, issue: number, current: 'y' | 'n') {
  return interceptorChain()
    .clientIdRequest()
    .authRequest()
    .tokenRefreshResponse()
    .instance.post('/predict/historicalChampion', {
      gameType,
      issue,
      current,
    })
}

/**
 * 申请成为专家
 * /biz/sense/expertApply
 */
export function expertApply() {
  return interceptorChain()
    .clientIdRequest()
    .authRequest()
    .loginRedirect()
    .tokenRefreshResponse()
    .instance.post('/sense/expertApply')
}

/**
 * 获取其他用户信息
 * /biz/user/profile/{user-id}
 */
export function userProfile(userId: string) {
  return interceptorChain()
    .clientIdRequest()
    .authRequest()
    .tokenRefreshResponse()
    .instance.get(`/user/profile/${userId}`)
}

/**
 * 打赏
 * /biz/reward/do
 */
export function reward(targetUserId: string, rewardScore: number) {
  return interceptorChain()
    .clientIdRequest()
    .authRequest()
    .loginRedirect()
    .tokenRefreshResponse()
    .instance.post('/reward/do', {
      targetUserId,
      rewardScore,
    })
}

/**
 * 专家主页 - 本期推荐列表
 * /biz/sense/currentSense
 */
export function currentSense(userId: string, gameType: number) {
  return interceptorChain()
    .clientIdRequest()
    .authRequest()
    .tokenRefreshResponse()
    .instance.post('/sense/currentSense', {
      userId,
      gameType,
    })
}

/**
 * 专家主页 - 历史推荐列表
 * /biz/sense/openedSense
 */
export function openedSense(userId: string, gameType: number, playCode: string) {
  return interceptorChain().clientIdRequest().authRequest().tokenRefreshResponse().instance.post('/sense/openedSense', {
    userId,
    gameType,
    playCode,
  })
}
