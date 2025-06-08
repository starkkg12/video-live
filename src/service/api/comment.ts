import { uploadInstance } from '../utils/instance'

/**
 * 获取视频评论
 *
 * @param videoId 视频ID
 * @param page 页码（默认: 1）
 * @param pageSize 每页数量（默认: 10，最大: 100）
 * @param sortBy 排序方式（可选值: ⁠ latest`最新, `hottest`最热，默认: `latest ⁠）
 */
// response:
// {
//   "success": true,
//   "code": "OK",
//   "message": "成功",
//   "data": {
//       "data": [
//           {
//               "id": 677,
//               "content": "ffff",
//               "userId": "1304387369566208819",
//               "createdAt": "2025-04-17T05:21:11.585Z",
//               "updatedAt": "2025-04-17T05:21:11.585Z",
//               "replyCount": 0,
//               "likeCount": 0,
//               "isLiked": false,
//               "metadata": {
//                   "content": "ffff",
//                   "images": []
//               }
//           }
//       ],
//       "pagination": {
//           "page": 1,
//           "pageSize": 10,
//           "total": 1,
//           "totalPages": 1
//       }
//   }
// }
export function getPrimaryComments(
  videoId: string,
  page: number = 1,
  pageSize: number = 10,
  sortBy: string = 'latest'
) {
  return uploadInstance.get(`/api/comments/videos/${videoId}`, {
    params: { page, pageSize, sortBy },
  })
}

/**
 * 获取特定评论的回复（二级评论）列表。
 *
 * @param commentId 评论ID
 * @param page 页码（默认: 1）
 * @param pageSize 每页数量（默认: 10，最大: 100）
 * @param sortBy 排序方式（可选值: ⁠ latest`最新, `hottest`最热，默认: `latest ⁠）
 */
// response:
// {
//   "success": true,
//   "code": "OK",
//   "message": "成功",
//   "data": {
//     "data": [
//       {
//         "id": 456,
//         "parentId": 123,
//         "content": "完全同意你的看法！",
//         "userId": "user_def456",
//         "createdAt": "2025-04-14T09:15:00Z",
//         "updatedAt": "2025-04-14T09:15:00Z",
//         "likeCount": 8,
//         "isLiked": false,
//         "metadata": {
//           "content": "完全同意你的看法！",
//           "additional": "任何其他元数据"
//         }
//       }
//     ],
//     "pagination": {
//       "page": 1,
//       "pageSize": 10,
//       "total": 5,
//       "totalPages": 1
//     }
//   }
// }

export function getCommentReplies(
  commentId: string,
  page: number = 1,
  pageSize: number = 10,
  sortBy: string = 'latest'
) {
  return uploadInstance.get(`/api/comments/${commentId}/replies`, {
    params: { page, pageSize, sortBy },
  })
}
