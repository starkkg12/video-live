import { videoApiInstance, uploadInstance } from '../utils/instance'

/**
 * 获取个性化推荐视频
 *
 * @param params 参数对象
 * @returns Promise 包含推荐视频列表
 */
export function getFeedList() {
  return uploadInstance.get(`/api/feed/feed`)
}

/**
 * 获取关注视频
 *
 * @param params 参数对象
 * @returns Promise 包含关注视频列表
 */
export function getFollowingFeed() {
  return uploadInstance.get(`/api/feed/following-feed`)
}

export enum FeedAction {
  /**
   * 浏览
   */
  View = 'view',
  /**
   * 点赞
   */
  Like = 'like',
  /**
   * 取消点赞
   */
  Unlike = 'unlike',
  /**
   * 收藏
   */
  Favorite = 'favorite',
  /**
   * 取消收藏
   */
  Unfavorite = 'unfavorite',
  /**
   * 评论
   */
  Comment = 'comment',
  /**
   * 删除评论
   */
  DeleteComment = 'deleteComment',
  /**
   * 回复评论
   */
  ReplyComment = 'replyComment',
  /**
   * 删除回复
   */
  DeleteReply = 'deleteReply',
  /**
   * 分享
   */
  Share = 'share',
  /**
   * 完整观看
   */
  FullWatch = 'fullWatch',
  /**
   * 点踩
   * @deprecated 本期接口还没有实现点踩功能，注意不要用错
   */
  Dislike = 'dislike',
  /**
   * 取消点踩
   * @deprecated 本期接口还没有实现点踩功能，注意不要用错
   */
  Undislike = 'undislike',
  /**
   * 关注
   */
  Follow = 'follow',
  /**
   * 取消关注
   */
  Unfollow = 'unfollow',
  /**
   * 重新观看
   */
  Rewatch = 'rewatch',
  /**
   * 快速跳过
   */
  Skip = 'skip',
  /**
   * 举报
   */
  Report = 'report',
  /**
   * 标记不感兴趣
   */
  NotInterested = 'notInterested',
  /**
   * 取消不感兴趣
   */
  UndoNotInterested = 'undoNotInterested',
  /**
   * 点击创作者主页
   */
  ClickProfile = 'clickProfile',
  /**
   * 下载视频
   */
  Download = 'download',
}

export interface FeedInteraction {
  action: FeedAction
  objectType?: string
  objectId?: string
  metadata?: Record<string, any>
  clientType?: number
}

/**
 * 记录用户交互
 *
 * @param id 视频ID
 * @param data 交互数据
 * @returns Promise 包含交互结果
 */
export function setFeedInteraction(id: string | number, data: FeedInteraction) {
  return uploadInstance.post(`/api/actions/${id}`, data)
}
