import { getUserFollowerList, getUserFollowingList, getUserProfile } from '@/service/api/user'
import { getUserVisitHistory } from '@/service/api/history'
import { getUserBatchList } from '@/service/user'
import type {UserProfile} from '@/service/api/user'
import type {UserBatchItem} from '@/service/user'

interface PaginationParams {
  page: number
  pageSize: number
}

interface AnonymousUser {
  isAnonymousUser: boolean | undefined
}

export type EnhancedUser = UserProfile & UserBatchItem & AnonymousUser



export interface UserBatchResponse {
  data: Array<{
    userId: string | number
    [key: string]: any
  }>
}

/**
 * 创建用户信息映射
 */
async function createUserInfoMap(userIds: (string | number)[]): Promise<Map<string, any>> {
  if (!userIds || userIds.length === 0) {
    return new Map();
  }
  
  const userInfoMap = new Map<string, any>();
  
  // 将用户ID分为匿名用户和普通用户
  const anonymousUserIds: string[] = [];
  const normalUserIds: (string | number)[] = [];
  
  userIds.forEach(id => {
    if (id.toString().startsWith('anonymous')) {
      anonymousUserIds.push(id.toString());
    } else {
      normalUserIds.push(id);
    }
  });
  
  // 为匿名用户设置固定的数据
  anonymousUserIds.forEach(id => {
    const [_, anonymousUserId] = id?.split('_')
    userInfoMap.set(id, {
      userId: id,
      nickname: `匿名用户...${anonymousUserId.slice(-5)}`,
      isAnonymousUser: true,
      gender: 'x',
    });
  });
  
  // 只为非匿名用户调用API
  if (normalUserIds.length > 0) {
    const userBatchResponse = await getUserBatchList(normalUserIds) as UserBatchResponse;
    
    if (userBatchResponse?.data) {
      userBatchResponse.data.forEach((user: { userId: string | number, [key: string]: any }) => {
        if (user?.userId) {
          userInfoMap.set(user.userId.toString(), user);
        }
      });
    }
  }
  
  return userInfoMap;
}

/**
 * 获取增强版的用户关注列表（包含完整用户信息）
 */
export async function getEnhancedFollowingList(
  userId: string,
  params: PaginationParams = { page: 1, pageSize: 10 }
): Promise<{
  list: EnhancedUser[]
  total?: number
  hasMore?: boolean
}> {
  try {
    // 获取关注列表
    const response = await getUserFollowingList(userId, params.page, params.pageSize)
    if (!response.data.data || !Array.isArray(response.data.data) || response.data.data.length === 0) {
      return { list: [], total: 0, hasMore: false }
    }
    
    // 提取用户ID列表
    const userIds = response.data.data.map(user => user.userId).filter(Boolean)
    
    // 创建用户ID到详细信息的映射
    const userInfoMap = await createUserInfoMap(userIds);
    
    const enhancedList = response.data.data.map(user => {
      const userInfo = userInfoMap.get(user.userId.toString());
      return {
        ...user,
        ...userInfo,
      }
    })
    
    return {
      list: enhancedList,
      total: response.data.pagination?.total || enhancedList.length,
      hasMore: enhancedList.length >= params.pageSize
    }
  } catch (error) {
    console.error('获取增强用户关注列表失败:', error)
    throw error
  }
}

/**
 * 获取增强版的用户粉丝列表（包含完整用户信息）
 */
export async function getEnhancedFollowerList(
  userId: string,
  params: PaginationParams = { page: 1, pageSize: 10 }
): Promise<{
  list: EnhancedUser[]
  total?: number
  hasMore?: boolean
}> {
  try {
    // 获取粉丝列表
    const response = await getUserFollowerList(userId, params.page, params.pageSize)
    const dataArray = response?.data.data
    
    if (!dataArray || !Array.isArray(dataArray) || dataArray.length === 0) {
      return { list: [], total: 0, hasMore: false }
    }
    
    // 提取用户ID列表
    const userIds = dataArray.map(user => user.userId).filter(Boolean)
    
    // 创建用户ID到详细信息的映射
    const userInfoMap = await createUserInfoMap(userIds);
    
    // 合并数据，优先使用follower接口返回的isFollowing字段
    const enhancedList = dataArray.map(user => {
      const userInfo = userInfoMap.get(user.userId.toString());
      return {
        ...user,
        ...userInfo,
        isFollowing: user.isFollowing || false, // 保留原始API返回的关注状态
      }
    })
    
    return {
      list: enhancedList,
      total: response.data.pagination?.total || enhancedList.length,
      hasMore: enhancedList.length >= params.pageSize
    }
  } catch (error) {
    console.error('获取增强用户粉丝列表失败:', error)
    throw error
  }
}

/**
 * 获取增强版的用户浏览历史（包含完整用户信息）
 */
export async function getEnhancedUserHistory(
  params: PaginationParams = { page: 1, pageSize: 30 }
): Promise<{
  list: EnhancedUser[]
  total?: number
  hasMore?: boolean
}> {
  try {
    // 获取用户浏览历史
    const response = await getUserVisitHistory(params)
    
    if (!response.data?.data || !Array.isArray(response.data.data) || response.data.data.length === 0) {
      return { list: [], total: 0, hasMore: false }
    }
    
    const historyItems = response.data.data
    
    // 提取用户ID列表
    const userIds = historyItems.map(item => item.id).filter(Boolean)
    
    if (userIds.length === 0) {
      return { list: [], total: 0, hasMore: false }
    }
    
    // 创建用户ID到详细信息的映射
    const userInfoMap = await createUserInfoMap(userIds);
    
    // 合并数据
    const enhancedList = historyItems.map(item => {
      const userInfo = userInfoMap.get(item.id.toString());
      return {
        ...item,
        ...userInfo,
        // 确保不重复指定属性
        userId: item.id,
        nickname: userInfo?.nickname || `用户${item.id}`,
        avatar: userInfo?.avatar,
      }
    })
    
    return {
      list: enhancedList,
      total: response.data.pagination?.total || enhancedList.length,
      hasMore: enhancedList.length >= params.pageSize
    }
  } catch (error) {
    console.error('获取增强用户历史列表失败:', error)
    throw error
  }
}

/**
 * 批量获取增强用户信息
 * 当需要处理多批次用户数据时使用
 */
export async function getEnhancedUserBatch(
  userIds: (string | number)[]
): Promise<Map<string, EnhancedUser>> {
  try {
    if (!userIds || userIds.length === 0) {
      return new Map()
    }
    
    // 将所有ID转为字符串以便映射
    const stringUserIds = userIds.map(id => id.toString())
    
    // 通过批量接口获取完整用户信息
    const userInfoMap = await createUserInfoMap(stringUserIds);
    
    // 转换为增强用户对象
    const enhancedUserMap = new Map<string, EnhancedUser>();
    userInfoMap.forEach((user, userId) => {
      enhancedUserMap.set(userId, {
        id: user.userId,
        userId: user.userId,
        ...user
      });
    });
    
    return enhancedUserMap;
  } catch (error) {
    console.error('批量获取增强用户信息失败:', error)
    throw error
  }
}

/**
 * 获取增强版的用户个人资料（包含完整用户信息）
 */
export async function getEnhancedUserProfile(
  userId: string
): Promise<EnhancedUser | null> {
  try {
    const results = await Promise.allSettled([
      getUserProfile(userId),
      getUserBatchList([userId.toString()]) 
    ]);
    
    let basicProfile: any = {};
    if (results[0].status === 'fulfilled' && results[0].value?.data) {
      basicProfile = results[0].value.data;
    } else {
      console.warn('获取用户基本资料失败，将使用有限信息');
    }
    
    let additionalInfo: any = {};
    if (results[1].status === 'fulfilled' && results[1].value?.data?.length > 0) {
      const userInfo = results[1].value.data.find(
        (user: { userId: string | number }) => user.userId.toString() === userId.toString()
      );
      if (userInfo) {
        additionalInfo = userInfo;
      }
    } else {
      console.warn('获取用户批量信息失败，将使用有限信息');
    }
    
    if (Object.keys(basicProfile).length === 0 && Object.keys(additionalInfo).length === 0) {
      return null;
    }
    
    // 合并数据，创建增强的用户资料
    const enhancedProfile: EnhancedUser = {
      ...additionalInfo,
      ...basicProfile, 
      userId: userId,
    };
    
    return enhancedProfile;
  } catch (error) {
    console.error('获取增强用户个人资料失败:', error);
    throw error;
  }
} 