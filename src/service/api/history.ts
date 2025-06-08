import type { ApiResponse, PaginatedData, PaginationParams } from '../types/common'
import { videoApiInstance } from '../utils/instance'

/**
 * 观看历史记录项
 */
export interface WatchHistoryItem {
  id: number
  title: string
  description: string
  videoPath: string
  poster: string
  preview: string
  duration: number
  userId: string
  viewedAt: string
  tags: any[]
}

/**
 * 用户观看历史响应类型
 */
export type GetUserWatchHistoryResponse = ApiResponse<PaginatedData<WatchHistoryItem>>

/**
 * 获取用户观看历史
 *
 * @param params 查询参数，包含页码和每页数量
 * @returns Promise 包含用户观看历史的分页数据
 */
export function getUserWatchHistory(
  params: PaginationParams = { page: 1, pageSize: 10 }
): Promise<GetUserWatchHistoryResponse> {
  return videoApiInstance
    .get<GetUserWatchHistoryResponse>('/api/feed/history', { params })
    .then(response => response.data)
}

/**
 * 获取用户观看历史新接口
 *
 * @param params 查询参数，包含页码和每页数量
 * @returns Promise 包含用户观看历史的分页数据
 */
export function getUserWatchHistoryNew(
  params: PaginationParams = { page: 1, pageSize: 10 }
): Promise<GetUserWatchHistoryResponse> {
  return videoApiInstance
    .get<GetUserWatchHistoryResponse>('/api/history/views', { params })
    .then(response => response.data)
}

/**
 * 清空视频观看历史
 *
 * @returns Promise 包含清空结果
 */
export function clearUserWatchHistory(): Promise<ApiResponse<any>> {
  return videoApiInstance
    .post<ApiResponse<any>>('/api/history/views/clear')
    .then(response => response.data)
}

/**
 * 用户访问历史记录项
 */
export interface UserVisitHistoryItem {
  id: string
  visitedAt: string
  isFollowing: boolean
  followerCount: number
  followingCount: number
}

/**
 * 用户访问历史响应类型
 */
export type GetUserVisitHistoryResponse = ApiResponse<PaginatedData<UserVisitHistoryItem>>

/**
 * 获取用户访问历史
 *
 * @param params 查询参数，包含页码和每页数量
 * @returns Promise 包含用户访问历史的分页数据
 */
export function getUserVisitHistory(
  params: PaginationParams = { page: 1, pageSize: 10 }
): Promise<GetUserVisitHistoryResponse> {
  return videoApiInstance
    .get<GetUserVisitHistoryResponse>('/api/history/users', { params })
    .then(response => response.data)
}

/**
 * 清空用户访问历史
 *
 * @returns Promise 包含清空结果
 */
export function clearUserVisitHistory(): Promise<ApiResponse<any>> {
  return videoApiInstance
    .post<ApiResponse<any>>('/api/history/users/clear')
    .then(response => response.data)
}
