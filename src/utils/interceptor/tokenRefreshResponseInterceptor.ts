import axios from 'axios'
import dayjs from 'dayjs'
import { showDialog, showToast } from 'vant'
import constants from '@/constants'
import type { Interceptor } from '@/types'
import jumpToLogin from '../jumpToLogin'
import saveAuthTokens from '../saveAuthTokens'
import copyText from '../copyText'
import getLSItem from '../getLocalStorageItem'
import setLSItem from '../setLocalStorageItem'
import getCid from '../getCid'

const tokenRefreshResponseInterceptor: Interceptor.ResponseInterceptor = async (
  response,
  confirmCallback?: Function
) => {
  if (response.data.success) return response
  switch (response.data.errCode) {
    case '10006': // 获取用户上下文失败, 跳转到login页面
    case '10025': // 客户端ID不一致，cid和token不一致
    case '10034': // 用户已登出，需要重新登录
      if (
        typeof window !== 'undefined' &&
        window.location.pathname !== '/login'
      ) {
        _jumpToLogin('new-page')
      }
      break
    case '10033': // token过期, 需要刷新token
      const accessToken = getLSItem(constants.localStorageKeys.ACCESS_TOKEN)
      const accessToeknExpireTime = getLSItem(constants.localStorageKeys.ACCESS_TOKEN_EXPIRE_TIME)
      const refreshToken = getLSItem(constants.localStorageKeys.REFRESH_TOKEN)
      const refreshTokenExpireTime = getLSItem(constants.localStorageKeys.REFRESH_TOKEN_EXPIRE_TIME)

      if (!accessToken || !accessToeknExpireTime || !refreshToken || !refreshTokenExpireTime) _jumpToLogin()

      const now = new Date().getTime()

      now > Number(refreshTokenExpireTime) && _jumpToLogin()

      try {
        const refreshResponse = await axios.post(`${import.meta.env.PUBLIC_BIZ_URL}/login/applyAccessToken`, {
          clientType: import.meta.env.PUBLIC_CLIENT_TYPE,
          refreshToken,
        })
        if (!refreshResponse.data.success) _jumpToLogin()
        saveAuthTokens(refreshResponse.data)

        // token刷新成功, 重新请求接口
        response.config.headers['cid'] = await getCid()
        response.config.headers['token'] = getLSItem(constants.localStorageKeys.ACCESS_TOKEN)

        return axios(response.config)
      } catch (error) {
        _jumpToLogin()
      }
    case '10026': // 非法的cid
      setLSItem('cid', '')
      break
    case '729': // 参数校验错误(Required request header 'token' for method parameter type String is not present)
    case '006': // 缺少token或cid
      const errText = `errCode: ${response.data.errCode}\n\nerrMessage: ${response.data.errMessage}\n\nerrTime: ${dayjs(response.headers.date).format('YYYY-MM-DD HH:mm:ss')}`
      showDialog({
        title: '错误提示',
        message: errText,
        confirmButtonText: '复制',
        confirmButtonColor: '#ff0000',
        cancelButtonText: '取消',
        showCancelButton: true,
        messageAlign: 'left',
      }).then(() => {
        copyText(errText)
        showToast('复制到剪贴板')
      })
      break
  }
  async function _jumpToLogin(type: 'replace' | 'new-page' = 'replace') {
    const isConfirmed = confirmCallback ? await confirmCallback() : true
    if (!isConfirmed) return
    if (type === 'replace') {
      jumpToLogin()
    } else {
      window.location.href = '/'
    }
  }
  return response
}

export default tokenRefreshResponseInterceptor
