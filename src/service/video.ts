import interceptorChain from './interceptorChain'

const instance = interceptorChain().clientIdRequest().authRequest().tokenRefreshResponse().instance

// 视频发布
interface VideoDetails {
  videoPath: string // 视频地址，文件服务器返回的相对路径，必填
  poster: string // 视频封面地址，文件服务器返回的相对路径，必填
  previewUrl?: string // 预览地址，非必填
  title: string // 视频标题，必填
  description?: string // 视频描述，非必填
  videoSize: number // 视频大小（B），必填
  videoTime: number // 视频时长（S），必填
  tagIds: number[] // 视频标签，必填
  ipInfo?: string // ip 信息，非必填
  commentFlag: 0 | 1 // 是否开启评论 0 关闭 1 开启
  barrageFlag: 0 | 1 // 是否开启弹幕 0 关闭 1 开启
  listenFlag: 0 | 1 // 听视频开关 0 关闭 1 开启
  resolution?: string // 视频分辨率，非必填
  bitrate?: string // 视频码率，非必填
  encoding?: string // 视频编码格式，H264、HEVC等，非必填
  language?: string // 视频语言，非必填
}
export function videoPub(params: VideoDetails) {
  return instance.post(`/biz-client/video/pub`, params)
}

// 视频详情
export function videoDetail(videoId: string) {
  return instance.get(`/biz-client/video/${videoId}`)
}

// 视频编辑
interface VideoInfo {
  videoId: string // 视频ID，必须
  title?: string // 视频主题(模糊)，非必填
  description?: string // 视频描述，非必填
  state: 0 | 1 // 视频上架状态 0 未上架 1 已上架
  delFlag: 0 | 1 // 删除状态 0 未删 1 已删除
  language: string // 语言，例如 "CN"
  commentFlag: 0 | 1 // 评论开关 0 关闭 1 开启
  barrageFlag: 0 | 1 // 弹幕开关 0 关闭 1 开启
  listenFlag: 0 | 1 // 听视频开关 0 关闭 1 开启
  publicFlag: 0 | 1 // 公共视频库开关 0 关闭 1 开启
  tags?: string[] // 视频标签，非必填
  videoPath?: string // 视频地址，非必填
  poster?: string // 视频封面，非必填
  previewUrl?: string // 预览地址，非必填
  videoTime?: number // 视频时长，非必填
  videoSize?: number // 视频大小，非必填
  bitrate?: string // 码率，非必填
  encoding?: string // 编码格式，非必填
  resolution?: string // 分辨率，非必填
}
export function videoUpdate(params: VideoInfo) {
  return instance.post(`/biz-client/video/update`, params)
}

// 我的视频列表查询
interface VideoSearchParams {
  page: number // 当前页码，必须
  size: number // 每页显示条数，必须
  videoId?: string // 视频ID，非必填
  title?: string // 视频主题(模糊搜索)，非必填
  auditState?: 0 | 1 | 2 // 审核状态 0 未审核 1 通过 2 未通过，非必填
  auditPersonIds?: string[] // 审核人ID列表，非必填
  state?: 0 | 1 // 视频上架状态 0 未上架 1 已上架，非必填
  beginCreateTime?: number | null // 发布时间（开始时间戳），非必填
  endCreateTime?: number | null // 发布时间（结束时间戳），非必填
  beginAuditTime?: number | null // 审核时间（开始时间戳），非必填
  endAuditTime?: number | null // 审核时间（结束时间戳），非必填
  sortColumn?: 'create_time' | 'audit_time' // 排序字段，非必填，默认 create_time
  sortType?: 'ASC' | 'DESC' // 排序类型，非必填，默认 DESC
}
export function videoList(params: VideoSearchParams) {
  return instance.post(`/biz-client/video/myList`, params)
}

// 视频推荐
export function videoRecommend(scrollerId: string) {
  return instance.get(`/biz-client/video/recommend?scrollerId=${scrollerId}`)
}

// 所有视频查询（关键字、tag）
interface ScrollerParams {
  scrollerId: number // 上次最后一条数据的滚动ID，第一次传0
  tagIds?: number[] // 标签ID，非必填
  keyword?: string // 关键字，非必填
}
export function videoSearch(params: ScrollerParams) {
  return instance.post(`/biz-client/video/find`, params)
}

// 视频已读
interface VideoQuery {
  videoId: string
}
export function videoViewed(params: VideoQuery) {
  return instance.post(`/biz-client/video/read`, params)
}

// 标签列表
interface TagSearchParams {
  page: number // 当前页码，必须
  size: number // 每页显示条数，必须
  tagName?: string // 名称（模糊搜索），非必填
}
export function tagsList(params: TagSearchParams) {
  return instance.post(`/biz-client/video/tag/list`, params)
}

// 获取视频点赞，收藏，评论数量
export function videoActions(params: VideoQuery) {
  return instance.post(`/biz-client/video/getLikeAndCollectAndCommentCount`, params)
}

// 视频点赞
interface VideoActionParams {
  videoId: string
  flag: 0 | 1 //0 取消 1 点赞/收藏
}
export function videoLike(params: VideoActionParams) {
  return instance.post(`/biz-client/video/like`, params)
}

// 视频收藏
export function videoFavorite(params: VideoActionParams) {
  return instance.post(`/biz-client/video/collect`, params)
}

// 评论视频
interface CommentAttachment {
  url: string // 附件URL
  fileType: 'p' | 'f' | 'a' | 'e' | 'v' | 's' | 'm' // 文件类型: 图片、文件、APK、EXE、视频、声频、音乐
}

interface PostCommentParams {
  videoId: string // 视频ID，必须
  postContent: string // 评论内容，必须
  threadPostId?: string // 上级评论ID，回复时必须传
  ipInfo?: string // IP信息，非必填
  attachments?: CommentAttachment[] // 附件列表，非必填
}
export function videoCommentCreate(params: PostCommentParams) {
  return instance.post(`/biz-client/video/comment/create`, params)
}

// 视频评论列表
interface CommentFetchParams {
  videoId: string // 视频ID，必须
  page: number // 页码，必须
  size: number // 每页条数，必须
}
export function videoCommentList(params: CommentFetchParams) {
  return instance.post(`/biz-client/video/comment/list`, params)
}

// 视频评论二级列表
interface ReplyFetchParams {
  videoId: string // 视频ID，必须
  replyId: string // 评论ID，必须
  page: number // 页码，必须
  size: number // 每页条数，必须
}
export function videoCommentSubList(params: ReplyFetchParams) {
  return instance.post(`/biz-client/video/comment/subList`, params)
}

// 我的点赞列表
interface LikeListQueryParams {
  page: number // 页码，必须
  size: number // 每页条数，必须
}
export function videoLikeMyList(params: LikeListQueryParams) {
  return instance.post(`/biz-client/video/myLikeList`, params)
}

// 我的收藏列表
interface FavoriteListQueryParams {
  page: number // 页码，必须
  size: number // 每页条数，必须
}
export function videoFavoriteMyList(params: FavoriteListQueryParams) {
  return instance.post(`/biz-client/video/myCollectList`, params)
}
