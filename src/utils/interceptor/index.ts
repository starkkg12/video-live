import authRequestInterceptor from "./authRequestInterceptor";
import clientIdRequestInterceptor from "./clientIdRequestInterceptor";
import manageSiteIdRequestInterceptor from "./manageSiteIdRequestInterceptor";
import tokenRefreshResponseInterceptor from "./tokenRefreshResponseInterceptor";
import loginRedirectInterceptor from "./loginRedirectInterceptor";

export default {
  /**
   * 请求拦截器, 在请求头中添加token
   */
  authRequestInterceptor,
  /**
   * 请求拦截器, 在请求头中添加cid
   */
  clientIdRequestInterceptor,
  /**
   * 请求拦截器, 使用此拦截器可以在未登录时跳转到登录页
   */
  loginRedirectInterceptor,
  /**
   * 响应拦截器, 处理token过期以及未登录的情况
   */
  tokenRefreshResponseInterceptor,
  /**
   * 请求拦截器, 在请求头中添加manageSiteId
   */
  manageSiteIdRequestInterceptor,
};
