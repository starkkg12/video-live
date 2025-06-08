import type { ApiResponse, PaginatedData } from '../types/common';
import { videoApiInstance } from '../utils/instance';

/**
 * 用户个人资料
 */
export interface UserProfile {
  userId: string;
  followingCount: number;
  followerCount: number;
  likedCount: number;
  isFollowing: boolean;
  createdAt: string;
}

export type GetUserProfileResponse = ApiResponse<UserProfile>;

/**
 * 获取用户个人资料
 */
export function getUserProfile(userId: string): Promise<GetUserProfileResponse> {
  return videoApiInstance.get<GetUserProfileResponse>(`/api/users/profile?userId=${userId}`)
    .then(response => response.data);
}




export interface UserVideo {
  id: number;
  title: string;
  description: string;
  videoPath: string;
  poster: string;
  preview: string;
  duration: number;
  size: number;
  userId: string;
  resolution: string;
  bitrate: string;
  encoding: string;
  language: string;
  hasComments: boolean;
  hasBarrages: boolean;
  hasListening: boolean;
  isPublic: boolean;
  isPublished: boolean;
  /**
   * 审核状态
   * 0 = 待审核
   * 1 = 通过
   * 2 = 拒绝
   */
  auditStatus: number;
  auditPersonId?: string;
  auditPersonName?: string;
  auditComment?: string;
  auditedAt?: string;
  /**
   * 转码状态
   * 0 = 待转码
   * 1 = 转码中
   * 2 = 转码失败
   * 3 = 转码成功
   */
  transcodingStatus?: number;
  transcodingStartedAt?: string;
  transcodingFinishedAt?: string;
  transcodingError?: string | null;
  transcodedVideoPath?: string;
  createdAt: string;
  updatedAt?: string;
  isDeleted?: boolean;
  ipAddress?: string;
  country?: string;
  city?: string;
  attachmentId?: string | null;
  encryptionKey?: Record<string, number> | null;
  lotteryType?: string | null;
  year?: number | null;
  issueNumber?: string | null;
  isLiked?: boolean;
  isFavorite?: boolean;
  likeCount?: number;
  favoriteCount?: number;
  commentCount?: number;
  shareCount?: number;
  viewCount?: number;
  tags?: string[] | Array<{id: number; name: string; isActive: boolean; createdAt: string; sortOrder: number}>;
}

export type GetUserVideoListResponse = ApiResponse<UserVideo[]>;

/**
 * 获取用户作品列表
 */
export function getUserVideoList(userId: string, page: number = 1, pageSize: number = 10, sortBy: string = 'latest'): Promise<GetUserVideoListResponse> {
  return videoApiInstance.get<GetUserVideoListResponse>(`/api/user-videos/works?userId=${userId}&page=${page}&pageSize=${pageSize}&sortBy=${sortBy}`)
    .then(response => response.data);
}

/**
 * 获取用户点赞列表
 */
export function getUserLikeList(userId: string, page: number = 1, pageSize: number = 10, sortBy: string = 'latest'): Promise<GetUserVideoListResponse> {
  return videoApiInstance.get<GetUserVideoListResponse>(`/api/user-videos/likes?userId=${userId}&page=${page}&pageSize=${pageSize}&sortBy=${sortBy}`)
    .then(response => response.data);
}



/**
 * 获取用户收藏列表
 */
export function getUserFavoriteList(userId: string, page: number = 1, pageSize: number = 10, sortBy: string = 'latest'): Promise<GetUserVideoListResponse> {
  return videoApiInstance.get<GetUserVideoListResponse>(`/api/user-videos/favorites?userId=${userId}&page=${page}&pageSize=${pageSize}&sortBy=${sortBy}`)
    .then(response => response.data);
}

export interface BaseUserInfo {
  userId: string;
  followingCount: number;
  followerCount: number;
  likedCount: number;
  isFollowing: boolean;
  followedAt: string;
}

export type GetUserFollowingListResponse =ApiResponse<PaginatedData<BaseUserInfo>>;

/**
 * 获取用户关注列表
 */
export function getUserFollowingList(userId: string, page: number = 1, pageSize: number = 10): Promise<GetUserFollowingListResponse> {
  return videoApiInstance.get<GetUserFollowingListResponse>(`/api/users/followings?userId=${userId}&page=${page}&pageSize=${pageSize}`)
    .then(response => response.data);
}


export type GetUserFollowerListResponse = ApiResponse<PaginatedData<BaseUserInfo>>;

/**
 * 获取用户粉丝列表
 * @param userId 用户ID
 * @param page 页码
 * @param pageSize 每页数量
 * @returns Promise<GetUserFollowerListResponse>
 */
export function getUserFollowerList(userId: string, page: number = 1, pageSize: number = 10): Promise<GetUserFollowerListResponse> {
  return videoApiInstance.get<GetUserFollowerListResponse>(`/api/users/followers?userId=${userId}&page=${page}&pageSize=${pageSize}`)
    .then(response => response.data);
}


/**
 * 检查关注状态 /api/users/follow-status
 */
interface UserFollowStatus {
  isFollowing: boolean
}
export type GetUserFollowStatusResponse = ApiResponse<UserFollowStatus>;

export function getUserFollowStatus(targetUserId: string) {
  return videoApiInstance.get<GetUserFollowStatusResponse>(`/api/users/follow-status?targetUserId=${targetUserId}`)
  .then(response => response.data);
}

