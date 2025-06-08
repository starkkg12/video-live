import { ref, type Ref } from 'vue'

export interface FetchListInterface {
  fetchFn: (params: any) => any
  fetchParams?: any
  isNew?: boolean
  size?: number
  isKv?: boolean
  kvDataKey?: string
}

export interface UseFetchListDataInterface<T = any> {
  listData: Ref<T[] | undefined>
  listPage: Ref<number>
  listTotal: Ref<number>
  isLoading: Ref<boolean>
  isFinished: Ref<boolean>
  isError: Ref<boolean>
  fetchList: (config: FetchListInterface) => Promise<any[]>
}

export function useFetchListData<T = any>(): UseFetchListDataInterface<T> {
  const listData = ref<T[]>()
  const listPage = ref<number>(1)
  const listTotal = ref<number>(0)
  const isLoading = ref<boolean>(false)
  const isFinished = ref<boolean>(false)
  const isError = ref<boolean>(false)

  const fetchList = async ({
    fetchFn,
    fetchParams,
    size = 10,
    isNew = false,
    isKv = false,
    kvDataKey = 'data',
  }: FetchListInterface) => {
    if (isNew === true || isKv) {
      listPage.value = 1
      isFinished.value = false
    } else if (isFinished.value) {
      return
    }

    isLoading.value = true

    let newData = []

    if (!isKv) {
      const response = await fetchFn({
        ...fetchParams,
        page: listPage.value,
        size,
      })
      if (response.data.errCode === '0') {
        newData = response.data.data.list ?? []
        listTotal.value = response.data.data.total
        listPage.value += 1
      } else {
        isError.value = true
      }
      listData.value = isNew === true || !listData.value ? newData : [...listData.value, ...newData]
      isFinished.value = newData.length < size || response.data.errCode !== '0'
    } else {
      const response = await fetchFn(fetchParams).do()
      if (response[0]) {
        newData = response[0][kvDataKey] || []
        listData.value = newData
        listTotal.value = newData.length
      } else {
        isError.value = true
      }
      isFinished.value = true
    }

    isLoading.value = false

    return newData
  }

  return {
    listData,
    listPage,
    listTotal,
    isLoading,
    isFinished,
    isError,
    fetchList,
  }
}
