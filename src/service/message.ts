import interceptorChain from './interceptorChain'

const instance = interceptorChain().clientIdRequest().authRequest().tokenRefreshResponse().instance

// 获取用户消息列表
// /biz/message/list
export function getUserMessageList(
  // 页码
  page: number,
  // 每页显示条数
  size: number,
  // 消息类型（可选，一级页面不传，二级页面必传）
  type?: string,
  // 排序字段
  sortName?: string,
  // 用户 ID
  userId?: number,
  // 消息标题关键字（可选）
  title?: string
) {
  return instance.post('/message/list', {
    page,
    size,
    sortName,
    userId,
    type,
    title,
  })
}

// 获取消息详情
// /biz/message/getDetailById
export function getMessageDetailById(
  // 消息类型
  type: string,
  // 消息ID列表，空数组表示全部
  ids: number[],
  // 用户ID
  userId: number
) {
  return instance.post('/message/getDetailById', {
    type,
    ids,
    userId,
  })
}

// 标记消息为已读
// /biz/message/markAsRead
export function markMessageAsReaded(
  // 消息数组ID，允许批量标记多个消息为已读
  ids?: number[],
  // 用户id
  userId?: number,
  // 消息类型
  type?: string,
  // 已读时间
  readTime?: string
) {
  return instance.post('/message/markAsRead', {
    ids,
    userId,
    type,
    readTime,
  })
}

// 判断用户是否有未读消息
// /biz/message/hasUnreadMessages
export function hasUnreadMessages(
  // 用户ID
  userId: number,
  // 消息类型
  type?: string
) {
  return instance.post('/message/hasUnreadMessages', {
    userId,
    type,
  })
}

// 获取活动消息
// /biz/message/list/activity
export function getActivityMessageList(
  // 页码
  page: number,
  // 每页显示条数
  size: number,
  // 排序字段
  sortName?: string,
  // 用户ID
  userId?: number,
  // 消息类型
  type?: string,
  // 消息标题关键字
  title?: string
) {
  return instance.post('/message/list/activity', {
    page,
    size,
    sortName,
    userId,
    type,
    title,
  })
}

// 获取收藏和点赞消息
// /biz/message/list/favoritesAndLikes
export function getMessageFavoritesAndLikesList(
  // 页码
  page: number,
  // 每页显示条数
  size: number,
  // 排序字段
  sortName?: string,
  // 用户ID
  userId?: number,
  // 消息类型
  type?: string,
  // 消息标题关键字
  title?: string
) {
  return instance.post('/message/list/favoritesAndLikes', {
    page,
    size,
    sortName,
    userId,
    type,
    title,
  })
}

// 获取关注消息
// /biz/message/list/followers
export function getMessageFollowersList(
  // 页码
  page: number,
  // 每页显示条数
  size: number,
  // 排序字段
  sortName?: string,
  // 用户ID
  userId?: number,
  // 消息类型
  type?: string,
  // 消息标题关键字
  title?: string
) {
  return instance.post('/message/list/followers', {
    page,
    size,
    sortName,
    userId,
    type,
    title,
  })
}

// 获取评论和@消息
// /biz/message/list/commentsAndMentions
export function getMessageCommentsAndMentionsList(
  // 页码
  page: number,
  // 每页显示条数
  size: number,
  // 排序字段
  sortName?: string,
  // 用户ID
  userId?: number,
  // 消息类型
  type?: string,
  // 消息标题关键字
  title?: string
) {
  return instance.post('/message/list/commentsAndMentions', {
    page,
    size,
    sortName,
    userId,
    type,
    title,
  })
}
