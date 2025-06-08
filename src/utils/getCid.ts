import getDomain from '@/utils/getDomain'
import getLSItem from './getLocalStorageItem'
import setLSItem from './setLocalStorageItem'
import constants from '@/constants'
import axios from 'axios'

export default async function () {
  const cid = getLSItem(constants.localStorageKeys.CLIENT_ID)
  if (cid) return cid
  else {
    const domain = getDomain()
    const response = await createCid(domain)
    const newCid = response?.data?.data?.cid
    if (!newCid) throw new Error('cid is empty')
    await registerCid(newCid, import.meta.env.PUBLIC_MANAGE_SITE_ID)
    setLSItem('cid', newCid)
    return newCid
  }
}

function createCid(domain: string) {
  return axios.get(`${import.meta.env.PUBLIC_CF_PROXY_URL}/client/cid?domain=${domain}`)
}

function registerCid(cid: string, manageSiteId: string) {
  return axios.post(`${import.meta.env.PUBLIC_CF_PROXY_URL}/client/register-cid`, {
    cid,
    manageSiteId,
    clientType: import.meta.env.PUBLIC_CLIENT_TYPE,
    clientFlag: 'h',
  })
}
