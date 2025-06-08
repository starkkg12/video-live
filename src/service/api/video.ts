import { uploadInstance } from '../utils/instance'

/**
 * 视频创建参数
 */
export interface CreateVideoParams {
  title: string
  description: string
  videoPath: string
  poster: string
  preview: string
  duration: number
  size: number
  userId: string
  resolution: string
  bitrate: string
  encoding: string
  language: string
  hasComments: boolean
  hasBarrages: boolean
  hasListening: boolean
  isPublic: boolean
  tags: string[]
}

/**
 * 创建视频
 *
 * @param data 视频创建参数
 * @returns Promise 包含创建结果
 */
export function createVideo(data: CreateVideoParams) {
  return uploadInstance.post(`/api/videos`, data)
}

// 获取视频详情
export function getVideoDetail(id: string) {
  return uploadInstance.get(`/api/videos/${id}`)
}

// 获取标签
export function getTags() {
  return uploadInstance.get(`/api/tags`, { params: { isActive: true } })
}

// 获取视频下载链接
export function getVideoDownloadLink(id: string) {
  return uploadInstance.get(`/api/videos/${id}/download`)
}

// 下载视频
export function downloadVideo(downloadUrl: string) {
  return fetch(downloadUrl, { mode: 'cors' })
}

// 审核视频
export function auditVideo(
  id: string,
  data: {
    auditStatus: number
    auditPersonId: string
    auditPersonName: string
  }
) {
  return uploadInstance.post(`/api/videos/${id}/audit`, data, {
    headers: {
      'X-Api-Key': 'a44fbda7a0d1625caebdd3f7c4179e40',
    },
  })
}
