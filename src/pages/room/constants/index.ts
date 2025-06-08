export interface RoomInterface {
  roomId: string
  userId: string
  title: string
  note: string
  userNum: number
  gameType: string
  gameSerialNo: string
  upUserList: string[]
  onlineUserList?: string[]
  createTime?: number
}
