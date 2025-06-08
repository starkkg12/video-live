<template>
  <NavBar safe-area-inset-top placeholder class="nav-bar" title="选择图纸">
    <template #right>
      <van-icon name="cross" size="24" color="#434343" @click="emit('close')" />
    </template>
  </NavBar>
  <div class="interactive-picture height-without-nav-bar">
    <PicturePicker
      :selectedGame="selectedGame"
      :selectedYear="selectedYear"
      :selectedSeries="selectedSeries"
      :selectedPicture="selectedPicture"
      @on-select="handleSelectPicture"
      scene="in-room"
    />
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed } from 'vue'
  import { Icon as VanIcon, NavBar } from 'vant'
  import PicturePicker from './_PicturePicker.vue'
  import utils from '@/utils'
  import service from '@/service'

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
  const selectedGame = ref<any>({
    gameType: props.room.info.value.gameType,
    gameTypeCode: utils.getGameByTypeOrCode({ gameType: props.room.info.value.gameType })?.gameTypeCode,
  })
  const selectedYear = ref<number>(props.room.info.value.gameReleaseYear)
  const selectedSeries = ref<any>({
    seriesCode: props.room.info.value.gameSerialNo,
  })
  const selectedPicture = computed(() => ({
    issueId: props.room.info.value.issueId,
    issue: props.room.info.value.serialPeriodNo,
    imgPath: props.room.info.value.backgroundImg !== '/' ? props.room.info.value.backgroundImg : '',
  }))

  const handleSelectPicture = (data: any) => {
    utils
      .chain()
      .fetch(
        service.room.updateRoom,
        {
          roomId: props.room.id.value,
          type: props.room.type.value,
          title: props.room.info.value.title,
          note: props.room.info.value.note,
          backgroundImg: data.selectedPicture?.imgPath ?? '/',
          gameType: data.selectedGame?.gameType ?? '',
          gameSerialNo: data.selectedPicture?.seriesCode ?? '',
          gameReleaseYear: data.selectedPicture?.year,
          serialPeriodNo: data.selectedPicture?.issue ?? '',
          issueId: data.selectedPicture?.issueId ?? '',
        },
        '选择图纸成功'
      )
      .next(() => {
        emit('close', 'all')
      })
  }
</script>

<style scoped lang="less">
  @import '@/styles/variables.less';

  .interactive-picture {
    background-color: #fff;
  }
</style>
