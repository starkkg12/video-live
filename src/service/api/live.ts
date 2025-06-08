import type { PaginationParams } from '../types/common'
import { videoApiInstance, uploadInstance } from '../utils/instance'

interface createRoomPayload {
  name: string
  description: string
  owner: string
}
export function createRoom(payload: createRoomPayload) {
  return uploadInstance.post('/api/rooms', payload)
}
export function getLiveData(params: PaginationParams = { page: 1, pageSize: 10 }) {
  return uploadInstance.get('', { params })
}
export function fetchRoomInfo(roomId: string) {
  return uploadInstance.get(`/api/room/${roomId}`)
}
interface liveListDataParams {
  cursor: string | null
  keyword: string | null
  limit: number
}
export function getLiveListData(data: liveListDataParams) {
  let params: any = {}
  if (data.cursor !== null) {
    params.cursor = data.cursor
  }
  if (
    data.keyword !== null && 
    data.keyword.trim() !== ''
  ) {
    params.keyword = data.keyword
  }
  params.limit = data.limit
  return uploadInstance.get('/api/room/list', { params })
}
export function getRoomUser(roomId: string) {
  return uploadInstance.get(`/api/room/${roomId}/viewers`)
}
// 
export function getUserAllLiveLists(data: any) {
  const targetId = data.userId
  let params: any = {}
  if (data.page) {
    params.page = data.page
  }
  if (data.limit) {
    params.limit = data.limit
  }
  params.status = 'all'
  return uploadInstance.get(`/api/room/user/${targetId}/history`, { params })
}
