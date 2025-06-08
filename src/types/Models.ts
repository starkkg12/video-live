/**
 * 查询网站大全列表(默认根据排序顺序降序排序，表字段名(sort_num))(传gameTypeCode)
 * https://dev-torna.pwtk.cc/#/view/K8M0Z3D2
 * API: tk/website/listPage
 * module
 */
export interface IBizTkWebsiteListPageModel {
  siteId: string
  siteLogo: string
  siteName: string
  createTime: string
  /** 是否推荐 */
  isRecommended: string
  /** 是否热门 */
  isHot: string
  /** 是否精选 */
  isSelected: string
  /** 是否置顶 */
  isTop: string
  /**是否爆款 */
  isBloom: string
  /** 彩种 专注彩种（a6,hk6,tw6,sg6,xa6）  */
  focusGameType: string[]
  siteUrl1: string
  siteUrl2: string
  siteUrl3: string
  siteUrl4: string
  siteUrl5: string
  siteDesc: string
  memo: string
  sortNum: number
}
