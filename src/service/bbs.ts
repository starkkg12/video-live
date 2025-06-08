import interceptorChain from "./interceptorChain";

const instance = interceptorChain()
  .clientIdRequest()
  .authRequest()
  .tokenRefreshResponse().instance;

interface PostInterface {
  page: number;
  size: number;
  sortName?: string;
  gameType?: number | string;
  voteType?: string;
  year?: number;
  forumId?: string;
  postId?: string;
  postUserId?: string;
  authorId?: string;
  bbsId?: string;
  title?: string;
  postContent?: string;
}
/**
 * 帖子列表 全部帖子
 */
export function getBBSForumPost(data: PostInterface) {
  return instance.post("/bbsForumPost/list", data);
}
/**
 * 高手论坛 图解小组
 */
export function getBBSDiagram(data: any) {
  // console.log(data)
  // if (!siteName) siteName = ''
  // focusGameType = Array.isArray(focusGameType) ? focusGameType : [focusGameType]
  return instance.post("/tk/newspaperIssuePost/graphicSolutionGroup", data);
}

/**
 * 高手论坛 全部帖子
 */
export function getDetailPost(data: any) {
  // console.log(data)
  // if (!siteName) siteName = ''
  // focusGameType = Array.isArray(focusGameType) ? focusGameType : [focusGameType]
  return instance.post("/bbsForumPost/detail", data);
}

/**
 * 高手论坛 一级评论
 */
export function getCommentPostList(data: any) {
  // console.log(data)
  // if (!siteName) siteName = ''
  // focusGameType = Array.isArray(focusGameType) ? focusGameType : [focusGameType]
  return instance.post("/bbsForumPost/getPrimaryComment ", data);
}

/**
 * 高手论坛 查看其他用户信息
 *
 */
export function getOtherUserInfo(user_id: string) {
  // console.log(data)
  // if (!siteName) siteName = ''
  // focusGameType = Array.isArray(focusGameType) ? focusGameType : [focusGameType]
  return instance.get("/user/profile/" + user_id);
}

/**
 * 用户主页 竞猜小组list
 */
export function getUserPredict(data: any) {
  return interceptorChain()
    .clientIdRequest()
    .authRequest()
    .tokenRefreshResponse("ask-back-login")
    .instance.post("/predict/searchMyPredictForGallery", data);
}

/**
 * 帖子 已读接口 已读加1
 *
 */
export function postReadCount(postId: string) {
  return instance.post("/bbsForumPost/read ", { postId });
}

/**
 * 新建帖子
 */
// /biz/bbsForumPost/create
export function createPost(
  // 论坛ID
  forumId: string,
  // 帖子标题
  title: string,
  // 帖子内容
  postContent: string,
  // 彩种
  postGametypeRef: string,
  // 可见标记;a,所有可见;u,用户可见;r,关注可见;f,好友可见;s,仅自己可见;
  viewFlag: "a" | "u" | "r" | "f" | "s",
  // 附件列表
  attachments?: {
    // url
    url: string;
    // 附件类型;p,图片;f,文件;a,APK;e,EXE;v,视频;s,声频;m,音乐;
    fileType: "p" | "f" | "a" | "e" | "v" | "s" | "m";
  }[],
  // 是否参赛
  predictFlag?: "y" | "n",
  // 系列ID
  seriesId?: string,
  // 年份
  postYear?: string,
  // 发布期数
  postIssue?: string
) {
  return interceptorChain()
    .clientIdRequest()
    .authRequest()
    .loginRedirect("ask-back-login")
    .tokenRefreshResponse("ask-back-login")
    .instance.post("/bbsForumPost/create", {
      forumId,
      title,
      postContent,
      postYear,
      postIssue,
      postGametypeRef,
      seriesId,
      viewFlag,
      attachments,
      predictFlag,
    });
}

/**
 * 获取帖子一级评论
 */
export function getPrimaryComment(postId: string, page: number, size: number) {
  return instance.post("/bbsForumPost/getPrimaryComment", {
    postId,
    page,
    size,
  });
}

/**
 * 获取帖子二级评论
 */
export function getReplyComment(postId: string, page: number, size: number) {
  return instance.post("/bbsForumPost/getReplyComment", { postId, page, size });
}
/**
 * 发布评论
 * @param postRef 主帖ID
 * @param threadPostId 被回复帖子或评论ID
 * @param hasAttachment 是否有附件 y, 有 n, 没有
 * @param forumId 论坛ID
 * @param postContent 帖子内容或预览
 * @param postUserId 发布用户ID
 * @param fromIp 来源IP
 * @param fromClientFlag 来源终端标记
 * @param attachments 附件列表
 * @param predictFlag 是否参赛贴
 */

export function replyPost(
  postRef: string,
  threadPostId: string,
  hasAttachment: "y" | "n",
  postContent?: string,
  attachments?: {
    url: string;
    fileType: "p" | "f" | "a" | "e" | "v" | "s" | "m";
  }[],
  fromIp?: string,
  postUserId?: string,
  fromClientFlag?: string,
  forumId?: string,
  predictFlag?: "y" | "n"
) {
  return interceptorChain()
    .clientIdRequest()
    .authRequest()
    .loginRedirect("ask-cancel-login")
    .tokenRefreshResponse("ask-cancel-login")
    .instance.post("/bbsForumPost/replyPost", {
      forumId,
      postRef,
      postContent,
      postUserId,
      threadPostId,
      fromIp,
      fromClientFlag,
      hasAttachment,
      attachments,
      predictFlag,
    });
}
