import type { Interceptor } from '@/types'
import { LoginStatus } from '../isLoggedIn'
import jumpToLogin from '../jumpToLogin'
import constants from '@/constants'
import clearAuth from '@/utils/clearAuth.ts'
import getLSItem from '@/utils/getLocalStorageItem'

function isLoggedInOrNewer(): LoginStatus {
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
    return LoginStatus.NOT_LOGGED_IN_AT_ALL
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

const loginRedirectInterceptor: Interceptor.RequestInterceptor = async (
  config,
  type?: 'jwt' | 'token',
  confirmCallback?: Function
) => {
  const status = isLoggedInOrNewer()
  if (status === LoginStatus.NOT_LOGGED_IN_AT_ALL || status === LoginStatus.NOT_LOGGED_IN) {
    const isConfirmed = confirmCallback ? await confirmCallback(status) : true
    if (!isConfirmed) return config
    jumpToLogin()
    return config
  }
  return config
}

export default loginRedirectInterceptor
