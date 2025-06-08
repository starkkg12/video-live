import constants from '@/constants'
import getLSItem from '@/utils/getLocalStorageItem'
import defaultAvatar from '@/assets/images/avator.jpg'
const DEFAULT_IMAGE_URL = '' // 可根据需要补充默认图片url

// url 为 'mine' 时，返回当前登录用户的 avatar
export default function getImageUrl(url: string | undefined | null, type: 'normal' | 'avatar' = 'normal'): string {
  const _url = url === 'mine' ? getLSItem(constants.localStorageKeys.AVATAR) : url
  return _url ? `${import.meta.env.PUBLIC_CND_URL}${_url}` : type === 'avatar' ? defaultAvatar.src : DEFAULT_IMAGE_URL
}
