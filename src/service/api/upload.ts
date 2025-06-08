import { videoApiInstance, uploadInstance } from '../utils/instance';



/**
 * 初始化上传
 * 
 * @param data 上传初始化数据
 * @returns Promise 包含上传会话信息
 */
export function initializeUpload(data: {
  filename: string;
  fileSize: number;
  mimeType: string;
  tag: string;
  path: string;
  chunkSize: number;
}) {
  return uploadInstance.post(`/api/upload/initialize`, data);
}

/**
 * 上传视频分片
 * 
 * @param data 分片数据
 * @returns Promise 包含分片上传结果
 */
export function uploadVideoPart(data: {
  sessionId: string;
  partNumber: number;
  chunk: string;
}) {
  return uploadInstance.post(
    `/api/upload/part/${data.sessionId}/${data.partNumber}`,
    data.chunk
  );
}

/**
 * 完成视频上传
 * 
 * @param data 上传会话ID
 * @returns Promise 包含上传完成结果
 */
export function finalizeUpload(data: { sessionId: string }) {
  return uploadInstance.post(`/api/upload/finalize`, { sessionId: data.sessionId });
} 