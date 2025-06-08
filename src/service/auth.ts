import interceptorChain from './interceptorChain'
import getClientType from '@/utils/getClientType'


const instance = interceptorChain().clientIdRequest().tokenRefreshResponse('ask-cancel-login').instance

// 用户手机登录，发送手机验证码
export function mobileLoginSendCode(mobileCountryCode: string, mobile: string, ipInfo: string) {
  return instance.post(`/login/mobileLoginSendCode`, {
    mobileCountryCode,
    mobile,
    clientType: getClientType(),
    ipInfo,
  })
}

// 用户手机登录，验证码确认，完成注册
export function mobileLoginVerify(token: string, authCode: string, ipInfo: string) {
  return instance.post(`/login/mobileLoginVerify`, {
    clientType: getClientType(),
    ipInfo,
    token,
    authCode,
    gray: import.meta.env.PUBLIC_GRAY_RELEASE === 'true',
  })
}

// 用户通过邮箱登录，发送验证码
export function mailLoginSendCode(email: string) {
  return instance.post(`/login/mailLoginSendCode`, {
    clientType: import.meta.env.PUBLIC_CLIENT_TYPE,
    email,
  })
}

// 用户通过邮箱登录，验证码确认，完成注册
export function mailLoginVerify(token: string, authCode: string) {
  return instance.post(`/login/mailLoginVerify`, {
    clientType: import.meta.env.PUBLIC_CLIENT_TYPE,
    token,
    authCode,
    gray: import.meta.env.PUBLIC_GRAY_RELEASE === 'true',
  })
}

// 账户密码方式注册
export function accountRegister(loginId: string, sha1Password: string, salt: string, secret: string, ipInfo: string) {
  return instance.post(`/login/accountRegister`, {
    clientType: import.meta.env.PUBLIC_CLIENT_TYPE,
    loginId,
    sha1Password,
    salt,
    secret,
    ipInfo,
    gray: import.meta.env.PUBLIC_GRAY_RELEASE === 'true',
  })
}

// 账号密码方式登录
export function accountLogin(loginId: string, salt: string, secret: string, ipInfo: string) {
  return instance.post(`/login/accountLogin`, {
    clientType: import.meta.env.PUBLIC_CLIENT_TYPE,
    loginId,
    salt,
    secret,
    gray: import.meta.env.PUBLIC_GRAY_RELEASE === 'true',
    ipInfo,
  })
}

// 用户退出登录
export async function exit() {
  return interceptorChain().clientIdRequest().authRequest().instance.post(`/login/exit`, {})
}

// 第三方登录
export function thirdPartyLogin(token: string, businessType: string, clientType: string) {
  return interceptorChain()
    .clientIdRequest()
    .instance.get(`/login/thirdLogin?token=${token}`, { headers: { businessType, clientType } })
}
