import getCid from '../getCid'
import type { Interceptor } from '@/types'

const clientIdRequestInterceptor: Interceptor.RequestInterceptor = async config => {
  config.headers['cid'] = await getCid()
  // config.headers['clientType'] = import.meta.env.PUBLIC_CLIENT_TYPE
  config.headers['businessType'] = import.meta.env.PUBLIC_BUSINESS_TYPE
  return config
}

export default clientIdRequestInterceptor
