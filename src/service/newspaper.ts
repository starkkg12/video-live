import interceptorChain from './interceptorChain'

const instance = interceptorChain().clientIdRequest().authRequest().tokenRefreshResponse().instance

export interface GetNewspaperIssueListParams {
  // 页码
  page: number
  // 每页显示条数
  size: number
  // 排序字段
  sortName?: string
  // 第几期
  issue?: number
  // 年份
  year?: number
  // 图纸系列代码
  seriesCode?: string
  // 图纸报纸代码
  newspaperCode?: string
  // 彩种
  gameType?: number
  // 图纸URI
  imgPath?: string
  // 是否彩色;y,彩色;n,黑白;
  isColorful?: string
  // 是否置顶
  isTop?: string
  // 是否精选 y是；n否。
  isSelected?: string
  // 是否热门 y是；n否。
  isHot?: string
  // 是否爆款 y是；n否。
  isBloom?: string
  // 是否推荐 y是；n否。
  isRecommended?: string
  // 评论标记;y,可以;n,不可以
  commentFlag?: string
  // 投票标记;y,可以;n,不可以
  voteFlag?: string
  // 是否全部注解内容 y是；n否。
  isAllAnnotateContent?: string
  // 注解
  annotateContent?: string
}

interface NewspaperIssue {
  issue: string // 第几期, 整数类型

  year: string // 年份, 整数类型

  newspaperCode: string // 报纸代码, 字符串类型, 无注释

  gameType: string // 彩种, 整数类型

  seriesCode: string // 系列代码, 字符串类型, 无注释
}

interface Comment {
  page: number // 页码，整数类型
  size: number // 每页显示条数，整数类型
  sortName?: string // 排序字段，字符串类型，可选

  postId?: number // 评论ID，整数类型，可选
  issueId?: number // 期刊ID，整数类型，可选
  postContent?: string // 评论内容或预览，字符串类型，最大长度512位，可选
  isAllPostContent?: string // 是否全部评论内容，y: 全部；n: 部分，字符串类型，最大长度1位，可选

  postTime?: string // 发布时间，格式：yyyy-MM-dd HH:mm:ss，可选
  postUserId?: number // 发布用户ID，整数类型，可选
  postThreadSeq?: number // 帖子序列号，0表示主贴，整数类型，可选
  likeCount?: number // 点赞数量，整数类型，可选
  favoriteCount?: number // 收藏数量，整数类型，可选
  threadCount?: number // 回复数量，整数类型，可选
  readCount?: number // 阅读数量，整数类型，可选
  threadPostId?: number // 回复评论ID，整数类型，可选

  isAnonymous?: string // 是否匿名回复，字符串类型，最大长度1位，可选
  isAuthor?: string // 是否作者，字符串类型，可选
  enableAnonymous?: string // 是否可以匿名回复，字符串类型，最大长度1位，可选
  viewFlag?: string // 可见标记，a:所有可见; u:用户可见; r:关注可见; f:好友可见，字符串类型，最大长度1位，可选

  postYear?: string // 发布年份，字符串类型，最大长度4位，可选
  postIssue?: string // 发布期数，字符串类型，最大长度32位，可选
  postGameRef?: string // 发布关联游戏标记，字符串类型，最大长度32位，可选
  postGametypeRef?: number // 发布关联游戏类型标记，整数类型，可选

  hasAttachment?: string // 是否有附件，y:有; n:没有，字符串类型，最大长度1位，可选
  isEdited?: string // 是否被编辑过，y:有; n:没有，字符串类型，最大长度1位，可选
  lastEditTime?: string // 最后编辑时间，格式：yyyy-MM-dd HH:mm:ss，可选
  fromIp?: string // 来源IP，字符串类型，最大长度64位，可选
  fromClientFlag?: string // 来源终端标记，字符串类型，最大长度1位，可选

  userMakeSenseCount?: number // 用户有心水数，整数类型，可选
  userMakeNoSenseCount?: number // 用户没心水数，整数类型，可选
  clientMakeSenseCount?: number // 匿名有心水数，整数类型，可选
  clientMakeNoSenseCount?: number // 匿名没心水数，整数类型，可选

  isMakeSense?: string // 是否心水，字符串类型，最大长度1位，可选
  isHot?: string // 是否热门，字符串类型，最大长度1位，可选
  isSelected?: string // 是否精选，字符串类型，最大长度1位，可选
  isTop?: string // 是否置顶，字符串类型，最大长度1位，可选
  isRecommended?: string // 是否推荐，字符串类型，最大长度1位，可选
  isBloom?: string // 是否爆款，字符串类型，最大长度1位，可选

  selectedUserId?: string // 所选择的用户ID，可为空
}

// 获取报纸列表
export function getNewspaperList(params: GetNewspaperIssueListParams) {
  return instance.post('/gameTypeNewspaperIssue/list', params)
}

// 通过Id获取详情
export function getNewspaperDetailById(id: string) {
  return instance.post(`gameTypeNewspaperIssue/getDetailById`, { issueId: id })
}
// 通过Index获取详情 图库期刊
export function getDetailByIndex(params: NewspaperIssue) {
  return instance.post(`gameTypeNewspaperIssue/getDetailByIndex`, params)
}

// 期刊评论列表
export function getNewspaperIssuePost(params: Comment) {
  return instance.post(`tk/newspaperIssuePost/listTree`, params)
}

// 报纸的最新一期的期刊列表
export function getNewspaperLatestIssues(
  page: number,
  size: number,
  gameType: number,
  isColorful?: 'y' | 'n',
  seriesCode?: string,
  sortName?: string
) {
  return instance.post(`gameTypeNewspaperIssue/newspaperLatestIssues`, {
    page,
    size,
    sortName,
    gameType,
    isColorful,
    seriesCode,
  })
}
/**
 * 根据查询条件获取系列名称和数量
 */
export function gameTypeNewspaperSeriesCount(data: any) {
  return instance.post('/gameTypeNewspaperIssue/selectSeriesCount', data)
}
