// import getLSItem from '../getLocalStorageItem'
// import constants from '@/constants'
import type { Interceptor } from '@/types'

const authRequestInterceptor: Interceptor.RequestInterceptor = async config => {
  const managesiteid = import.meta.env.PUBLIC_MANAGE_SITE_ID
  config.headers['managesiteid'] = managesiteid
  return config
}

export default authRequestInterceptor
