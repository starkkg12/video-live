import { computed, ref, type Ref } from 'vue'
import constants from '@/constants'
import service from '@/service'
import utils from '@/utils'
import createWebSocketClient from '@/utils/webSocketManager'
import { getRoomUser, getUserFollowStatus } from '@/service/api'
import { FeedAction } from '@/service/api/feed'
import { showToast, showFailToast } from 'vant'
import { useCacheData, type CacheDataInterface } from 'src/composables/useCacheData'

export interface MessageInterface {
  msg: string // 服务端推送消息
  code: number // 类型码
  body: {
    roomId: string //房间编号
    userId: string //用户编号
    msg: string //用户消息
    heat: number //热度值
    imgUrl: string //图片地址
    gameType: string //图片地址
  }
}

export interface MessageItemInterface {
  isAdmin?: boolean
  message: {
    cId: string
    cTs: number
    content: string
    sId: string
    sTs: number
    type: string
    totalCount?: number
    viewersCount: number
    viewers: Array<object>
    user: object
  }
  sender: {
    cId: string
    isAnoymous: boolean
    sub: string
    username: string
    userAvatar: string
    isAnonymous: boolean
  }
}

export interface LiveRoomInterface {
  myUserId: Ref<string>
  roomId: Ref<string>
  messageList: Ref<MessageItemInterface[]>
  wsClient: Ref<any>
  isConnected: Ref<boolean>
  ownerId: Ref<string>
  usersDictionary: Ref<any>
  usersTotal: Ref<number>
  followedOwner: Ref<boolean>
  likeCount: Ref<number>
  userList: Ref<any[]>
  isAnonymous: Ref<boolean>
  custom: Ref<any>
  anonymousCount: Ref<number>
  joinMessage: Ref<any>
  liveEnd: Ref<boolean>
  uniqueViewersCount: Ref<number>
  viewers: Ref<any[]>
  // 核心功能
  connectWebSocket: (roomId: string, userId: string, avatar: string) => Promise<void>
  sendMessage: (message: string, imgUrl?: string) => Promise<void>
  onReceiveMessage: (callback: (message: MessageItemInterface) => void) => void
  checkIfOwner: (userId: string) => boolean
  checkIfSelf: (userId: string) => boolean
  init: (roomId: string, userId: string) => void
  getUserList: (size?: number) => void
  changeFollowStatus: (targetUserId: string, isFollowing: boolean) => void
  install: (key: string, value: any) => void
  uninstall: (key: string) => void
  sendFlyingHeart: () => void
  sendFollow: () => void
}
type Viewer = {
  isAnonymous: boolean
  [key: string]: any // 若還有其他欄位
}
export function useLiveRoom(): LiveRoomInterface {
  const myUserId = ref<string>(utils.getLSItem(constants.localStorageKeys.USER_ID) ?? '')
  const roomId = ref<string>('')
  const ownerId = ref<string>('')
  const messageList = ref<MessageItemInterface[]>([])
  const wsClient = ref<any>()
  const isConnected = ref<boolean>(false)
  const messageCallback = ref<any>(null)
  const followedOwner = ref<boolean>(true)
  const isAnonymous = computed(() => !myUserId.value)
  const id = ref<string>('')
  const userList = ref<any[]>([])
  const usersTotal = ref<number>(0)
  const custom = ref<any>({})
  const likeCount = ref<number>(0)
  const anonymousCount = ref<number>(0)
  const allViewers = ref<any[]>([])
  const joinMessage = ref<any>(null)
  const viewers = ref<Viewer[]>([])
  // 直播是否結束(預設否, 狀態在_live.vue裡變化)
  const liveEnd = ref<boolean>(false) 
  // 不重複的直播觀看人數(預設0, 數值在_live.vue裡變化)
  const uniqueViewersCount = ref<number>(0)
  const init = async (roomId: string, userId: string) => {
    id.value = roomId
    ownerId.value = userId
    userList.value = []
    // await getUserList()
  }
  const { usersDictionary, addUsersDictionary }: CacheDataInterface = useCacheData()

  // 1. 连接 WebSocket
  const connectWebSocket = async (id: string, userId: string, avatar: string) => {
    if (!id) return
    roomId.value = id
    ownerId.value = userId
    allViewers.value = [] as Viewer[]
    const cid = await utils.getCid()
    const token = utils.getLSItem(constants.localStorageKeys.ACCESS_TOKEN) ?? ''

    wsClient.value = createWebSocketClient({
      cid,
      token,
      userId: myUserId.value,
      roomId: id,
      manageSiteId: import.meta.env.PUBLIC_MANAGE_SITE_ID,
      userAvatar: avatar,
    })

    // 设置消息接收处理
    wsClient.value.setOnMessage((message: MessageItemInterface) => {
      // 处理文本消息和图片消息
      if (/^(message|system_announcement)$/.test(message.message.type)) {
        const newMessage: MessageItemInterface = message
        messageList.value = [...messageList.value, newMessage]

        // 如果设置了回调则执行
        if (messageCallback.value) {
          messageCallback.value(newMessage)
        }
      } else if (message.message.type === 'user_join') {
        const join = message.message.user as { sub: string }
        const exists = allViewers.value.some(viewer => viewer.sub === join.sub)
        // join.sub != ownerId.value: 直播主不算在內
        if (!exists && join.sub != ownerId.value) {
          allViewers.value.push(join)
          // 將直播主過濾掉
          const data = allViewers.value.filter(viewer => viewer.sub !== ownerId.value)
          userList.value = allViewers.value.filter(
            viewer => viewer.isAnonymous === false && viewer.sub !== ownerId.value
          )
          anonymousCount.value = allViewers.value.filter(
            viewer => viewer.isAnonymous === true
          ).length
          usersTotal.value = data.length
          
          joinMessage.value = message
        }
      } else if (message.message.type === 'user_leave') {
        const leave = message.message.user as { sub: string }
        allViewers.value = allViewers.value.filter(viewer => viewer.sub !== leave.sub)
        const data = allViewers.value.filter(viewer => viewer.sub !== ownerId.value)
        userList.value = allViewers.value.filter(
          viewer => viewer.isAnonymous === false && viewer.sub !== ownerId.value
        )
        anonymousCount.value = allViewers.value.filter(viewer => viewer.isAnonymous === true).length
        usersTotal.value = data.length 
        
      } else if (message.message.type === 'viewers_update') {
        // allViewers.value = message.message.viewers as Viewer[]
        viewers.value = [];
        const data = message.message.viewers as Viewer[]
        data.forEach(incoming => {
          // 過濾掉直播主
          if (incoming.sub !== ownerId.value){
            if (!incoming.isAnonymous) {
              viewers.value.push(incoming)
            }  
            const index = allViewers.value.findIndex(v => v.sub === incoming.sub)
            if (index !== -1) {
              // 已存在 → 更新該筆
              allViewers.value[index] = incoming
            } else {
              // 不存在 → 新增
              allViewers.value.push(incoming)
            }
          }  
        })

        const filterOutOwnerData = allViewers.value.filter(viewer => viewer.sub === ownerId.value)
        userList.value = allViewers.value.filter(
          viewer => viewer.isAnonymous === false && viewer.sub !== ownerId.value
        )
        anonymousCount.value = allViewers.value.filter(viewer => viewer.isAnonymous === true).length
        usersTotal.value = (filterOutOwnerData.length > 0 ? message.message.viewersCount - 1 : message.message.viewersCount);
      } else if (message.message.type === 'follow') {
        //message.message.content =  (message.message.user as { username: string }).username + '关注了房主'
        message.message.content = '关注了主播'
        const newMessage: MessageItemInterface = message
        messageList.value = [...messageList.value, newMessage]

        if (messageCallback.value) {
          messageCallback.value(newMessage)
        }
      } else if (message.message.type === 'live_room_closed') {
        liveEnd.value = true
      } else if (/(like_count|like)/.test(message.message.type)) {
        likeCount.value = message.message.totalCount ?? 0
      }
    })

    isConnected.value = true
  }

  // 2. 发送消息
  const sendMessage = async (message: string, imgUrl?: string) => {
    if (!wsClient.value || !isConnected.value) {
      throw new Error('WebSocket未连接')
    }

    if (message) {
      wsClient.value.sendText(message)
    } else {
      wsClient.value.sendImage(imgUrl)
    }
  }

  const sendFlyingHeart = () => {
    if (!wsClient.value || !isConnected.value) {
      throw new Error('WebSocket未连接')
    }
    wsClient.value.sendFlyingHeart()
  }

  // 3. 接收消息回调
  const onReceiveMessage = (callback: (message: MessageItemInterface) => void) => {
    messageCallback.value = callback
  }

  const checkIfOwner = (userId: string) => {
    return ownerId.value === userId
  }

  const checkIfSelf = (userId: string) => {
    return myUserId.value === userId
  }

  // 查询房间人数
  const getUserList = async (size: number = 20) => {
    const response = await getRoomUser(id.value)
    if (response.data.errorMessage === 'Success') {
      allViewers.value = response.data.data.viewers as Viewer[]
      const data = allViewers.value.filter(viewer => viewer.sub !== ownerId.value)
      userList.value = allViewers.value.filter(
        viewer => viewer.isAnonymous === false && viewer.sub !== ownerId.value
      )
      anonymousCount.value = allViewers.value.filter(viewer => viewer.isAnonymous === true).length
      usersTotal.value = data.length
    }
  }

  const changeFollowStatus = async (targetUserId: string, isFollowing: boolean) => {
    try {
      await service.api.setFeedInteraction(targetUserId, {
        action: isFollowing ? FeedAction.Unfollow : FeedAction.Follow,
        objectType: 'user',
        clientType: 0,
      })
      followedOwner.value = !isFollowing
      showToast(isFollowing ? '取消关注成功' : '关注成功')
    } catch (error) {
      showFailToast({
        message: isFollowing ? '取消关注失败' : '关注失败',
        duration: 2000,
      })
    }
  }
  const install = (key: string, value: any) => {
    custom.value[key] = value
  }

  const uninstall = (key: string) => {
    delete custom.value[key]
  }

  const sendFollow = () => {
    if (!wsClient.value || !isConnected.value) {
      throw new Error('WebSocket未连接')
    }
    wsClient.value.sendFollow()
  }
  return {
    myUserId,
    roomId,
    messageList,
    wsClient,
    isConnected,
    ownerId,
    usersTotal,
    usersDictionary,
    followedOwner,
    userList,
    isAnonymous,
    custom,
    anonymousCount,
    liveEnd,
    uniqueViewersCount,
    viewers,
    connectWebSocket,
    sendMessage,
    onReceiveMessage,
    checkIfOwner,
    checkIfSelf,
    init,
    getUserList,
    changeFollowStatus,
    install,
    uninstall,
    sendFlyingHeart,
    sendFollow,
    likeCount,
    joinMessage,
  }
}
