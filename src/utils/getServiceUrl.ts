import getLSItem from './getLocalStorageItem'
import setLSItem from './setLocalStorageItem'
import kv from '@/service/kv'
import constants from '@/constants'

const getServiceUrl: () => Promise<string | null> = async () => {
  if (typeof window === 'undefined' || !window.location.hostname) {
    return null
  }
  const serviceUrl = getLSItem(constants.localStorageKeys.SERVICE_URL)

  if (!serviceUrl || serviceUrl === 'undefined') {
    try {
      const response = await kv()
        .getDomain(
          window.location.hostname === 'localhost' ? import.meta.env.PUBLIC_TEST_DOMAIN : window.location.hostname
        )
        .do()
      const serviceUrl = response[0]?.onlineServiceCode
      if (!serviceUrl) {
        return null
      }
      setLSItem(constants.localStorageKeys.SERVICE_URL, serviceUrl)
      return serviceUrl
    } catch (error) {
      console.error('Failed to get service url', error)
      return null
    }
  }
  return serviceUrl
}

export default getServiceUrl
