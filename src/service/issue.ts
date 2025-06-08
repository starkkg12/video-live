import interceptorChain from './interceptorChain'

const instance = interceptorChain().clientIdRequest().authRequest().tokenRefreshResponse().instance

export function getPrimaryComment(
  issueId: string,
  page: number,
  size: number,
  threadPostId?: string,
  postType?: string
) {
  const params: {
    issueId?: string
    page: number
    size: number
    postType?: string
    imageExplainId?: string
  } = {
    issueId,
    page,
    size,
  }
  if (postType === 'c') {
    params.postType = 'a'
    params.imageExplainId = threadPostId
    delete params.issueId
  }

  return instance.post('/tk/newspaperIssuePost/listTree', params)
}

export function getReplyComment(issueId: string, postId: string, page: number, size: number, postType?: string) {
  const params: {
    issueId?: string
    postId: string
    page: number
    size: number
    postType?: string
    imageExplainId?: string
  } = {
    issueId,
    postId,
    page,
    size,
  }
  if (postType === 'c') {
    params.imageExplainId = issueId
    params.postType = 'a'
    delete params.issueId
  }
  return instance.post('/tk/newspaperIssuePost/listTree', params)
}

/**
 *
 * @param issueId
 * @param postContent
 * @param attachments
 * @param threadPostId
 */
export function replyPost(
  issueId: string,
  postContent: string,
  attachments?: { url: string; fileType: 'p' | 'f' | 'a' | 'e' | 'v' | 's' | 'm' }[],
  threadPostId?: string,
  postType?: string
) {
  const params: {
    issueId?: string
    postContent: string
    attachments?: { url: string; fileType: 'p' | 'f' | 'a' | 'e' | 'v' | 's' | 'm' }[]
    threadPostId?: string
    postType?: string
  } = {
    issueId,
    postContent,
    ...(attachments && { attachments }),
    ...(threadPostId && { threadPostId }),
    ...(postType && { postType }),
  }
  return interceptorChain()
    .clientIdRequest()
    .authRequest()
    .loginRedirect()
    .tokenRefreshResponse()
    .instance.post('/tk/newspaperIssuePost/replyPost', params)
}

export function getIssueCommentDetail(postId: string) {
  return instance.post('/tk/newspaperIssuePost/detailByPostId ', { postId })
}
