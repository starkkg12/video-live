import getLSItem from '../getLocalStorageItem'
import constants from '@/constants'
import type { Interceptor } from '@/types'

const authRequestInterceptor: Interceptor.RequestInterceptor = async (
  config,
  type?: 'jwt' | 'token'
) => {
  const token = getLSItem(constants.localStorageKeys.ACCESS_TOKEN)
  if (!token) return config
  if (type === 'jwt') {
    config.headers['authorization'] = `Bearer ${token}`
  } else {
    config.headers['token'] = token
  }
  return config
}

export default authRequestInterceptor
