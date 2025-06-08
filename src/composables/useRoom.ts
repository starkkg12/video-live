import { ref, computed, type Ref } from 'vue'
import constants from '@/constants'
import service from '@/service'
import utils from '@/utils'
import { type MessageInterface } from '@/service/room'
import createWebSocketClient from '@/utils/webSocketManager'
import { showToast } from 'vant'
import { useCacheData, type CacheDataInterface } from 'src/composables/useCacheData'

export interface MessageItemInterface {
  sid?: string
  roomId?: string
  userId?: string
  vip?: number
  msg?: string
  imgUrl?: string
  code?: number
  systemMsg?: string
  heat?: number
}

type RoomType = 'VOICE' | 'CHAT'

export interface RoomInterface {
  myUserId: Ref<string>
  id: Ref<string>
  type: Ref<RoomType>
  typeText: Ref<string>
  wsClient: Ref<any>
  config: Ref<any>
  info: Ref<any>
  owner: Ref<any>
  isOwner: Ref<boolean>
  ownerId: Ref<string>
  userList: Ref<any[]>
  upUserList: Ref<any[]>
  onMicList: Ref<any[]>
  messageList: Ref<any[]>
  heat: Ref<number>
  isUpSpeaker: Ref<boolean>
  isOnMic: Ref<boolean>
  custom: Ref<any>
  voiceEffect: Ref<string>
  usersTotal: Ref<number>
  usersDictionary: Ref<any>
  usersRelationDictionary: Ref<any>
  seriesByGameTypeDictionary: Ref<any>
  isVoice: Ref<boolean>
  micVoiceStatus: Ref<any>
  userListIsFinished: Ref<boolean>
  init: (roomId: string, roomType: RoomType) => void
  getUserList: (size?: number) => void
  checkIfOwner: (userId: string) => boolean
  checkIfSelf: (userId: string) => boolean
  checkIfOn: (userId: string) => boolean
  checkIfUp: (userId: string) => boolean
  checkIfExists: (userId: string) => boolean
  leaveRoom: (callback?: Function) => void
  deleteRoom: (callback?: Function) => void
  kickOut: (userIds: string[]) => void
  addHeat: () => void
  install: (key: string, value: any) => void
  uninstall: (key: string) => void
  changeVoice: (key: string) => void
  setMicVoiceStatus: (status: any) => void
  addUsersDictionary: (userIds: string[]) => void
  addUsersRelationDictionary: (userIds: string[]) => void
  addSeriesByGameTypeDictionary: (gameType: string) => void
}

export function useRoom(): RoomInterface {
  const myUserId = ref<string>(utils.getLSItem(constants.localStorageKeys.USER_ID) ?? '')
  const id = ref<string>('')
  const type = ref<RoomType>('VOICE')
  const wsClient = ref<any>()
  const config = ref<any>()
  const info = ref<any>()
  const isOwner = ref<boolean>(false)
  const ownerId = ref<string>('')
  const userList = ref<any[]>([])
  const upUserList = ref<any[]>([])
  const onMicList = ref<any[]>([])
  const messageList = ref<MessageItemInterface[]>([])
  const heat = ref<number>(0)
  const isJoin = ref<boolean>(false)
  const custom = ref<any>({})
  const voiceEffect = ref<string>('')
  const usersTotal = ref<number>(0)
  const micVoiceStatus = ref<any>({})
  const userListPage = ref<number>(1)
  const userListIsFinished = ref<boolean>(false)

  const isUpSpeaker = computed(() => checkIfUp(myUserId.value))
  const isOnMic = computed(() => checkIfOn(myUserId.value))
  const typeText = computed(() => (type.value === 'VOICE' ? '语音房' : '聊天室'))
  const isVoice = computed(() => type.value === 'VOICE')
  const owner = computed(() => {
    return usersDictionary.value[ownerId.value]
  })

  const {
    usersDictionary,
    addUsersDictionary,
    addUsersDictionaryNow,
    usersRelationDictionary,
    addUsersRelationDictionary,
    seriesByGameTypeDictionary,
    addSeriesByGameTypeDictionary,
  }: CacheDataInterface = useCacheData()

  const params = {
    roomId: '',
    userId: myUserId.value,
  }

  const init = async (roomId: string, roomType: RoomType) => {
    id.value = roomId
    type.value = roomType
    params.roomId = id.value
    userList.value = []

    await getConfig()
    await getRoomInfo()

    if (isJoin.value) {
      await joinRoom(id.value)
    } else {
      await startChat(id.value)
    }
    await getUserList()

    if (!wsClient.value) return

    wsClient.value.setOnMessage(async (message: MessageInterface) => {
      if (message.body?.roomId && id.value !== message.body?.roomId) return
      switch (message.code) {
        case 3000:
          await addUsersDictionaryNow([message.body.userId])
          userList.value = [...userList.value, { userId: message.body.userId }]
          messageList.value = [
            ...messageList.value,
            {
              ...message.body,
              code: message.code,
              systemMsg: getSystemMessage(message),
            },
          ]
          usersTotal.value += 1
          custom.value.handleUserList && custom.value.handleUserList(message.body.userId, 'add')
          break
        case 3001:
        case 3002:
          upUserList.value = [
            ...upUserList.value,
            {
              userId: message.body.userId,
            },
          ]
          onMicList.value = [...onMicList.value, { userId: message.body.userId }]
          messageList.value = [
            ...messageList.value,
            {
              ...message.body,
              code: message.code,
              systemMsg: '已经上麦',
            },
          ]
          break
        case 3003:
        case 3004:
          upUserList.value = upUserList.value.filter(item => item.userId !== message.body.userId)
          onMicList.value = onMicList.value.filter(item => item.userId !== message.body.userId)
          messageList.value = [
            ...messageList.value,
            {
              ...message.body,
              code: message.code,
              systemMsg: '已经下麦',
            },
          ]
          break
        case 3005:
          onMicList.value = onMicList.value.filter(item => item.userId !== message.body.userId)
          break
        case 3006:
          onMicList.value = [...onMicList.value, { userId: message.body.userId }]
          break
        case 3007:
        case 3008:
          if (id.value !== message.body.roomId) return
          userList.value = userList.value.filter(item => item.userId !== message.body.userId)
          onMicList.value = onMicList.value.filter(item => item.userId !== message.body.userId)
          upUserList.value = upUserList.value.filter(item => item.userId !== message.body.userId)
          messageList.value = [
            ...messageList.value,
            {
              ...message.body,
              code: message.code,
              systemMsg: getSystemMessage(message),
            },
          ]
          if (message.code === 3007 && checkIfSelf(message.body.userId.toString())) {
            handleKickedOut()
          }
          usersTotal.value -= 1
          custom.value.handleUserList && custom.value.handleUserList(message.body.userId, 'remove')
          break
        case 3009:
          userList.value = []
          onMicList.value = []
          upUserList.value = []
          messageList.value = [
            ...messageList.value,
            {
              ...message.body,
              code: message.code,
              systemMsg: getSystemMessage(message),
            },
          ]
          handleCloseRoom()
          break
        case 3013:
        case 3011:
          if (message.body) {
            messageList.value = [...messageList.value, message.body] // 更新响应式数据
          }
          break
        case 3012:
          heat.value = message.body.heat
          break
        case 3015:
          info.value = { ...message.body, gameTypeCode: utils.getGameByType(message.body.gameType)?.gameTypeCode }
          break
      }
    })
  }

  const getSystemMessage = (message: any): string => {
    const userInfo = usersDictionary.value[message.body.userId] ?? {}
    const prefix = isVoice.value ? '' : `"${utils.getNickName(userInfo.nickname, userInfo.userId)}" `
    let result = ''

    switch (message.code) {
      case 3000:
        result = `${prefix}进入了${typeText.value}`
        break
      case 3007:
        result = `${prefix}被踢出了${typeText.value}`
        break
      case 3008:
        result = `${prefix}离开了${typeText.value}`
        break
      case 3009:
        result = `${prefix}关闭了${typeText.value}`
        break
    }
    return result
  }

  async function startChat(roomId: string) {
    const cid = await utils.getCid()
    const token = utils.getLSItem(constants.localStorageKeys.ACCESS_TOKEN) ?? ''
    wsClient.value = createWebSocketClient({
      cid,
      token,
      userId: myUserId.value,
      roomId: roomId ?? '',
      manageSiteId: import.meta.env.PUBLIC_MANAGE_SITE_ID,
    })
  }

  const joinRoom = async (joinRoomId: string) => {
    const profileRes = await service.user.getUserInfo()
    const response = await service.room.joinChatRoom({
      roomId: joinRoomId,
      secret: config.value.apiSecret,
      nickname: profileRes.data.data?.nickname ?? '',
    })
    if (response.data?.errCode === '0') {
      await startChat(joinRoomId)
    }
  }

  // 获取房间配置
  const getConfig = async () => {
    const response = await service.room.getConfig()
    if (response.data.errCode === '0') {
      config.value = response.data.data
    }
  }

  // 查询房间信息
  const getRoomInfo = async () => {
    const response = await service.room.getVoiceRoomInfo({ roomId: id.value })
    if (response.data.errCode === '0') {
      const _info = response.data.data
      info.value = { ..._info, gameTypeCode: utils.getGameByType(_info.gameType)?.gameTypeCode }
      ownerId.value = info.value.userId
      isOwner.value = ownerId.value === myUserId.value
      upUserList.value = info.value.upUserList ?? []
      onMicList.value = initOpenedMicList(upUserList.value)
      heat.value = info.value.heat
      isJoin.value = ownerId.value !== myUserId.value
    }
  }

  // 查询房间人数
  const getUserList = async (size: number = 20) => {
    if (userListIsFinished.value) return
    const response = await service.room.getRoomUser({
      roomId: id.value,
      page: userListPage.value,
      size,
    })
    if (response.data.errCode === '0') {
      const newData = response.data.data.list ?? []
      usersTotal.value = response.data.data.total
      userList.value = [...userList.value, ...newData]
      userListPage.value += 1
      userListIsFinished.value = newData.length < size
    }
  }

  const initOpenedMicList = (upUserList: any) => {
    const result: any[] = []
    upUserList.map((item: any) => {
      if (item.openSpeak === 2) {
        result.push(item)
      }
    })
    return result
  }

  const checkIfOwner = (userId: string) => {
    return userId === ownerId.value
  }

  const checkIfSelf = (userId: string) => {
    return userId === myUserId.value
  }

  const checkIfOn = (userId: string) => {
    const result = onMicList.value.find((item: any) => item.userId === userId)
    return result
  }

  const checkIfUp = (userId: string) => {
    return checkIfOwner(userId) || !!upUserList.value.find((item: any) => item.userId === userId)
  }

  const checkIfExists = (userId: string) => {
    return !!userList.value.find((item: any) => item.userId === userId)
  }

  // 离开房间
  const leaveRoom = async (callback?: Function) => {
    const { title, message } = isVoice.value
      ? {
          title: '离开提醒',
          message: `确定要离开语音房？`,
        }
      : {
          title: '离开聊天室',
          message: `离开聊天室讯息将会清除，确定离开吗？`,
        }
    utils
      .chain()
      .ask({ title, messageSub: message, confirmText: '确定离开' })
      .fetch(service.room.leaveRoom, params, `离开${typeText.value}成功`)
      .next(() => callback && callback())
  }
  // 关闭房间
  const deleteRoom = async (callback?: Function) => {
    const { title, message, confirmText } = isVoice.value
      ? {
          title: '关播提醒',
          message: `热聊语音房越长，获得更多关注可能越多，确定要结束语音房？`,
          confirmText: '确定关播',
        }
      : {
          title: '解散聊天室',
          message: `解散之后，聊天室无法恢复，确定解散吗？`,
          confirmText: '确定解散',
        }
    utils
      .chain()
      .ask({
        title,
        messageSub: message,
        confirmText,
        confirmColor: '#fc7e7e',
      })
      .fetch(service.room.deleteRoom, params, '关播成功')
      .next(() => callback && callback())
  }
  // 踢出语音房
  const kickOut = async (userIds: string[]) => {
    const userNickName = userIds
      .map((userId: string) => utils.getNickName(usersDictionary.value[userId].nickname, userId))
      .join(', ')
    utils
      .chain()
      .ask({
        title: '踢出确认',
        messageSub: `"${userNickName}" 被踢出后，30分钟之后才能再次加入！`,
        confirmText: '确认踢出',
      })
      .fetch(service.room.kickOut, { roomId: id.value, userIds }, `${userNickName}已被踢出！`)
  }
  // 加热房间
  const addHeat = async () => {
    utils
      .chain()
      .fetch(
        service.room.addHeat,
        { ...params, count: 1 },
        isVoice.value ? '加热成功' : '已推荐此聊天室,30分钟后才能在上热门推荐'
      )
  }

  const install = (key: string, value: any) => {
    custom.value[key] = value
  }

  const uninstall = (key: string) => {
    delete custom.value[key]
  }

  const changeVoice = (effect: string) => {
    voiceEffect.value = effect
  }

  const setMicVoiceStatus = (status: any) => {
    micVoiceStatus.value = status
  }

  const handleCloseRoom = () => {
    showToast('房间已经关闭，稍后为您跳转查看更多房间')
    setTimeout(
      () =>
        utils.jumpTo(
          `/room/close?type=${type.value}&title=${info.value.title}&ownerId=${owner.value.userId}&reason=close`
        ),
      1500
    )
  }
  const handleKickedOut = () => {
    showToast('您已被房主移出房间，请30分钟后再次加入')
    setTimeout(
      () =>
        utils.jumpTo(
          `/room/close?type=${type.value}&title=${info.value.title}&ownerId=${owner.value.userId}&reason=kick`
        ),
      1500
    )
  }

  return {
    myUserId,
    id,
    type,
    typeText,
    wsClient,
    config,
    info,
    owner,
    isOwner,
    ownerId,
    userList,
    upUserList,
    onMicList,
    messageList,
    heat,
    isUpSpeaker,
    isOnMic,
    custom,
    voiceEffect,
    usersTotal,
    usersDictionary,
    isVoice,
    micVoiceStatus,
    userListIsFinished,
    usersRelationDictionary,
    seriesByGameTypeDictionary,
    init,
    getUserList,
    checkIfOwner,
    checkIfSelf,
    checkIfOn,
    checkIfUp,
    checkIfExists,
    leaveRoom,
    deleteRoom,
    kickOut,
    addHeat,
    install,
    uninstall,
    changeVoice,
    setMicVoiceStatus,
    addUsersDictionary,
    addUsersRelationDictionary,
    addSeriesByGameTypeDictionary,
  }
}
