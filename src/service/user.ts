import interceptorChain from './interceptorChain'
import type { ApiResponse } from './types/common'

const instance = interceptorChain()
  .clientIdRequest()
  .authRequest()
  .loginRedirect()
  .tokenRefreshResponse().instance

/**
 * 查看个人信息
 */
export function getUserInfo() {
  return instance.get('/user/self')
}

/**
 * 获取当前用户的评论列表（期刊）
 */
export function getIssuePosts(page: number, size: number) {
  return instance.post('/comment/issuePosts', { size, page })
}

/**
 * 获取当前用户的评论列表（论坛）
 */
export function getForumPosts(
  page: number,
  size: number,
  id: string,
  idType: 'forum' | 'mainBoard' | 'bbs'
) {
  return interceptorChain()
    .clientIdRequest()
    .authRequest()
    .loginRedirect('ask-back-login')
    .tokenRefreshResponse('ask-back-login')
    .instance.post('/bbsForumPost/myComments', {
      size,
      page,
      forumId: idType === 'forum' ? id : undefined,
      mainBoardId: idType === 'mainBoard' ? id : undefined,
      bbsId: idType === 'bbs' ? id : undefined,
    })
}

/**
 * 修改个人昵称
 */
export function updateNickname(nickname: string) {
  return instance.post('/user/updateNickname', { nickname })
}

/**
 * 修改个人头像
 */
export function updateAvatar(avatar: string) {
  return instance.post('/user/updateAvatar', { avatar })
}

/**
 * 向当前手机发送验证码
 */
export function currentMobileSendCode(mobileCountryCode: string, mobile: string) {
  return instance.post(`${import.meta.env.PUBLIC_BIZ_URL}/user/currentMobileSendCode`, {
    mobileCountryCode,
    mobile,
    clientType: 'C_WEB',
  })
}

/**
 * 验证当前手机号验证码
 */
export function currentMobileVerify(token: string, authCode: string) {
  return instance.post(`${import.meta.env.PUBLIC_BIZ_URL}/user/currentMobileVerify`, {
    clientType: import.meta.env.PUBLIC_CLIENT_TYPE,
    token,
    authCode,
  })
}

/**
 * 用户修改手机号发送短信验证码
 */
export function changeMobileSendCode(mobileCountryCode: string, mobile: string, token?: string) {
  return instance.post(`${import.meta.env.PUBLIC_BIZ_URL}/user/changeMobileSendCode`, {
    clientType: import.meta.env.PUBLIC_CLIENT_TYPE,
    mobileCountryCode,
    mobile,
    token,
  })
}

/**
 * 用户修改手机号，验证码确认
 */
export function changeMobileVerify(token: string, authCode: string) {
  return instance.post(`${import.meta.env.PUBLIC_BIZ_URL}/user/changeMobileVerify`, {
    clientType: import.meta.env.PUBLIC_CLIENT_TYPE,
    token,
    authCode,
  })
}

/**
 * 验证当前手机号验证码
 */
export function verifyCurrentMobile(token: string, authCode: string) {
  return instance.post(`${import.meta.env.PUBLIC_BIZ_URL}/user/changeMobileVerify`, {
    clientType: import.meta.env.PUBLIC_CLIENT_TYPE,
    token,
    authCode,
  })
}

/**
 * 获取当前用户的收藏列表（论坛）
 */
export function getForumCollects(
  page: number,
  size: number,
  id: string,
  idType: 'forum' | 'mainBoard' | 'bbs'
) {
  return interceptorChain()
    .clientIdRequest()
    .authRequest()
    .tokenRefreshResponse()
    .instance.post('/bbsForumPost/myCollect', {
      size,
      page,
      forumId: idType === 'forum' ? id : undefined,
      mainBoardId: idType === 'mainBoard' ? id : undefined,
      bbsId: idType === 'bbs' ? id : undefined,
    })
}

/**
 * 获取当前用户的喜欢列表（论坛）
 */
export function getForumLikes(
  page: number,
  size: number,
  id: string,
  idType: 'forum' | 'mainBoard' | 'bbs'
) {
  return interceptorChain()
    .clientIdRequest()
    .authRequest()
    .tokenRefreshResponse()
    .instance.post('/bbsForumPost/myLike', {
      size,
      page,
      forumId: idType === 'forum' ? id : undefined,
      mainBoardId: idType === 'mainBoard' ? id : undefined,
      bbsId: idType === 'bbs' ? id : undefined,
    })
}

/**
 * 获取当前用户的喜欢列表（期刊）
 */
export function getIssueLikes(page: number, size: number) {
  return interceptorChain()
    .clientIdRequest()
    .authRequest()
    .tokenRefreshResponse()
    .instance.post('/like/myLikeIssues', { size, page })
}

/**
 * 获取当前用户的收藏列表（期刊）
 */
export function getIssueCollects(page: number, size: number) {
  return interceptorChain()
    .clientIdRequest()
    .authRequest()
    .tokenRefreshResponse()
    .instance.post('/favorite/myFavoriteIssues', { size, page })
}

type LikeFlagType = 'u' | 'c' | 'p' | 't' | 's'
type LikeTypeType = 'l' | 'h'
/**
 * 切换点赞
 * @param ipInfo base64编码的ip信息
 * @param likeType 点赞标识 「 l: like(点赞), h: hate(踩) 」
 * @param likeFlag 点赞类型 「 u: 图库评论, c: 论坛评论, p: 帖子, t: 图库｜期刊, s: 系列, g: 图解」
 * @param targetId 点赞对象标识符
 * @param targetRef 点赞对象的上级标识符
 *
 * 参数targetRef和targetId依赖likeFlag，具体如下：
 * * u: 图库评论
 * *    - targetId: postId(评论ID)
 * *    - targetRef: issueId(期刊ID)
 * * c: 论坛评论
 * *    - targetId: postId(评论ID)
 * *    - targetRef: postId(主贴ID)
 * * p: 帖子
 * *    - targetId: postId(帖子ID)
 * *    - targetRef: forumId(论坛ID)
 * * t: 图库｜期刊
 * *    - targetId: issueId(期刊ID)
 * *    - targetRef: newspaerCode(报纸代码)
 * * s: 系列
 * *    - targetId: seriesCode(系列代码)
 * *    - targetRef: gameType(游戏类型)
 */
export function toggleLikeHate(
  targetRef: string,
  targetId: string,
  likeFlag: LikeFlagType,
  likeType: LikeTypeType,
  ipInfo: string
) {
  return interceptorChain()
    .clientIdRequest()
    .authRequest()
    .tokenRefreshResponse()
    .instance.post('/like/toggle', {
      targetRef,
      targetId,
      likeFlag,
      likeType,
      ipInfo,
    })
}

/**
 * 获取我的勋章
 */
export function getMyMedals() {
  return interceptorChain()
    .clientIdRequest()
    .authRequest()
    .loginRedirect('ask-back-login')
    .tokenRefreshResponse('ask-back-login')
    .instance.get('/userMedal/page')
}
/**
 * 模糊查询用户互关列表
 */
export function getMyRelationship(data: {
  page: number
  size: number
  nickname: string
  userId: string
}) {
  return instance.post('/relationship/relationshipByNickname', data)
}
/**
 * 批量获取用户摘要信息
 */
export function getBatchUsersList(data: string[]) {
  return interceptorChain().clientIdRequest().authRequest().instance.post('/user/batchList', data)
}
/**
 * 批量获得我和某用户之间的关注/粉丝关系
 */
export function getBatchRelationship(data: { targetUserIdList: string[]; direct: string }) {
  return instance.post('/relationship/batch-get ', data)
}

export interface UserBatchItem {
  userId: string
  nickname: string
  avatar: string
  vipLevel: number
  talent: number
  relationship: number
  userExists: boolean
  gender: UserGender
}

export type GetUserBatchListResponse = ApiResponse<UserBatchItem[]>

/**
 * 获取用户批量列表
 */
export function getUserBatchList(
  userIdList: string | (string | number)[]
): Promise<GetUserBatchListResponse> {
  const userIdListArray = Array.isArray(userIdList) ? userIdList : [userIdList]
  return instance
    .post<GetUserBatchListResponse>(`/user/batchList`, userIdListArray)
    .then(response => response.data)
}

/** 性别： m: 男, f: 女, x: 未知 */
export type UserGender = 'm' | 'f' | 'x'

export type UpdateUserGenderResponse = ApiResponse<void>

/**
 * 修改个人性别
 * @param gender 性别： m: 男, f: 女, x: 未知
 * @see https://dev-torna.pwtk.cc/#/view/42GM9dAX
 */
export function updateUserGender(gender: UserGender): Promise<UpdateUserGenderResponse> {
  return instance
    .post<UpdateUserGenderResponse>('/user/updateGender', gender)
    .then(response => response.data)
}
