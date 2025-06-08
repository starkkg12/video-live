import service from '@/service'
import { onMounted, ref, type Ref } from 'vue'
import { getPrimaryComments, getCommentReplies } from '@/service/api/comment'
import utils from '@/utils'

function useVideoCommentData(videoId: string, commentId?: string) {
  const comments = ref<any[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)
  const currentPage = ref(0)
  const pageSize = ref(10)
  const totalPages = ref(1)
  const total = ref(0)

  const fetchComments = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await getPrimaryComments(
        videoId,
        currentPage.value + 1,
        pageSize.value,
        'latest'
      )
      const { data, pagination } = response.data.data
      comments.value = [...comments.value, ...data]
      currentPage.value = pagination.page
      totalPages.value = pagination.totalPages
      total.value = pagination.total
    } catch (err: any) {
      error.value = err.message || '获取评论失败'
      console.error('获取评论失败', err)
    } finally {
      loading.value = false
    }
  }

  const fetchReplies = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await getCommentReplies(
        commentId || '',
        currentPage.value + 1,
        pageSize.value,
        'latest'
      )
      const { data, pagination } = response.data.data
      comments.value = [...comments.value, ...data]
      currentPage.value = pagination.page
      total.value = pagination.total
    } catch (err: any) {
      error.value = err.message || '获取评论失败'
      console.error('获取评论失败', err)
    } finally {
      loading.value = false
    }
  }

  const insertComment = (comment: any) => {
    comments.value.unshift(comment)
    total.value++
  }

  return {
    comments,
    loading,
    error,
    currentPage,
    pageSize,
    totalPages,
    total,
    insertComment,
    fetchComments,
    fetchReplies,
  }
}

export default useVideoCommentData
