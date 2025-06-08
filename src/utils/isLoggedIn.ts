import constants from '@/constants'
import getLSItem from './getLocalStorageItem'
import clearAuth from './clearAuth'

export enum LoginStatus {
  /**
   * 已经登录
   */
  LOGGED_IN = 'logged-in',
  /**
   * 需要刷新
   */
  EXPIRED = 'expired',
  /**
   * 未登录
   */
  NOT_LOGGED_IN = 'not-logged-in',
  /**
   * 完全未登录
   */
  NOT_LOGGED_IN_AT_ALL = 'not-logged-in-at-all',
}

/**
 * 判断用户是否登录
 * @returns {LoginStatus} 返回登录状态
 */
export default function isLoggedIn(): LoginStatus {
  const accessToken = getLSItem(constants.localStorageKeys.ACCESS_TOKEN)
  const accessTokenExpireTime = getLSItem(constants.localStorageKeys.ACCESS_TOKEN_EXPIRE_TIME)
  const refreshToken = getLSItem(constants.localStorageKeys.REFRESH_TOKEN)
  const refreshTokenExpireTime = getLSItem(constants.localStorageKeys.REFRESH_TOKEN_EXPIRE_TIME)
  const firstLogin = getLSItem(constants.localStorageKeys.FIRST_LOGIN)
  const userId = getLSItem(constants.localStorageKeys.USER_ID)

  if (
    accessToken === null ||
    accessTokenExpireTime === null ||
    refreshToken === null ||
    refreshTokenExpireTime === null ||
    firstLogin === null ||
    userId === null
  ) {
    clearAuth()
    return LoginStatus.NOT_LOGGED_IN
  }

  if (Date.now() >= Number(refreshTokenExpireTime)) {
    clearAuth()
    return LoginStatus.NOT_LOGGED_IN
  }

  if (Date.now() > Number(accessTokenExpireTime) && Date.now() < Number(refreshTokenExpireTime)) {
    return 'expired' as LoginStatus
  }

  return 'logged-in' as LoginStatus
}
