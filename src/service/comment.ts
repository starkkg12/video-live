import interceptorChain from './interceptorChain'

const instance = interceptorChain().clientIdRequest().authRequest().tokenRefreshResponse().instance

//展开帖子一级评论
export function getPrimaryComment(data: PrimaryComment) {
  // console.log('ressssss')

  return instance.post('/bbsForumPost/getPrimaryComment', data)
}
//展开帖子二级评论
export function getReplyComment(data: PrimaryComment) {
  return instance.post('/bbsForumPost/getReplyComment', data)
}

//评论（回复）
export function postBBSForumPost(data: ForumPost) {
  return interceptorChain()
    .clientIdRequest()
    .authRequest()
    .loginRedirect()
    .tokenRefreshResponse()
    .instance.post('/bbsForumPost/replyPost ', data)
}

//点赞 暂时弃用
// export function addLike(data: AddLike) {
//   return instance.post('/bbsForumPost/like', data)
// }
//点赞
// export function addLike(data: AddLike) {
//   return instance.post('/like/toggle', data)
// }

export function toggleLike(data: IToggleLike) {
  return instance.post('/like/toggle', data)
}

//收藏功能
export function addFavorite(data: FavoriteInfo) {
  return instance.post('/favorite/toggle', data)
}

export interface FavoriteInfo {
  targetRef?: string // 对象REF, 根据不同类型指代不同属性, 最大长度: 64
  // u: 图库评论 -> 图库或期刊ID, c: 帖子评论 -> 帖子ID
  // t: 图库或期刊 -> 游戏类型(gameType), s: 系列 -> 游戏类型(gameType)
  // p: 帖子 -> 论坛ID
  targetId: string // 对象ID, 最大长度: 64
  favoriteFlag: 'b' | 'f' | 'm' | 'p' | 't' | 'c' | 'u' | 's'
  // 收藏类型
  // b: bbs, f: 论坛, m: 主板, p: 帖子
  // t: 图库或期刊, c: 论坛评论, u: 图库评论, s: 系列
  ipInfo: string // IP信息, base64格式的JSON字符串, 最大长度: 512
}

export interface ForumPost {
  forumId?: string // 论坛ID
  postRef: string // 主贴ID
  postContent?: string // 帖子内容或预览
  postUserId?: string // 发布用户ID
  threadPostId?: number // 被回复帖子ID, 默认值: 0
  fromIp?: string // 来源IP
  fromClientFlag?: string // 来源终端标记
  hasAttachment: 'y' | 'n' // 是否有附件; y: 有, n: 没有

  attachments?: Attachment[] // 附件列表

  predictFlag?: string // 是否参赛贴
}

interface Attachment {
  url?: string // 附件的 URL
  fileType?: 'p' | 'f' | 'a' | 'e' | 'v' | 's' | 'm'
  // 附件类型; p: 图片, f: 文件, a: APK, e: EXE, v: 视频, s: 声频, m: 音乐
}

interface PrimaryComment {
  page: number
  size: number
  postId?: string
  sortName?: string
  commentId?: string
  commentUserId?: string
  authorId?: string
}

interface AddLike {
  targetRef: string // 对象REF。针对不同类型，指代的属性值不同
  // u：图库评论 -> 图库｜期刊ID
  // c：帖子评论 -> 帖子ID
  // t：图库｜期刊 -> 游戏类型（gameType）
  // s：系列 -> 游戏类型（gameType）
  // p：帖子 -> 论坛ID
  // 最大长度: 64
  targetId: string // 对象ID，最大长度: 64
  likeFlag: 'b' | 'f' | 'm' | 'p' | 't' | 'c' | 'u' | 's' // 点赞类型
  // b：bbs
  // f：论坛
  // m：主板
  // p：帖子
  // t：图库｜期刊
  // c：论坛评论
  // u：图库评论
  // s：系列
  likeType: 'l' | 'h' // 点赞还是倒赞
  // l：点赞
  // h：倒赞
  ipInfo: string // base64形式的json字符串，最大长度: 512
}

export interface IToggleLike {
  /**
   * 对象REF。针对不同类型，指代的属性值不同
   */
  targetRef: string
  /**
   * 对象ID。针对不同类型，指代的属性值不同
   */
  targetId: string
  /**
   * 点赞类型
   * b：bbs
   * f：论坛
   * m：主板
   * p：帖子
   * t：图库｜期刊
   * c：论坛评论
   * u：图库评论
   * s：系列
   * 默认: p ? 不确定
   */
  likeFlag: 'b' | 'f' | 'm' | 'p' | 't' | 'c' | 'u' | 's'
  /**
   * 点赞还是倒赞
   * l：点赞
   * h：倒赞
   * 默认: l ? 不确定
   */
  likeType: 'l' | 'h'
  /**
   *base64形式的json字符串 Validate[max: 512; ]
   * object json
   */
  ipInfo: string
}
