import interceptorChain from './interceptorChain'

export enum ChatForm {
  VOICE_ROOM = 'VOICE', // VOICE=语音房
  CHAT_ROOM = 'CHAT', // CHAT=聊天室
}
const instance = interceptorChain('https://vchat.pwtk.cc')
  .clientIdRequest()
  .authRequest()
  .loginRedirect('ask-back-login')
  .tokenRefreshResponse('ask-back-login').instance

interface GetRoomListInterface {
  type?: string
  userId?: number | string | null
  sortRule: number
  manageSetId: string
  // gameType: number
  // gameSerialNo: string
  // gameReleaseYear: number
  // serialPeriodNo: string
  page: number
  size: number
}
interface CreateChatRoomInterface {
  type: 'VOICE' | 'CHAT' // 房间类型,VOICE=语音房,CHAT=聊天室,不必填，默认为VOICE
  title: string
  note: string
  backgroundImg: string
  gameType: string
  gameSerialNo: string
  gameReleaseYear: number
  serialPeriodNo: string
  manageSetId: string
  issueId: string
}

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

const headers = {
  manage_set_id: import.meta.env.PUBLIC_MANAGE_SITE_ID,
}
// 房间列表
export function getRoomList(data: GetRoomListInterface) {
  return instance.post('/voice/room/list', data, { headers })
}
// 创建房间
export function createChatRoom(data: CreateChatRoomInterface) {
  return instance.post('/voice/room/create', data, { headers })
}
// 加入房间
export function joinChatRoom(data: { roomId: string; secret?: string; nickname?: string }) {
  return instance.post('/voice/room/join', data, { headers })
}
// 关闭房间
export function deleteRoom(data: { roomId: string }) {
  return instance.get(`/voice/room/close?roomId=${data.roomId}`, { headers })
}
// 获取语音聊天室配置
export function getConfig() {
  return instance.get('/voice/room/query/config', { headers })
}
// 开麦
export function openSpeak(data: { roomId: string; userId: string }) {
  return instance.get(`/voice/room/open/speak?roomId=${data.roomId}&userId=${data.userId}`, { headers })
}
// 申请上麦
export function applySpeak(data: { roomId: string; userId: string }) {
  return instance.get(`/voice/room/apply/speak?roomId=${data.roomId}&userId=${data.userId}`, { headers })
}
// 闭麦
export function closeSpeak(data: { roomId: string; userId: string }) {
  return instance.get(`/voice/room/close/speak?roomId=${data.roomId}&userId=${data.userId}`, { headers })
}
// 闭麦其他用户（只能房主使用）
export function closeSpeakByOwner(data: { roomId: string; userId: string }) {
  return instance.get(`/voice/room/close/speak/${data.userId}`, { headers })
}
// 开麦其他用户（只能房主使用）
export function openSpeakByOwner(data: { roomId: string; userId: string }) {
  return instance.get(`/voice/room/open/speak/${data.userId}`, { headers })
}
// 下麦
export function downSpeak(data: { roomId: string; userId: string }) {
  return instance.get(`/voice/room/down/speak?roomId=${data.roomId}&userId=${data.userId}`, { headers })
}
// 踢出语音房
export function kickOut(data: { roomId: string; userIds: string[] }) {
  return instance.post(`/voice/room/kick`, data, { headers })
}
// 查询语音房信息
export function getVoiceRoomInfo(data: { roomId: string }) {
  return instance.get(`/voice/room/query/info?roomId=${data.roomId}`, { headers })
}
// 语音房在线用户
export function getRoomUser(data: { roomId: string; page: number; size: number; nickname?: string }) {
  return instance.get(
    `/voice/room/online/user?roomId=${data.roomId}&page=${data.page}&size=${data.size}&nickname=${data.nickname ?? ''}`,
    { headers }
  )
}
// 增加热度
export function addHeat(data: { roomId: string; count: number }) {
  return instance.get(`/voice/room/add/heat?roomId=${data.roomId}&count=${data.count}`, { headers })
}
// 查询上麦申请
export function getApplyList(data: { roomId: string }) {
  return instance.get(`/voice/room/apply/list?roomId=${data.roomId}`)
}
// 审批上麦申请
export function approvalApply(data: { roomId: string; userId: string; approval: string }) {
  return instance.get(
    `/voice/room/approval/speak?roomId=${data.roomId}&userId=${data.userId}&approval=${data.approval}`,
    { headers }
  )
}
// 离开房间
export function leaveRoom(data: { roomId: string; userId: string }) {
  return instance.get(`/voice/room/leave?roomId=${data.roomId}&userId=${data.userId}`, { headers })
}
// 更新房间
export function updateRoom(data: {
  roomId: string
  title: string
  note: string
  secret: string
  backgroundImgId: string
  gameType: string
  serialPeriodNo: string
}) {
  return instance.post(`/voice/room/update`, data, { headers })
}

// 邀请加入聊天室
export function invite(data: {
  invitedUserIds: string[]
  roomId: string
  type: string
  title: string
  userNum: number
  upSpeak: 0 | 1 //是否邀请上麦 0 否 1 是
}) {
  return interceptorChain()
    .clientIdRequest()
    .authRequest()
    .loginRedirect('ask-back-login')
    .tokenRefreshResponse('ask-back-login')
    .instance.post(`/chat/invite`, data)
}
// 随机获取聊天室名称
export function randomRoomName(type: 'CHAT' | 'VOICE') {
  return instance.get(`/voice/room/randomRoomName?type=${type}`)
}
