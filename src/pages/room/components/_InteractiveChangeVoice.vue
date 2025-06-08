<template>
  <!-- 男变女声，女变成男声，御姐音，萝莉音，大叔音，低沉音，机器人音 -->
  <NavBar safe-area-inset-top placeholder class="nav-bar" title="变声">
    <template #right>
      <van-icon name="cross" size="24" color="#434343" @click="emit('close')" />
    </template>
  </NavBar>
  <div class="interactive-change-voice">
    <div :class="{ actived: !room.voiceEffect.value || room.voiceEffect.value === 'normal' }">
      <SvgIcon
        :icon="IconVoiceNormal.src"
        :color="!room.voiceEffect.value || room.voiceEffect.value === 'normal' ? '#34C759' : '#ccc'"
        @click="changeVoice('normal')"
        size="36"
      />
      <span>原声</span>
    </div>
    <div :class="{ actived: room.voiceEffect.value === 'female' }">
      <SvgIcon
        :icon="IconVoiceFemale.src"
        :color="room.voiceEffect.value === 'female' ? '#34C759' : '#ccc'"
        @click="changeVoice('female')"
        size="36"
      />
      <span>男变女声</span>
    </div>
    <div :class="{ actived: room.voiceEffect.value === 'male' }">
      <SvgIcon
        :icon="IconVoiceMale.src"
        :color="room.voiceEffect.value === 'male' ? '#34C759' : '#ccc'"
        @click="changeVoice('male')"
        size="36"
      />
      <span>女变男声</span>
    </div>
    <div :class="{ actived: room.voiceEffect.value === 'robot' }">
      <SvgIcon
        :icon="IconVoiceRobot.src"
        :color="room.voiceEffect.value === 'robot' ? '#34C759' : '#ccc'"
        @click="changeVoice('robot')"
        size="36"
      />
      <span>机器人</span>
    </div>
    <div :class="{ actived: room.voiceEffect.value === 'matureFemale' }">
      <SvgIcon
        :icon="IconVoiceMatureFemale.src"
        :color="room.voiceEffect.value === 'matureFemale' ? '#34C759' : '#ccc'"
        @click="changeVoice('matureFemale')"
        size="36"
      />
      <span>御姐音</span>
    </div>
    <div :class="{ actived: room.voiceEffect.value === 'loli' }">
      <SvgIcon
        :icon="IconVoiceLoli.src"
        :color="room.voiceEffect.value === 'loli' ? '#34C759' : '#ccc'"
        @click="changeVoice('loli')"
        size="36"
      />
      <span>萝莉音</span>
    </div>
    <div :class="{ actived: room.voiceEffect.value === 'uncle' }">
      <SvgIcon
        :icon="IconVoiceUncle.src"
        :color="room.voiceEffect.value === 'uncle' ? '#34C759' : '#ccc'"
        @click="changeVoice('uncle')"
        size="36"
      />
      <span>大叔音</span>
    </div>
    <div :class="{ actived: room.voiceEffect.value === 'deep' }">
      <SvgIcon
        :icon="IconVoiceDeep.src"
        :color="room.voiceEffect.value === 'deep' ? '#34C759' : '#ccc'"
        @click="changeVoice('deep')"
        size="36"
      />
      <span>低沉音</span>
    </div>
    <!-- <div :class="{ actived: room.voiceEffect.value === 'highPitch' }">
      <SvgIcon
        :icon="IconVoiceRobot.src"
        :color="room.voiceEffect.value === 'highPitch' ? '#34C759' : '#ccc'"
        @click="changeVoice('highPitch')"
        size="36"
      />
      <span>高音</span>
    </div>
    <div :class="{ actived: room.voiceEffect.value === 'lowPitch' }">
      <SvgIcon
        :icon="IconVoiceRobot.src"
        :color="room.voiceEffect.value === 'lowPitch' ? '#34C759' : '#ccc'"
        @click="changeVoice('lowPitch')"
        size="36"
      />
      <span>低音</span>
    </div>
    <div :class="{ actived: room.voiceEffect.value === 'echo' }">
      <SvgIcon
        :icon="IconVoiceRobot.src"
        :color="room.voiceEffect.value === 'echo' ? '#34C759' : '#ccc'"
        @click="changeVoice('echo')"
        size="36"
      />
      <span>回音</span>
    </div> -->
    <div :class="{ actived: room.voiceEffect.value === 'chiling' }">
      <SvgIcon
        :icon="IconVoiceRobot.src"
        :color="room.voiceEffect.value === 'chiling' ? '#34C759' : '#ccc'"
        @click="changeVoice('chiling')"
        size="36"
      />
      <span>林志玲音(测)</span>
    </div>
    <div :class="{ actived: room.voiceEffect.value === 'softFemale' }">
      <SvgIcon
        :icon="IconVoiceRobot.src"
        :color="room.voiceEffect.value === 'softFemale' ? '#34C759' : '#ccc'"
        @click="changeVoice('softFemale')"
        size="36"
      />
      <span>温柔女声(测)</span>
    </div>
    <div :class="{ actived: room.voiceEffect.value === 'taiwanJiejie' }">
      <SvgIcon
        :icon="IconVoiceRobot.src"
        :color="room.voiceEffect.value === 'taiwanJiejie' ? '#34C759' : '#ccc'"
        @click="changeVoice('taiwanJiejie')"
        size="36"
      />
      <span>台湾姐姐音(测)</span>
    </div>
    <div :class="{ actived: room.voiceEffect.value === 'angelicEthereal' }">
      <SvgIcon
        :icon="IconVoiceRobot.src"
        :color="room.voiceEffect.value === 'angelicEthereal' ? '#34C759' : '#ccc'"
        @click="changeVoice('angelicEthereal')"
        size="36"
      />
      <span>天使女声(测)</span>
    </div>
    <div :class="{ actived: room.voiceEffect.value === 'maleBroadcaster' }">
      <SvgIcon
        :icon="IconVoiceRobot.src"
        :color="room.voiceEffect.value === 'maleBroadcaster' ? '#34C759' : '#ccc'"
        @click="changeVoice('maleBroadcaster')"
        size="36"
      />
      <span>广播员(测)</span>
    </div>
    <div :class="{ actived: room.voiceEffect.value === 'matureMale' }">
      <SvgIcon
        :icon="IconVoiceRobot.src"
        :color="room.voiceEffect.value === 'matureMale' ? '#34C759' : '#ccc'"
        @click="changeVoice('matureMale')"
        size="36"
      />
      <span>成熟稳重(测)</span>
    </div>
    <div :class="{ actived: room.voiceEffect.value === 'youngSpiritedMale' }">
      <SvgIcon
        :icon="IconVoiceRobot.src"
        :color="room.voiceEffect.value === 'youngSpiritedMale' ? '#34C759' : '#ccc'"
        @click="changeVoice('youngSpiritedMale')"
        size="36"
      />
      <span>年轻活力(测)</span>
    </div>
    <div :class="{ actived: room.voiceEffect.value === 'youngHandsomeMale' }">
      <SvgIcon
        :icon="IconVoiceRobot.src"
        :color="room.voiceEffect.value === 'youngHandsomeMale' ? '#34C759' : '#ccc'"
        @click="changeVoice('youngHandsomeMale')"
        size="36"
      />
      <span>年轻帅气(测)</span>
    </div>
    <div :class="{ actived: room.voiceEffect.value === 'kanaHanazawa' }">
      <SvgIcon
        :icon="IconVoiceRobot.src"
        :color="room.voiceEffect.value === 'kanaHanazawa' ? '#34C759' : '#ccc'"
        @click="changeVoice('kanaHanazawa')"
        size="36"
      />
      <span>花泽香菜音(测)</span>
    </div>
    <div :class="{ actived: room.voiceEffect.value === 'mamoruMiyano' }">
      <SvgIcon
        :icon="IconVoiceRobot.src"
        :color="room.voiceEffect.value === 'mamoruMiyano' ? '#34C759' : '#ccc'"
        @click="changeVoice('mamoruMiyano')"
        size="36"
      />
      <span>宫野真守音(测)</span>
    </div>
    <div :class="{ actived: room.voiceEffect.value === 'hiroshiKamiya' }">
      <SvgIcon
        :icon="IconVoiceRobot.src"
        :color="room.voiceEffect.value === 'hiroshiKamiya' ? '#34C759' : '#ccc'"
        @click="changeVoice('hiroshiKamiya')"
        size="36"
      />
      <span>神谷浩史音(测)</span>
    </div>
    <div :class="{ actived: room.voiceEffect.value === 'yukiKaji' }">
      <SvgIcon
        :icon="IconVoiceRobot.src"
        :color="room.voiceEffect.value === 'yukiKaji' ? '#34C759' : '#ccc'"
        @click="changeVoice('yukiKaji')"
        size="36"
      />
      <span>梶裕贵音(测)</span>
    </div>
    <div :class="{ actived: room.voiceEffect.value === 'saoriHayami' }">
      <SvgIcon
        :icon="IconVoiceRobot.src"
        :color="room.voiceEffect.value === 'saoriHayami' ? '#34C759' : '#ccc'"
        @click="changeVoice('saoriHayami')"
        size="36"
      />
      <span>早见沙织音(测)</span>
    </div>
    <div :class="{ actived: room.voiceEffect.value === 'daisukeOno' }">
      <SvgIcon
        :icon="IconVoiceRobot.src"
        :color="room.voiceEffect.value === 'daisukeOno' ? '#34C759' : '#ccc'"
        @click="changeVoice('daisukeOno')"
        size="36"
      />
      <span>小野大辅音(测)</span>
    </div>
    <div :class="{ actived: room.voiceEffect.value === 'nanaMizuki' }">
      <SvgIcon
        :icon="IconVoiceRobot.src"
        :color="room.voiceEffect.value === 'nanaMizuki' ? '#34C759' : '#ccc'"
        @click="changeVoice('nanaMizuki')"
        size="36"
      />
      <span>水树奈奈音(测)</span>
    </div>
    <div :class="{ actived: room.voiceEffect.value === 'yoshitsuguMatsuoka' }">
      <SvgIcon
        :icon="IconVoiceRobot.src"
        :color="room.voiceEffect.value === 'yoshitsuguMatsuoka' ? '#34C759' : '#ccc'"
        @click="changeVoice('yoshitsuguMatsuoka')"
        size="36"
      />
      <span>松冈祯丞音(测)</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { Icon as VanIcon, NavBar } from 'vant'
  import SvgIcon from '@/components/SvgIcon.vue'
  import IconVoiceNormal from '@/assets/icons/room/voice_normal.svg'
  import IconVoiceFemale from '@/assets/icons/room/voice_female.svg'
  import IconVoiceMale from '@/assets/icons/room/voice_male.svg'
  import IconVoiceMatureFemale from '@/assets/icons/room/voice_matureFemale.svg'
  import IconVoiceLoli from '@/assets/icons/room/voice_loli.svg'
  import IconVoiceUncle from '@/assets/icons/room/voice_uncle.svg'
  import IconVoiceDeep from '@/assets/icons/room/voice_deep.svg'
  import IconVoiceRobot from '@/assets/icons/room/voice_robot.svg'

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
  const changeVoice = (effect: string) => {
    if (props.room.voiceEffect.value === effect) {
      props.room.custom.value?.changeVoice('normal')
    } else {
      props.room.custom.value?.changeVoice(effect)
    }
  }
</script>

<style scoped lang="less">
  @text-secondary: #656565;
  @text-actived: #34c759;
  .interactive-change-voice {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    flex-wrap: wrap;
    max-height: 70vh;
    overflow-y: auto;
    & > div {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: @text-secondary;
      width: 22%;
      &.actived {
        color: @text-actived;
      }
      span {
        white-space: nowrap;
        text-overflow: ellipsis;
        max-width: 80px;
        overflow: hidden;
      }
    }
  }
</style>
