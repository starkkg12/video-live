import constants from '@/constants'
import utils from '@/utils'
import { computed, type ComputedRef } from 'vue'

/**
 * 用户身份识别组合函数，用于确定当前页面查看的用户是否为登录用户
 * 
 * 该函数有两种使用方式：
 * 1. 显式传入用户ID - 适用于已知用户ID的场景
 * 2. 不传参数 - 函数会自动从URL路径中提取用户ID（适用于用户详情页）
 * 
 * URL提取规则：查找URL路径中长度为19的纯数字段，例如：
 * https://example.com/user/1234567890123456789/profile
 * 
 * @example
 * // 基本用法 - 自动从URL中提取用户ID
 * const { isCurrentUser, myId, userId } = useCurrentUser()
 * 
 * @example
 * // 显式传入用户ID
 * const { isCurrentUser, myId, userId } = useCurrentUser('1234567890123456789')
 * 
 * @param userId 用户ID (可选)，如果不提供会尝试从URL路径中提取
 * @returns 包含用户身份信息的对象
 */
export function useCurrentUser(userId?: string | null): {
  /**
   * 是否是当前登录用户的个人页面
   * - 当 myId === userId 时为 true（查看自己的页面）
   * - 当未提供 userId 且 URL 中也无法提取时为 true（默认视为自己的页面）
   */
  isCurrentUser: boolean
  /**
   * 当前登录的用户ID，从本地存储中获取
   * 未登录时为 null
   */
  myId: string | null
  /**
   * 当前访问的用户ID
   * - 优先使用传入的 userId 参数
   * - 如未传入，尝试从 URL 路径中提取
   * - 如都未获取到，则为 null
   */
  userId: string | null
  /**
   * 是否为匿名用户（未登录）
   * 当 myId 不存在时为 true
   */
  isAnonymousUser: boolean
} {

  /**
   * 从URL路径中提取用户ID
   * 查找格式为19位纯数字的路径段作为用户ID
   */
  const extractUserIdFromUrl = (): string | null => {
    if (typeof window === 'undefined') return null
    
    const pathSegments = window.location.pathname.split('/')
    
    for (const segment of pathSegments) {
      if (/^\d+$/.test(segment) && segment.length === 19) {
        return segment
      }
    }
    
    return null
  }

  const resolvedUserId = userId || extractUserIdFromUrl()
  
  const myId = utils.getLSItem(constants.localStorageKeys.USER_ID)
  
  // 计算是否为当前用户的页面
  // 1. myId === resolvedUserId：查看的是登录用户自己的页面
  // 2. !resolvedUserId：未能获取到userId，默认视为自己的页面
  const isCurrentUser = computed(() => myId === resolvedUserId || !resolvedUserId)

  return {
    isCurrentUser: isCurrentUser.value,
    myId,
    userId: resolvedUserId,
    isAnonymousUser: !myId,
  }
} 