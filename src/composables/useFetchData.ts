import { ref, type Ref } from 'vue'

export interface FetchDataInterface {
  fetchFn: (params: any) => Promise<any>
  fetchParams: any
  openCache?: boolean
}

export interface UseFetchDataInterface<T = any> {
  data: Ref<T | undefined>
  isLoading: Ref<boolean>
  fetchData: (config: FetchDataInterface) => Promise<any>
}

export function useFetchData<T = any>(): UseFetchDataInterface<T> {
  const data = ref<T>()
  const isLoading = ref<boolean>(false)
  const allCacheData = ref<Record<string, any>>({})

  const fetchData = async ({ fetchFn, fetchParams, openCache }: FetchDataInterface) => {
    isLoading.value = true
    const cacheKey = `${JSON.stringify(fetchParams)}`
    const response =
      openCache && allCacheData.value[cacheKey]
        ? allCacheData.value[cacheKey]
        : await fetchFn(fetchParams)

    if (openCache && !allCacheData.value[cacheKey]) {
      allCacheData.value[cacheKey] = response
    }

    if (response.data.success || response.data.errorMessage === 'Success') {
      data.value = response.data.data
    }
    isLoading.value = false
    return data.value
  }

  return {
    data,
    isLoading,
    fetchData,
  }
}
