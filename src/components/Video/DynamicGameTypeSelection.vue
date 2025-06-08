<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { showDialog, showLoadingToast, closeToast, Popup, Cell } from 'vant'
import service from '@/service'
import utils from '@/utils'
import constants from '@/constants'
import dayjs from 'dayjs'

export interface GameTypeItem {
  areaCode: string
  gameType: string
  gameTypeCode: string
  gameTypeLongName: string
  gameTypeName: string
  gameTypeShortName: string
  isAutoConfirm: string
  sortNum: string
  nextIssueTime?: string
}

const props = defineProps({
  selectedGameTypeCode: {
    type: String,
    default: '',
  },
})

const gameTypes = ref<GameTypeItem[]>([])
const isVisible = ref(false)
const loading = ref(false)
const selectedGame = ref<GameTypeItem | null>(null)

const emit = defineEmits(['tab-click-get-item'])

const toggleVisible = () => {
  isVisible.value = !isVisible.value
}

const selectGame = (game: GameTypeItem) => {
  selectedGame.value = game
  utils.setLSItem(constants.localStorageKeys.GAME_TYPE, game.gameType)
  utils.setLSItem(constants.localStorageKeys.GAME_TYPE_CODE, game.gameTypeCode)
  emit('tab-click-get-item', {
    gameType: game.gameType,
    gameTypeCode: game.gameTypeCode,
    gameTypeName: game.gameTypeShortName,
  })
  isVisible.value = false
}

const loadGameTypes = async () => {
  loading.value = true
  showLoadingToast({
    message: '加载中...',
    forbidClick: true,
  })

  try {
    const response = await service.kv().getGamePlatform().do()
    if (response[0] === null) {
      showDialog({ title: '错误', message: '获取游戏平台失败' })
      return
    }

    gameTypes.value = response[0].data

    // 加载每个游戏的下一期开奖信息
    await Promise.all(
      gameTypes.value.map(async item => {
        try {
          const res = await service.kv().getGameIssueNextIssueInfo(item.gameTypeCode).do()
          item.nextIssueTime = dayjs(res[0].nextOpenTime).format('YYYY年MM月DD日 HH:mm')
        } catch (error) {
          console.error(`获取 ${item.gameTypeShortName} 下一期信息失败`, error)
        }
        return item
      })
    )

    // 如果有传入selectedGameTypeCode，则选中对应游戏
    if (props.selectedGameTypeCode) {
      const selected = gameTypes.value.find(
        item => item.gameTypeCode === props.selectedGameTypeCode
      )
      if (selected) {
        selectedGame.value = selected
      }
    }
    // 否则使用本地存储的或第一个游戏
    else {
      const storedGameTypeCode = utils.getLSItem(constants.localStorageKeys.GAME_TYPE_CODE)
      if (storedGameTypeCode) {
        const storedGame = gameTypes.value.find(item => item.gameTypeCode === storedGameTypeCode)
        if (storedGame) {
          selectGame(storedGame)
        }
      }

      if (!selectedGame.value && gameTypes.value.length > 0) {
        selectGame(gameTypes.value[0])
      }
    }
  } catch (error) {
    console.error('获取游戏平台失败', error)
    showDialog({ title: '错误', message: '网络异常，请重试' })
  } finally {
    loading.value = false
    closeToast()
  }
}

onMounted(() => {
  loadGameTypes()
})
</script>

<template>
  <div class="game-type-selection">
    <div class="selected-game" @click="toggleVisible">
      <span class="label current-text-color">游戏类型：</span>
      <span class="value">{{ selectedGame?.gameTypeShortName || '请选择' }}</span>
      <span class="material-icons">{{ isVisible ? 'expand_less' : 'expand_more' }}</span>
    </div>

    <Popup
      v-model:show="isVisible"
      position="bottom"
      round
      :style="{ maxHeight: '80%' }"
      closeable
      teleport="body"
    >
      <Cell title="选择游戏类型" />
      <div class="game-list">
        <div
          v-for="game in gameTypes"
          :key="game.gameTypeCode"
          class="game-item"
          :class="{ active: selectedGame?.gameTypeCode === game.gameTypeCode }"
          @click="selectGame(game)"
        >
          <div class="game-name">{{ game.gameTypeShortName }}</div>
          <div class="next-time-info">
            <div class="next-time-title">下一期开奖时间</div>
            <div class="next-time">{{ game.nextIssueTime || '加载中...' }}</div>
          </div>
        </div>
      </div>
    </Popup>
  </div>
</template>

<style scoped lang="less">
.game-type-selection {
  padding: 0 16px;
  margin-bottom: 20px;
  position: relative;
}

.selected-game {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #ccc;

  .label {
    font-weight: bold;
    font-size: 14px;
  }

  .value {
    flex: 1;
    color: #07c160;
    margin-left: 5px;
    font-size: 14px;
  }

  .material-icons {
    font-size: 24px;
    color: #07c160;
  }
}

.popup-title {
  text-align: center;
  font-size: 16px;
  font-weight: bold;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.game-list {
  padding: 16px;
  overflow-y: auto;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.game-item {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  transition: all 0.3s;

  &.active {
    background-color: #07c160;
    color: white;
  }

  .game-name {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 5px;
  }

  .next-time-info {
    font-size: 14px;

    .next-time-title {
      margin-bottom: 3px;
    }
  }
}
</style>
