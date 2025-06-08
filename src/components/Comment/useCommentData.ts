import usePostCommentData from './usePostCommentData'
import useIssueCommentData from './useIssueCommentData'
type CommentType = 'post' | 'issue'
function useCommentData(type: CommentType, id: string, size: number = 5, threadPostId?: string, postType?: string) {
  if (type === 'post') {
    return usePostCommentData(id.toString(), size)
  }
  return useIssueCommentData(id.toString(), size, threadPostId, postType)
}

export default useCommentData
