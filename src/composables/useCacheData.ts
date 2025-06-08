import { ref, type Ref } from 'vue'
import service from '@/service'
import utils from '@/utils'

export interface CacheDataInterface {
  usersDictionary: Ref<any>
  addUsersDictionary: (userIds: string[]) => void
  addUsersDictionaryNow: (userIds: string[]) => Promise<void>
  usersRelationDictionary: Ref<any>
  addUsersRelationDictionary: (userIds: string[]) => void
  seriesByGameTypeDictionary: Ref<any>
  addSeriesByGameTypeDictionary: (gameType: string) => void
}

export function useCacheData(): CacheDataInterface {
  const cacheUserIds: Record<string, any> = {}
  const timers: Record<string, any> = {}

  const usersDictionary = ref<any>({})
  const usersRelationDictionary = ref<any>({})
  const seriesByGameTypeDictionary = ref<any>({})

  const lazyFetch = (type: string, dictionary: Record<string, any>, userIds: string[], fetchFn: any) => {
    cacheUserIds[type] = [...(cacheUserIds[type] ?? []), ...userIds]
    timers[type] && clearTimeout(timers[type])
    timers[type] = setTimeout(async () => {
      const lazyUserIds = [...new Set([...cacheUserIds[type]])].filter((id: string) => !dictionary[id])
      cacheUserIds[type] = []
      if (lazyUserIds.length === 0) return
      fetchFn(lazyUserIds)
    }, 100)
  }

  const addUsersDictionary = async (userIds: string[]) =>
    lazyFetch('users', usersDictionary.value, userIds, async (lazyUserIds: string[]) => {
      addUsersDictionaryNow(lazyUserIds)
    })

  const addUsersDictionaryNow = async (userIds: string[]) => {
    const response = await service.user.getBatchUsersList(userIds)
    if (response.data.errCode === '0') {
      const newDictionary: Record<string, any> = {}
      response.data.data.map((item: any) => {
        newDictionary[item.userId] = item
      })
      usersDictionary.value = { ...usersDictionary.value, ...newDictionary }
    }
  }

  const addUsersRelationDictionary = async (userIds: string[]) =>
    lazyFetch('relation', usersRelationDictionary.value, userIds, async (lazyUserIds: string[]) => {
      const response = await service.user.getBatchRelationship({ targetUserIdList: lazyUserIds, direct: '1' })
      if (response.data.errCode === '0') {
        const newDictionary: Record<string, any> = {}
        response.data.data.map(({ targetUserId, relationFlag }: { targetUserId: string; relationFlag: string }) => {
          newDictionary[targetUserId] = {
            relationFlag,
            relationText: relationFlag === '1' ? '已关注' : relationFlag === '2' ? '互相关注' : '',
          }
        })
        usersRelationDictionary.value = { ...usersRelationDictionary.value, ...newDictionary }
      }
    })

  const addSeriesByGameTypeDictionary = async (gameType: string) => {
    if (!gameType || !!seriesByGameTypeDictionary.value[gameType]) return
    seriesByGameTypeDictionary.value = { ...seriesByGameTypeDictionary.value, [gameType]: [] }
    const response = await service
      .kv()
      .getSerialList(utils.getGameByType(gameType)?.gameTypeCode ?? '')
      .do()
    seriesByGameTypeDictionary.value = { ...seriesByGameTypeDictionary.value, [gameType]: response[0]?.data }
  }

  return {
    usersDictionary,
    addUsersDictionary,
    addUsersDictionaryNow,
    usersRelationDictionary,
    addUsersRelationDictionary,
    seriesByGameTypeDictionary,
    addSeriesByGameTypeDictionary,
  }
}
