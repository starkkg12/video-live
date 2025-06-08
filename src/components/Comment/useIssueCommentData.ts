import service from '@/service'
import { onMounted, ref, type Ref } from 'vue'
import type { CommentType } from './types'
import { showFailToast, type UploaderFileListItem } from 'vant'
import utils from '@/utils'

function useIssueCommentData(issueId: string, size: number, threadPostId?: string, postType?: string) {
  const commentList = ref<CommentType[]>([])
  const totalCommentCount = ref(0)
  const isLoading = ref(false)

  function transformCommentData(data: any, index: number, isChild: boolean): CommentType {
    return {
      type: isChild ? 'CommentTypeBase' : 'CommentType',
      id: data.postId,
      userId: data.postUserId,
      replyUserId: data.postThreadSeq === 2 ? data.toUserId : undefined,
      indexNumber: index,
      picture: utils.getImageUrl(data.avatar, 'avatar'),
      nickname: data.nickname,
      nameColor: data.vipLevel ? '#C3272B	' : '#000000',
      content: data.postContent,
      time: data.postTime,
      like: data.likeCount ?? 0,
      images: data.attachments.map((item: { url: string }) => utils.getImageUrl(item.url)),
      replyName: data.postThreadSeq === 2 ? data.toNickName : undefined,
      total: data.postThreadSeq === (postType === 'c' ? 1 : 0) ? data.childrenSize : 0,
      subComments: [],
      isLiked: data.likeStatus === 'y',
      isDisliked: data.dislikeStatus === 'y',
      isLoading: false,
    }
  }

  async function loadPrimaryComment() {
    try {
      isLoading.value = true
      const page = Math.floor(commentList.value.length / size) + 1
      const response = await service.issue.getPrimaryComment(issueId, page, size, threadPostId, postType)

      if (!response.data.success) {
        console.error(response.data.errMessage)
        return
      }
      totalCommentCount.value = response.data.data.childrenSize
      response.data.data.replies &&
        commentList.value.push(
          ...response.data.data.replies?.map((item: any, index: number) => {
            return transformCommentData(item, commentList.value.length + index + 1, false)
          })
        )
    } catch (error) {
      showFailToast('加载评论失败')
      console.log(error)
    } finally {
      isLoading.value = false
    }
  }

  async function loadReplyComment(postId: string) {
    const comment = commentList.value.find(item => item.id === postId)
    if (!comment) {
      return
    }
    try {
      comment.isLoading = true
      const page = Math.floor(comment.subComments.length / size) + 1
      const response = await service.issue.getReplyComment(
        postType === 'c' ? threadPostId! : issueId,
        postId,
        page,
        size,
        postType
      )
      if (!response.data.success) {
        showFailToast(response.data.errMessage)
        console.error(response.data.errMessage)
        return
      }
      response.data.data.replies &&
        comment.subComments.push(
          ...response.data.data.replies?.map((item: any, index: number) =>
            transformCommentData(item, comment.subComments.length + index + 1, true)
          )
        )
    } catch (error) {
      showFailToast('加载回复失败')
      console.error(error)
    } finally {
      comment.isLoading = false
    }
  }

  async function like(id: string) {
    try {
      const parentComment = commentList.value.find(
        item => item.subComments && item.subComments.some(subItem => subItem.id === id)
      )
      const comment = parentComment
        ? parentComment.subComments.find(subItem => subItem.id === id)
        : commentList.value.find(item => item.id === id)

      if (!comment) {
        showFailToast('点赞失败')
        return
      }
      const ipInfo = await utils.getIpData()
      const likeType = 'l'
      const likeFlag = 'u'
      const targetRef = issueId
      const targetId = id
      isLoading.value = true
      const response = await service.user.toggleLikeHate(targetRef, targetId, likeFlag, likeType, ipInfo)
      if (!response.data.success) {
        showFailToast(response.data.errMessage)
        return
      }
      if (comment.isLiked) {
        comment.like !== undefined && comment.like--
        comment.isLiked = false
      } else {
        comment.like !== undefined && comment.like++
        comment.isLiked = true
      }
      if (comment.isDisliked) {
        comment.isDisliked = false
      }
    } catch (error) {
      showFailToast('点赞失败')
      console.error(error)
    } finally {
      isLoading.value = false
    }
  }

  async function dislike(id: string) {
    try {
      const parentComment = commentList.value.find(
        item => item.subComments && item.subComments.some(subItem => subItem.id === id)
      )
      const comment = parentComment
        ? parentComment.subComments.find(subItem => subItem.id === id)
        : commentList.value.find(item => item.id === id)
      if (!comment) {
        showFailToast('点踩失败')
        return
      }
      const ipInfo = await utils.getIpData()
      const likeType = 'h'
      const likeFlag = 'u'
      const targetRef = issueId
      const targetId = id
      isLoading.value = true
      const response = await service.user.toggleLikeHate(targetRef, targetId, likeFlag, likeType, ipInfo)
      if (!response.data.success) {
        showFailToast(response.data.errMessage)
        return
      }
      if (comment.isDisliked) {
        comment.isDisliked = false
      } else {
        comment.isDisliked = true
      }
      if (comment.isLiked) {
        comment.like !== undefined && comment.like--
        comment.isLiked = false
      }
    } catch (error) {
      showFailToast('点踩失败')
      console.error(error)
    } finally {
      isLoading.value = false
    }
  }

  async function reply(
    refId: string,
    replyId: string | undefined,
    attachments: UploaderFileListItem[],
    content: string,
    loading: Ref<boolean>
  ): Promise<boolean> {
    loading.value = true
    console.group('reply')
    console.log('refId: ', refId)
    console.log('replyId: ', replyId)
    console.log('attachments: ', attachments)
    console.log('content: ', content)
    console.groupEnd()

    const attachmentUrls: { url: string; fileType: 'p' | 'f' | 'a' | 'e' | 'v' | 's' | 'm' }[] = []

    try {
      loading.value = true
      for (const attachment of attachments) {
        if (attachment.file) {
          const res = await service.upload.uploadSingle({
            storageStyle: 6,
            fileType: 'img',
            uploadFrom: service.upload.UploadFrom.BBS_FORUM_ATTACHMENT,
            uploadTarget: attachment.file.name,
            storageType: service.upload.StorageType.S3,
            env: service.upload.Env.DEV,
            file: attachment.file,
          })
          if (!res.data.success) {
            showFailToast(res.data.errMessage)
            console.error(res.data.errMessage)
            return false
          }
          attachmentUrls.push({
            url: res.data.data.path,
            fileType: 'p',
          })
        }
      }
      const response = await service.issue.replyPost(refId, content, attachmentUrls, replyId || threadPostId, postType)

      if (!response.data.success) {
        showFailToast(response.data.errMessage)
        return false
      }
      for (const primaryComment of commentList.value) {
        if (primaryComment.id === replyId) {
          primaryComment.total++
          primaryComment.subComments.forEach(comment => {
            if (comment.indexNumber !== undefined) comment.indexNumber++
          })
          primaryComment.subComments.unshift(
            transformCommentData(response.data.data, primaryComment.subComments.length + 1, false)
          )
          return true
        }
        for (const replyComment of primaryComment.subComments) {
          if (replyComment.id === replyId) {
            primaryComment.total++
            primaryComment.subComments.forEach(comment => {
              if (comment.indexNumber !== undefined) comment.indexNumber++
            })
            primaryComment.subComments.unshift(transformCommentData(response.data.data, 1, false))
            return true
          }
        }
      }

      commentList.value.forEach(comment => comment.indexNumber !== undefined && comment.indexNumber++)
      commentList.value.unshift(transformCommentData(response.data.data, 1, true))
      totalCommentCount.value++

      return true
    } catch (error) {
      console.error(error)
      showFailToast('回复失败')
      return false
    } finally {
      loading.value = false
    }
  }

  onMounted(loadPrimaryComment)

  return {
    commentList,
    totalCommentCount,
    isLoading,
    loadPrimaryComment,
    loadReplyComment,
    like,
    dislike,
    reply,
  }
}

export default useIssueCommentData
