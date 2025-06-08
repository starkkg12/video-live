import useVideoCommentData from '@/components/Comment/useVideoCommentData'

type VideoCommentDataMap = Record<string, ReturnType<typeof useVideoCommentData>>

const commentDataMap: VideoCommentDataMap = {}
const refCountMap: Record<string, number> = {}

export function useVideoCommentStore() {
  function getOrCreateVideoCommentData(id: string) {
    if (!id) throw new Error('videoCommentData ID 不可為空')

    if (!commentDataMap[id]) {
      commentDataMap[id] = useVideoCommentData(id)
    }

    refCountMap[id] = (refCountMap[id] || 0) + 1
    return commentDataMap[id]
  }

  function release(id: string) {
    if (refCountMap[id]) {
      refCountMap[id]--
      if (refCountMap[id] <= 0) {
        delete commentDataMap[id]
        delete refCountMap[id]
      }
    }
  }

  return {
    getOrCreateVideoCommentData,
    release,
  }
}
