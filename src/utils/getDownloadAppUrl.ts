import getLSItem from './getLocalStorageItem'
import setLSItem from './setLocalStorageItem'
import kv from '@/service/kv'
import constants from '@/constants'

const getDownloadAppUrl: () => Promise<string | null> = async () => {
  if (typeof window === 'undefined' || !window.location.hostname) {
    return null
  }
  const downloadAppUrl = getLSItem(constants.localStorageKeys.DOWNLOAD_APP_URL)

  if (!downloadAppUrl || downloadAppUrl === 'undefined') {
    try {
      const response = await kv()
        .getDomain(
          window.location.hostname === 'localhost' ? import.meta.env.PUBLIC_TEST_DOMAIN : window.location.hostname
        )
        .do()
      const downloadAppUrl = response[0]?.appDownloadUrl
      if (!downloadAppUrl) {
        return null
      }
      setLSItem(constants.localStorageKeys.DOWNLOAD_APP_URL, downloadAppUrl)
      return downloadAppUrl
    } catch (error) {
      console.error('Failed to get service url', error)
      return null
    }
  }
  return downloadAppUrl
}

export default getDownloadAppUrl
