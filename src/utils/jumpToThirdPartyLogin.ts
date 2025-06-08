import { closeToast, showLoadingToast } from 'vant'
import getCid from './getCid'

export type ThirdPartyName = 'facebook' | 'instagram' | 'google' | 'line' | 'x'

export default async (thirdPartyName: string) => {
  showLoadingToast({
    message: 'Loading...',
    duration: 0,
  })
  const user = import.meta.env.PUBLIC_THIRD_PARTY_USER
  const code = import.meta.env.PUBLIC_THIRD_PARTY_CODE
  const cid = await getCid()
  const businessType = import.meta.env.PUBLIC_BUSINESS_TYPE
  const clientType = import.meta.env.PUBLIC_CLIENT_TYPE
  const manageSiteId = import.meta.env.PUBLIC_MANAGE_SITE_ID
  const domain = window.location.origin
  const thirdLoginUrl = `${domain}/auth/callback`
  try {
    window.location.href = `https://biz-client.pwtk.cc/biz-client/biz/login/generateAuthUrl?thirdPartyName=${thirdPartyName}&user=${user}&code=${code}&cid=${cid}&businessType=${businessType}&clientType=${clientType}&manageSiteId=${manageSiteId}&thirdLoginUrl=${thirdLoginUrl}`
  } catch (error) {
    console.error('error', error)
    closeToast()
  }
}
