import interceptorChain from './interceptorChain'

const instance = interceptorChain(import.meta.env.PUBLIC_VIDEO_UPLOAD_URL)
  .clientIdRequest()
  .manageSiteIdRequest()
  .authRequest("jwt").instance;

// 取得总视频、今日新增、创作者、主播數字
export function getStastics() {
  return instance.get(`/api/topic/stastics`);
}

export function getSuggestions(params: {page: number, pageSize: number}) {
    return interceptorChain(import.meta.env.PUBLIC_VIDEO_UPLOAD_URL)
        .clientIdRequest().instance.get(`/api/topic/search-suggestions`, { params });
}

export function getTagPopularityList(params: {sortBy: string | null, page: number, pageSize: number}) {
    return instance.get(`/api/topic/tag-popularitys`, { params });
}

export function getTopList(params: {pageSize: number}) {
    return instance.get(`/api/topic/topList`, { params });
}