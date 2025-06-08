export type Numeric = number | string

export interface CommentTypeBase {
  type: 'CommentTypeBase' | 'CommentType'
  id: string
  // ! 评论者 id
  userId: string
  // ! 被回复者 id
  replyUserId?: string
  // ! 几楼
  indexNumber?: number
  // ! 评论者头像
  picture?: string
  // ! 评论者昵称
  nickname?: string
  // ! 评论者昵称颜色
  nameColor?: string
  // ! 评论内容
  content?: string
  // ! 评论时间
  time?: Numeric
  // ! 评论点赞数
  like?: number
  // ! 评论图片列表
  images?: string[]
  // ! 回复的对象的昵称
  replyName?: string
  // ! 当前用户是否已经喜欢过
  isLiked?: boolean
  // ! 当前用户是否已经不喜欢过
  isDisliked?: boolean
}

export interface CommentType extends CommentTypeBase {
  subComments: CommentTypeBase[]
  // ! 子评论总数
  total: number
  // ! 是否正在加载子评论
  isLoading: boolean
}
