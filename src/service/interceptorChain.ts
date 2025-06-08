import utils from '@/utils'
import axios from 'axios'
import { showDialog } from 'vant'
import { LoginStatus } from '@/utils/isLoggedIn.ts'

function onBack() {
  typeof window !== 'undefined' && window.history.back()
}

function confirmJump(type?: 'ask-cancel-login' | 'ask-back-login') {
  if (!type) return

  const cancelText = type === 'ask-back-login' ? '返回上一页' : '取消'
  const cancelCallback = type === 'ask-back-login' ? onBack : () => {}
  const allMessage = {
    [LoginStatus.NOT_LOGGED_IN]: '登录已过期，是否重新登录页面？',
    [LoginStatus.NOT_LOGGED_IN_AT_ALL]: '您还未登录，是否马上登录页面？',
  }

  const callback = async (
    loginStatus:
      | LoginStatus.NOT_LOGGED_IN_AT_ALL
      | LoginStatus.NOT_LOGGED_IN = LoginStatus.NOT_LOGGED_IN
  ) => {
    return new Promise((resolve, reject) => {
      showDialog({
        title: '提示',
        message: allMessage[loginStatus],
        confirmButtonText: '去登录',
        confirmButtonColor: '#ff0000',
        cancelButtonText: cancelText,
        showCancelButton: true,
      })
        .then(() => {
          resolve(true)
        })
        .catch(() => {
          cancelCallback()
          reject(false)
        })
    })
  }
  return callback
}

export default function interceptorChain(baseURL?: string) {
  const chain = {
    instance: axios.create({
      baseURL: baseURL || import.meta.env.PUBLIC_BIZ_URL,
    }),
    clientIdRequestInterceptor: -1,
    authRequestInterceptor: -1,
    loginRedirectInterceptor: -1,
    tokenRefreshResponseInterceptor: -1,
    manageSiteIdRequestInterceptor: -1,
    clientIdRequest: () => {
      chain.clientIdRequestInterceptor = chain.instance.interceptors.request.use(
        utils.interceptor.clientIdRequestInterceptor
      )
      return chain
    },
    authRequest: (type?: 'jwt' | 'token') => {
      chain.authRequestInterceptor = chain.instance.interceptors.request.use(config =>
        utils.interceptor.authRequestInterceptor(config, type)
      )
      return chain
    },
    loginRedirect: (type?: 'ask-cancel-login' | 'ask-back-login') => {
      chain.loginRedirectInterceptor = chain.instance.interceptors.request.use(config =>
        utils.interceptor.loginRedirectInterceptor(config, undefined, confirmJump(type))
      )
      return chain
    },
    tokenRefreshResponse: (type?: 'ask-cancel-login' | 'ask-back-login') => {
      chain.tokenRefreshResponseInterceptor = chain.instance.interceptors.response.use(responese =>
        utils.interceptor.tokenRefreshResponseInterceptor(responese, confirmJump(type))
      )
      return chain
    },
    manageSiteIdRequest: () => {
      chain.manageSiteIdRequestInterceptor = chain.instance.interceptors.request.use(
        utils.interceptor.manageSiteIdRequestInterceptor
      )
      return chain
    },
  }

  return chain
}
