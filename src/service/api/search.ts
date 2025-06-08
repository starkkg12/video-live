import interceptorChain from '../interceptorChain'

const instance = interceptorChain(import.meta.env.PUBLIC_VIDEO_UPLOAD_URL)
  .clientIdRequest()
  .manageSiteIdRequest()
  .authRequest("jwt").instance;
export interface dateFilterObj {
  beginTime: string | null
  endTime: string | null
}
export function getSearchVideo(
    scrollId: string | number | null, 
    searchType: string,
    keyword: string | null,
    sortStrategy: number | null,
    selectedTagIds: Array<any>,
    selectUserIds: Array<number|boolean>,
    dateFilterObj: dateFilterObj
 ) {
    if (searchType === null) {
        return Promise.reject(new Error('type 不能為 null'))
    }
    const payload: Record<string, any> = {  }
    payload.searchType = searchType
    if (scrollId === null) {
      payload.keyword = keyword
    } else {
      payload.scrollId = scrollId
    }
    if (sortStrategy !== null) {
      payload.sortStrategy = sortStrategy
    } 
    if (selectedTagIds.length > 0) {
      payload.tags = selectedTagIds;
    }
    const validUserIds = selectUserIds.filter(
      (id): id is number => typeof id === 'number' && id !== null
    )
    if (selectUserIds[0] === true) {
      payload.followingOnly = true
    }
    if (validUserIds.length > 0) {
      payload.userIdList = validUserIds
    }
    if (dateFilterObj !== null && dateFilterObj.beginTime !== null) {
      payload.beginTime = dateFilterObj.beginTime
      payload.endTime = dateFilterObj.endTime
    }
    return instance.post(`${import.meta.env.PUBLIC_VIDEO_UPLOAD_URL}/api/search`, payload)
}

export function getSearchCreatorOrStreamer(
  searchType: string,
  keyword: string | null,
  page: number,
  pageSize: number
) {
  if (searchType === null) {
      return Promise.reject(new Error('type 不能為 null'))
  }
  const payload: Record<string, any> = { 
    searchType: searchType,
    keyword: keyword,
    page: page,
    pageSize: pageSize
  }
  return instance.post(`${import.meta.env.PUBLIC_VIDEO_UPLOAD_URL}/api/search`, payload)
}
export interface searchAuthorPayload {
  nickname: string
  /** 页码，默认为 1 */
  page?: number;
  /** 每页条数，默认为 10，最大 100 */
  size?: number;
} 
export function getSearchAuthor(
  payload: searchAuthorPayload
) {
  return instance.post(`${import.meta.env.PUBLIC_BIZ_URL}/search/user/query`, payload)
}  