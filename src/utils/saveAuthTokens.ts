import constants from '@/constants'
import setLSItem from './setLocalStorageItem'

interface ResData {
  success: boolean
  data: {
    accessToken: string
    accessTokenExpireTime: number
    firstLogin: boolean
    refreshToken: string
    refreshTokenExpireTime: number
    userId: string
    userInfo: {
      nickname: string
      userLevel: number
      avatar: string
      vipLevel: number
      myPromotionCodeList: string[]
      talent: number
    }
  }
}

function saveAuthTokens(response: { data: ResData }) {
  if (undefined === response?.data?.data?.accessToken) throw new Error('缺少参数 accessToken')
  if (undefined === response?.data?.data?.accessTokenExpireTime) throw new Error('缺少参数 “accessToken过期时间”')
  if (undefined === response?.data?.data?.firstLogin) throw new Error('缺少参数 “是否是第一次登录”')
  if (undefined === response?.data?.data?.refreshToken) throw new Error('缺少参数 “刷新token”')
  if (undefined === response?.data?.data?.refreshTokenExpireTime) throw new Error('缺少参数 刷新token过期时间')
  if (undefined === response?.data?.data?.userId) throw new Error('缺少参数 “用户ID”')
  if (undefined === response?.data?.data?.userInfo?.nickname) throw new Error('缺少参数 “用户昵称”')
  if (undefined === response?.data?.data?.userInfo?.userLevel) throw new Error('缺少参数 “用户等级”')
  if (undefined === response?.data?.data?.userInfo?.avatar) throw new Error('缺少参数 “用户头像”')
  if (undefined === response?.data?.data?.userInfo?.vipLevel) throw new Error('缺少参数 “用户VIP等级”')
  if (undefined === response?.data?.data?.userInfo?.myPromotionCodeList?.[0]) throw new Error('缺少参数 “用户邀请码”')
  if (undefined === response?.data?.data?.userInfo?.talent) throw new Error('缺少参数 “用户类型标识”')

  // ! Token
  setLSItem(constants.localStorageKeys.ACCESS_TOKEN, response.data.data.accessToken)
  // ! Token 过期时间
  setLSItem(constants.localStorageKeys.ACCESS_TOKEN_EXPIRE_TIME, response.data.data.accessTokenExpireTime)
  // ! 是否第一次登录
  setLSItem(constants.localStorageKeys.FIRST_LOGIN, response.data.data.firstLogin)
  // ! 刷新 Token
  setLSItem(constants.localStorageKeys.REFRESH_TOKEN, response.data.data.refreshToken)
  // ! 刷新 Token 过期时间
  setLSItem(constants.localStorageKeys.REFRESH_TOKEN_EXPIRE_TIME, response.data.data.refreshTokenExpireTime)
  // ! 用户 ID
  setLSItem(constants.localStorageKeys.USER_ID, response.data.data.userId)
  // ! 用户昵称
  setLSItem(constants.localStorageKeys.NICKNAME, response.data.data.userInfo.nickname)
  // ! 用户等级
  setLSItem(constants.localStorageKeys.USER_LEVEL, response.data.data.userInfo.userLevel)
  // ! 用户头像
  setLSItem(constants.localStorageKeys.AVATAR, response.data.data.userInfo.avatar)
  // ! VIP 等级
  setLSItem(constants.localStorageKeys.VIP_LEVEL, response.data.data.userInfo.vipLevel)
  console.log(response)
  // ! 用户邀请码
  setLSItem(constants.localStorageKeys.PROMOTION_CODE, response.data.data.userInfo.myPromotionCodeList[0])
  // ! 是否是专家
  setLSItem(constants.localStorageKeys.IS_EXPERT, response.data.data.userInfo.talent === 2)
}

export default saveAuthTokens
