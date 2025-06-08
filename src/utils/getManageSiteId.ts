import constants from '@/constants'
import getLSItem from './getLocalStorageItem'
import setLSItem from './setLocalStorageItem'
import axios from 'axios'
import utils from '@/utils'

export default async function () {
  if (typeof window === 'undefined') return
  const manageSiteId = getLSItem(constants.localStorageKeys.MANAGE_SITE_ID)
  if (manageSiteId) return manageSiteId
  else {
    const hostname = utils.getDomain()
    const response = await axios
      .get<
        any[]
      >(`${import.meta.env.PUBLIC_KV_URL}?keys=wm/domain/simple/${hostname === 'localhost' ? 'short197.dating141.com' : hostname}`)
      .then(res => Object.values(res.data))
    const data = response[0]
    setLSItem(constants.localStorageKeys.MANAGE_SITE_ID, data?.manageSiteId ?? '')
    setLSItem(constants.localStorageKeys.WEBSITE_ID, data?.websiteId ?? '')
    return data?.manageSiteId ?? ''
  }
}
