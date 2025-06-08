import constants from '@/constants'

export default function clearAuth() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(constants.localStorageKeys.ACCESS_TOKEN)
  window.localStorage.removeItem(constants.localStorageKeys.ACCESS_TOKEN_EXPIRE_TIME)
  window.localStorage.removeItem(constants.localStorageKeys.REFRESH_TOKEN)
  window.localStorage.removeItem(constants.localStorageKeys.REFRESH_TOKEN_EXPIRE_TIME)
  window.localStorage.removeItem(constants.localStorageKeys.FIRST_LOGIN)
  window.localStorage.removeItem(constants.localStorageKeys.USER_ID)
  window.localStorage.removeItem(constants.localStorageKeys.NICKNAME)
  window.localStorage.removeItem(constants.localStorageKeys.USER_LEVEL)
  window.localStorage.removeItem(constants.localStorageKeys.AVATAR)
  window.localStorage.removeItem(constants.localStorageKeys.VIP_LEVEL)
}
