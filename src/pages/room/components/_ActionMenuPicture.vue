<template>
  <NavBar safe-area-inset-top placeholder class="nav-bar" title="选择图纸">
    <template #right>
      <van-icon name="cross" size="24" color="#434343" @click="emit('close')" />
    </template>
  </NavBar>
  <div class="interactive-picture height-without-nav-bar">
    <PicturePicker :selectedGame="selectedGame" @on-select="handleSelectItems" scene="in-room" :selected-max="6" />
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue'
  import PicturePicker from './_PicturePicker.vue'
  import utils from '@/utils'
  import { NavBar, Icon as VanIcon } from 'vant'

  const props = withDefaults(
    defineProps<{
      room: any
    }>(),
    {
      room: null,
    }
  )
  const emit = defineEmits<{
    close: [type?: 'all']
  }>()
  const selectedGame = ref<any>(utils.getGameByTypeOrCode({ gameType: '2032' }))

  const handleSelectItems = ({
    selectedItems,
  }: {
    selectedItems: {
      issueId: string
      imgPath: string
      newspaperName: string
      seriesName: string
      likeCount: string
    }[]
  }) => {
    if (!selectedItems.length) return
    handleSend([...selectedItems])
    emit('close', 'all')
  }

  const handleSend = (items: any[]) => {
    const item = items.shift()
    if (!item) return
    const { issueId, imgPath, newspaperName, seriesName, likeCount } = item
    if (!imgPath) return
    props.room.wsClient.value.sendText(
      JSON.stringify({
        issueId,
        imgUrl: imgPath,
        newsPaperName: newspaperName,
        seriesName,
        likeCount,
      }),
      3
    )
    setTimeout(() => handleSend(items), 100)
  }
</script>

<style scoped lang="less">
  .interactive-picture {
    background-color: #fff;
  }
</style>
