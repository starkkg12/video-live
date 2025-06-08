import interceptorChain from "../interceptorChain";

// 创建视频 API 实例
export const videoApiInstance = interceptorChain(import.meta.env.PUBLIC_VIDEO_UPLOAD_URL)
  .clientIdRequest()
  .manageSiteIdRequest()
  .authRequest("jwt").instance; 

  // 上传视频请求实例
export const uploadInstance = interceptorChain(import.meta.env.PUBLIC_VIDEO_UPLOAD_URL)
.clientIdRequest()
.manageSiteIdRequest()
.authRequest("jwt").instance;