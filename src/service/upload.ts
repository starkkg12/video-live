import axios from 'axios'
import utils from '@/utils'
const instance = axios.create({
  baseURL: import.meta.env.PUBLIC_UPLOAD_URL,
})

instance.interceptors.request.use(utils.interceptor.clientIdRequestInterceptor)
instance.interceptors.request.use(utils.interceptor.authRequestInterceptor)
instance.interceptors.request.use(utils.interceptor.loginRedirectInterceptor)
instance.interceptors.response.use(utils.interceptor.tokenRefreshResponseInterceptor)

export enum UploadFrom {
  BBS_ICON = 'bbs/icon',
  BBS_MAINBOARD_ICON = 'bbs/mainboard/icon',
  BBS_FORUM_ICON = 'bbs/forum/icon',
  BBS_FORUM_ATTACHMENT = 'bbs/forum/attachment',
  USER_PROFILE_HEADER = 'user/profile/header',
  TK_WEBSITE_ICON = 'tk/website/icon',
  TK_GUARANTEE_ICON = 'tk/guarantee/icon',
  WM_WEBSITE_ICON = 'wm/website/icon',
  WM_WEBSITE_LOGO = 'wm/website/logo',
  WM_DOMAIN_ICON = 'wm/domain/icon',
  WM_DOMAIN_LOGO = 'wm/domain/logo',
  WM_TEMPLATE_ICON = 'wm/template/icon',
  WM_TEMPLATE_LOGO = 'wm/template/logo',
  NEWSPAPER_ISSUE = 'newspaper/issue',
  CHAT_BG_IMG = 'chat/bg/img',
  CHAT_MESSAGE_IMG = 'chat/message/img',
}

export enum Env {
  DEV = 'dev',
  TEST = 'test',
  UAT = 'uat',
  PROD = 'prod',
}

export enum StorageType {
  S3 = 'S3',
  R2 = 'R2',
}

export enum StorageStyle {
  DEFAULT = 6,
  JOURNAL = 7,
}

export type UploadConfig = {
  storageStyle: StorageStyle
  fileType: 'img'
  uploadFrom: UploadFrom
  uploadTarget: string
  storageType: StorageType
  env: Env
  file: File
  splicingContent?: string
}

export function uploadSingle(config: UploadConfig) {
  const body = {
    fileType: config.fileType,
    uploadFrom: config.splicingContent ? `${config.uploadFrom}/${config.splicingContent ?? ''}` : config.uploadFrom,
    uploadTarget: config.uploadTarget,
    storageType: config.storageType,
    storageStyle: config.storageStyle,
    env: config.env,
    file: config.file,
  }

  return instance.post('/upload/single', body, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'clientType': import.meta.env.PUBLIC_CLIENT_TYPE,
    },
  })
}
