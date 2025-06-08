import type { AxiosPromise } from 'axios'
import type { IResponse, IBizTkWebsiteListPageModel } from '@/types/Types'
import interceptorChain from './interceptorChain'

const instance = interceptorChain().clientIdRequest().instance

//获取网站大全列表
export function getWebsiteList(data: any) {
  return instance.post('/tk/website/list', data)
}
//获取网站大全列表new
export function getWebsiteListAll({
  focusGameType,
  siteName,
}: {
  focusGameType: number | string | (number | string)[]
  siteName: string
}) {
  if (!siteName) siteName = ''
  focusGameType = Array.isArray(focusGameType) ? focusGameType : [focusGameType]
  return instance.post('/tk/website/listAll', { focusGameType, siteName })
}

//获取网站大全列表new
export function getAllWebsiteList(data: any) {
  return instance.post('/tk/website/listAll', data)
}

//获取网站大全列表new
export interface IPageWebsiteListBodyParameter {
  page: number
  size: number
  /**
   * 排序字段
   */
  sortName?: string
  /**
   * 网站ID
   */
  siteId?: string
  /**
   * 网站名字
   */
  siteName?: string
  /**
   * 否 专注彩种（a6,hk6,tw6,sg6,xa6）
   */
  focusGameType?: string[]
  /**
   * 是否推荐；y，是；n，否；
   */
  isRecommended?: string
  /**
   * 是否热门；y，是；n，否；
   */
  isHot?: string
  /**
   *  是否精选；y，是；n，否；
   */
  isSelected?: string
  /**
   *  是否置顶；y，是；n，否；
   */
  isTop?: string
  /**
   * 是否爆款；y，是；n，否；
   */
  isBloom?: string
  /**
   * 是否最新；y，是；n，否；
   */
  isNew?: string
}
/**
 * body:
 * @param data IBodyParameter
 * @returns
 */
export function getPageWebsiteList(
  data: IPageWebsiteListBodyParameter
): Promise<AxiosPromise<IResponse<IBizTkWebsiteListPageModel>>> {
  return instance.post('/tk/website/listPage', data)
}

export function getAllBbsList(data: any) {
  return instance.post('/tk/bbs/listAll', data)
}

//查询论坛大全列表(返回全部列表)(传gameTypeCode)
export function getBbsListAll({
  focusGameType,
  siteName,
}: {
  focusGameType: number | string | (number | string)[]
  siteName: string
}) {
  if (!siteName) siteName = ''
  focusGameType = Array.isArray(focusGameType) ? focusGameType : [focusGameType]
  return instance.post('/tk/bbs/listAll', { focusGameType, siteName })
}

//获取担保平台列表
export function getGuaranteeList(data: any) {
  return instance.post('/tk/guarantee/website/list', data)
}
