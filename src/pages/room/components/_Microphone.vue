<script lang="ts" setup>
  import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
  import constants from '@/constants'
  import utils from '@/utils'
  import Janus from 'src/utils/janus/janus.js'
  import service from '@/service'
  import micIcon from '@/assets/icons/room/mic.svg'
  import micBanIcon from '@/assets/icons/room/mic_ban.svg'
  import loadAdapter from '@/utils/janus/loadAdapter'
  import { Button, showToast, Icon as VanIcon, showDialog, Popup as VanPopup } from 'vant'
  import createVoiceChanger from '@/utils/janus/createVoiceChanger'
  import streamsListenerHelper from '@/utils/janus/streamsListenerHelper'
  import { type RoomInterface } from 'src/composables/useRoom'

  const props = withDefaults(
    defineProps<{
      room: RoomInterface
      onlyListen?: boolean
    }>(),
    {
      onlyListen: true,
    }
  )

  const myUserId = ref<string>(utils.getLSItem(constants.localStorageKeys.USER_ID) ?? '')
  const localIsOnMic = ref(false)
  const audio1 = ref<HTMLAudioElement>()
  const audio2 = ref<HTMLAudioElement>()
  const audio3 = ref<HTMLAudioElement>()
  const audio4 = ref<HTMLAudioElement>()
  const localStream = ref<MediaStream>()
  const mutedVoice = ref(true)
  const voiceChanger = ref<any>(null)
  const showOpenMicTips = ref<boolean>(false)
  const reconnectAttempts = ref(0)
  const quicklySwitch = ref<boolean>(false)
  const timerForQuicklySwitch = ref<any>()
  const MAX_RECONNECT_ATTEMPTS = 3
  const RECONNECT_DELAY = 2000

  const params = {
    roomId: props.room?.id.value,
    userId: myUserId.value,
  }
  const getQueryStringValue = (name: string) => {
    name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]')
    let regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
      result = regex.exec(window.location.search)
    return result === null ? '' : decodeURIComponent(result[1].replace(/\+/g, ' '))
  }

  const vcodec = getQueryStringValue('vcodec') !== '' ? getQueryStringValue('vcodec') : null
  const acodec = getQueryStringValue('acodec') !== '' ? getQueryStringValue('acodec') : null
  const doDtx = getQueryStringValue('dtx') === 'yes' || getQueryStringValue('dtx') === 'true'
  const use_msid = getQueryStringValue('msid') === 'yes' || getQueryStringValue('msid') === 'true'
  let doSvc: any = getQueryStringValue('svc')
  if (doSvc === '') doSvc = null
  var feeds: any[] = []
  let feedStreams: any = {}
  let opaqueId: string | null = null
  let remoteFeed: any = null
  let mypvtid: any = null
  let janus: any = null
  let sfutest: any = null

  const sHelper = streamsListenerHelper()
  sHelper.onVoiceChange((data: any) => {
    props.room.setMicVoiceStatus(data)
  })

  const checkIfQuicklySwitch = () => {
    const nextIsOpen = !localIsOnMic.value
    if (quicklySwitch.value) {
      showToast(`请5秒后再${nextIsOpen ? '打开' : '关闭'}麦克风`)
      return true
    }
    quicklySwitch.value = true
    timerForQuicklySwitch.value && clearTimeout(timerForQuicklySwitch.value)
    timerForQuicklySwitch.value = setTimeout(() => {
      quicklySwitch.value = false
    }, 5000)
    return false
  }

  const toggleMic = async (type?: boolean) => {
    if (typeof type !== 'boolean' && checkIfQuicklySwitch()) return
    localIsOnMic.value = typeof type === 'boolean' ? type : !localIsOnMic.value
    if (localIsOnMic.value) {
      openMic()
    } else {
      closeMic()
    }
  }

  const toggleVoice = (type?: boolean) => {
    mutedVoice.value = typeof type === 'boolean' ? !type : !mutedVoice.value

    // 启动所有音频流
    document.querySelectorAll('audio').forEach(audio => {
      if (mutedVoice.value) {
        audio.pause()
      } else {
        audio.play().catch(error => console.warn('音频播放失败:', error))
      }
    })
  }

  const toggleMicStream = async (open: boolean) => {
    if (!open) {
      unpublishAudio()
      toggleVoice(true)
    } else {
      publishAudio()
      toggleVoice(true)
    }
    localIsOnMic.value = open
  }

  const handleJanusError = async (error: any) => {
    console.error('Janus error:', error)
    if (reconnectAttempts.value < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts.value++
      showToast(`连接断开，正在尝试重新连接 (${reconnectAttempts.value}/${MAX_RECONNECT_ATTEMPTS})`)
      await new Promise(resolve => setTimeout(resolve, RECONNECT_DELAY))
      createRoom()
    } else {
      showToast('连接失败，请重新进入房间')
      props.room.leaveRoom()
    }
  }

  const createRoom = async (kickFirst?: boolean) => {
    opaqueId = 'audiobridgetest-' + Janus.randomString(12)

    Janus.init({ debug: 'all' })

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showToast('您的浏览器不支持音频功能，请使用现代浏览器')
      return
    }

    if (props.room.id.value) {
      if (!Janus.isWebrtcSupported()) {
        showToast('您的浏览器不支持WebRTC')
        return
      }

      janus = new Janus({
        server: props.room.config.value.serverUrl,
        iceServers: null,
        apisecret: props.room.config.value.apiSecret,
        // 'subscriber-mode': props.onlyListen,
        success: function () {
          janus.attach({
            plugin: 'janus.plugin.videoroom',
            opaqueId: opaqueId,
            success: function (pluginHandle: any) {
              sfutest = pluginHandle
              registerUsername(kickFirst)
              joinCheck()
              reconnectAttempts.value = 0 // Reset reconnection attempts on success
            },
            error: handleJanusError,
            webrtcState: function (on: any, reason: any) {
              console.log(on, reason, 'webrtcState状态')
            },
            onmessage: function (msg: any, jsep: any) {
              checkDuplicateUserAndRemove(msg)
              const event = msg.videoroom
              event === 'joined' && (mypvtid = msg['private_id'])
              if (event === 'joined' || event === 'event') {
                let list = msg['publishers'] ?? []
                for (let f in list) {
                  if (list[f]['dummy']) continue
                  let id = list[f]['id']
                  let streams = list[f]['streams']
                  let display = list[f]['display']
                  for (let i in streams) {
                    let stream = streams[i]
                    stream['id'] = id
                    stream['display'] = display
                  }
                  feedStreams[id] = streams
                  newRemoteFeed(id, streams)
                  sHelper.addPublisher(list[f])
                }
              }

              if (jsep) {
                sfutest.handleRemoteJsep({ jsep: jsep })
              }
            },
            onremotetrack: function (track: any, mid: any, on: any, metadata: any) {
              console.log(track, mid, on, metadata, 'onremotetrack')
            },
          })
        },
        error: handleJanusError,
      })
    }
  }

  const newRemoteFeed = (id: any, streams: any) => {
    if (!streams) {
      streams = feedStreams[id]
    }
    janus.attach({
      plugin: 'janus.plugin.videoroom',
      opaqueId: opaqueId,
      success: function (pluginHandle: any) {
        remoteFeed = pluginHandle
        remoteFeed.remoteTracks = {}
        remoteFeed.remoteVideos = 0
        remoteFeed.simulcastStarted = false
        remoteFeed.svcStarted = false
        let subscription: Record<string, string>[] = []
        for (let i in streams) {
          let stream: any = streams[i]
          subscription.push({
            feed: stream.id,
            mid: stream.mid,
          })
          remoteFeed.rfid = stream.id
          remoteFeed.rfdisplay = escapeXmlTags(stream.display)
        }
        let subscribe = {
          request: 'join',
          room: props.room.id.value,
          ptype: 'subscriber',
          streams: subscription,
          id: myUserId.value,
          use_msid: use_msid,
          private_id: mypvtid,
        }
        remoteFeed.send({ message: subscribe })
      },
      error: handleJanusError,
      onmessage: function (msg: any, jsep: any) {
        let event = msg['videoroom']
        if (event) {
          if (event === 'attached') {
            for (let i = 1; i < 6; i++) {
              if (!feeds[i]) {
                feeds[i] = remoteFeed
                remoteFeed.rfindex = i
                break
              }
            }
          }
        }
        if (jsep) {
          Janus.debug('Handling SDP as well...', jsep)
          let stereo = jsep.sdp.indexOf('stereo=1') !== -1
          // Answer and attach
          remoteFeed.createAnswer({
            jsep: jsep,
            // We only specify data channels here, as this way in
            // case they were offered we'll enable them. Since we
            // don't mention audio or video tracks, we autoaccept them
            // as recvonly (since we won't capture anything ourselves)
            tracks: [{ type: 'data' }],
            customizeSdp: function (jsep: any) {
              if (stereo && jsep.sdp.indexOf('stereo=1') == -1) {
                // Make sure that our offer contains stereo too
                jsep.sdp = jsep.sdp.replace('useinbandfec=1', 'useinbandfec=1;stereo=1')
              }
            },
            success: function (jsep: any) {
              Janus.debug('Got SDP!', jsep)
              let body = { request: 'start', room: props.room.id.value }
              remoteFeed.send({ message: body, jsep: jsep })
            },
            error: handleJanusError,
          })
        }
      },
      onremotetrack: async function (track: any, mid: any) {
        if (track.kind === 'audio') {
          addNewTrack(remoteFeed, track, remoteFeed.rfid)
        }
      },
    })
  }

  const addNewTrack = (remoteFeed: any, track: any, id: any) => {
    // 如果该 id 已经存在，先停止旧的音频流
    const runningAudio: HTMLAudioElement | undefined = [audio1.value, audio2.value, audio3.value, audio4.value].find(
      (item: any) => item.id === id
    )
    if (runningAudio) {
      runningAudio.id = ''
      runningAudio.srcObject = null
    }

    const idleAudio: HTMLAudioElement | undefined = [audio1.value, audio2.value, audio3.value, audio4.value].find(
      (item: any) => !item.srcObject
    )

    if (!idleAudio) return

    const stream = new MediaStream([track])
    idleAudio.id = id
    idleAudio.srcObject = stream
    idleAudio.autoplay = true
    remoteFeed.remoteTracks[id] = { stream }

    !mutedVoice.value && sHelper.addVoiceListener({ stream, id })
  }

  const escapeXmlTags = (value: any) => {
    if (value) {
      let escapedValue = value.replace(new RegExp('<', 'g'), '&lt')
      escapedValue = escapedValue.replace(new RegExp('>', 'g'), '&gt')
      return escapedValue
    }
  }

  const publishAudio = async () => {
    if (!localStream.value) {
      try {
        localStream.value = await navigator.mediaDevices.getUserMedia({ audio: true })
        voiceChanger.value = createVoiceChanger(localStream.value)
        sHelper.addVoiceListener({ stream: localStream.value, userId: myUserId.value })
      } catch (error) {
        showToast('无法访问麦克风，请检查权限设置')
        return
      }
    }

    let tracks = []
    tracks.push({ type: 'audio', capture: true, recv: false })
    sfutest?.createOffer({
      tracks: tracks,
      customizeSdp: function (jsep: any) {
        if (doDtx) {
          jsep.sdp = jsep.sdp.replace('useinbandfec=1', 'useinbandfec=1;usedtx=1')
        }
      },
      success: (jsep: any) => {
        let publish: any = { request: 'configure', audio: true, video: false }
        if (acodec) publish['audiocodec'] = acodec
        if (vcodec) publish['videocodec'] = vcodec
        sfutest.send({ message: publish, jsep: jsep })
      },
      error: handleJanusError,
    })
  }

  const unpublishAudio = () => {
    if (!sfutest) return

    const unpublish = { request: 'unpublish' }
    sfutest.send({ message: unpublish })

    if (localStream.value) {
      localStream.value.getAudioTracks().forEach(track => track.stop())
      localStream.value = undefined
    }
  }

  const checkDuplicateUserAndRemove = (msg: any) => {
    if (msg.error_code === 436) {
      registerUsername(true)
    } else if (msg.leaving === 'ok' || msg.reason === 'kicked') {
      cleanupJanusSession()
      utils
        .chain()
        .ask({
          title: '提示',
          message: '您已在其他设备加入房间，该房间已不可用',
          confirmText: '返回首页',
          confirmColor: '#07c160',
          cancelText: '重新启用房间',
        })
        .next(() => {
          utils.jumpTo('/')
        })
        .catch(() => {
          createRoom(true)
        })
    } else if (msg.unpublished) {
      sHelper.removePublisher(msg.unpublished)
    }
  }

  const registerUsername = (kickFirst?: boolean) => {
    if (kickFirst) {
      const kickRequest = {
        request: 'kick',
        room: props.room.id.value, // 房间 ID
        id: myUserId.value, // 要踢出的用户 ID
      }
      sfutest.send({ message: kickRequest })
    }

    const register = {
      request: 'join',
      room: props.room.id.value,
      id: myUserId.value,
      ptype: 'publisher',
      display: `用户${myUserId.value}`,
    }
    sfutest.send({ message: register })
  }

  const openMic = async () => {
    utils
      .chain()
      .fetch(service.room.openSpeak, params, '开麦成功')
      .next(() => toggleMicStream(true))
  }

  const closeMic = async (userId?: string) => {
    const _params = userId ? { ...params, userId } : params
    utils
      .chain()
      .fetch(service.room.closeSpeak, _params, userId ? '' : '闭麦成功')
      .next(() => toggleMicStream(false))
  }
  const closeSpeakByOwner = async (userId?: string) => {
    const _params = userId ? { ...params, userId } : params
    utils.chain().fetch(service.room.closeSpeakByOwner, _params, '闭麦成功')
  }
  const openSpeakByOwner = async (userId?: string) => {
    const _params = userId ? { ...params, userId } : params
    utils.chain().fetch(service.room.openSpeakByOwner, _params, '开麦成功')
  }

  const changeVoice = (effect: string) => {
    if (!props.room.isOnMic.value || !voiceChanger.value) {
      showToast('变声需要先打开麦克风')
      return
    }

    voiceChanger.value.applyEffect(effect)
    const processedStream = voiceChanger.value.getProcessedStream()
    const audioTrack = processedStream.getAudioTracks()[0]
    const sender = sfutest.webrtcStuff.pc.getSenders().find((s: RTCRtpSender) => s.track?.kind === 'audio')

    if (sender) {
      sender.replaceTrack(audioTrack)
      props.room.changeVoice(effect)
      showToast('变声效果已更改')
    } else {
      console.error('Audio sender not found.')
    }
  }

  const joinCheck = () => {
    let result = true
    if (localIsOnMic.value) {
      toggleMicStream(true)
    } else if (!props.room.info.value) {
      handleNoRoom()
      result = false
    } else if (props.room.isOwner.value) {
      initOwner()
    } else if (props.room.isUpSpeaker.value) {
      initUpSpeaker()
    } else if (mutedVoice.value) {
      initNormalUser()
    }
    return result
  }

  const handleNoRoom = () => {
    showDialog({
      title: '提示',
      message: '语音直播已经结束，下次早点来哦',
      confirmButtonText: '首页',
      confirmButtonColor: '#07c160',
      showCancelButton: true,
      cancelButtonText: '返回',
    })
      .then(() => {
        utils.jumpTo('/')
      })
      .catch(() => {
        history.go(-1)
      })
  }

  const initOwner = () => {
    utils
      .chain()
      .ask({
        title: '提示',
        message: '房主进入语音房请打开麦克风和声音',
        confirmText: '确定',
        confirmColor: '#07c160',
      })
      .next(() => {
        toggleMic(true)
      })
      .catch(() => {
        toggleMic(false)
      })
  }

  const initUpSpeaker = () => {
    const message = props.room.isOnMic.value ? '麦克风异常关闭，请重新打开' : '已经连麦，是否马上开麦'
    utils
      .chain()
      .ask({
        title: '提示',
        message: message,
        confirmText: '确认',
        confirmColor: '#07c160',
      })
      .next(() => {
        if (props.room.isOnMic.value) {
          toggleMicStream(true)
        } else {
          toggleMic(true)
        }
      })
      .catch(() => {
        if (props.room.isOnMic.value) {
          closeMic(props.room.myUserId.value)
        }
        toggleVoice(true)
      })
  }

  const initNormalUser = () => {
    showOpenMicTips.value = true
  }

  const handleOpenMicAndCloseTips = () => {
    toggleVoice(true)
    showOpenMicTips.value = false
  }

  watch(
    () => props.room.isOnMic.value,
    () => {
      if (!props.room.isOnMic.value && localIsOnMic.value) {
        showToast('房主已经关闭了你的麦克风')
        toggleMicStream(false)
      } else if (props.room.isOnMic.value && !localIsOnMic.value) {
        showToast('房主已经打开了你的麦克风')
        toggleMicStream(true)
      }
    }
  )

  function cleanupJanusSession() {
    // 停止插件连接
    if (sfutest) {
      sfutest.hangup() // 结束当前会话
    }

    // 销毁 Janus 实例
    if (janus) {
      janus.destroy() // 彻底销毁当前 Janus 实例
    }

    // 清理任何保存的状态
    janus = null
    sfutest = null
  }

  onMounted(async () => {
    if (!props.room.config.value || !props.room.isAllowed.value) return
    await loadAdapter()
    createRoom()

    window.onbeforeunload = () => {
      cleanupJanusSession()
    }

    props.room.install('toggleMicStream', toggleMicStream)
    props.room.install('closeSpeakByOwner', closeSpeakByOwner)
    props.room.install('openSpeakByOwner', openSpeakByOwner)
    props.room.install('changeVoice', changeVoice)
  })

  onBeforeUnmount(() => {
    timerForQuicklySwitch.value && clearTimeout(timerForQuicklySwitch.value)
    props.room.uninstall('toggleMicStream')
    props.room.uninstall('closeSpeakByOwner')
    props.room.uninstall('openSpeakByOwner')
    props.room.uninstall('changeVoice')
  })
</script>

<template>
  <div class="mic-wrapper">
    <audio autoplay ref="audio1" playsinline></audio>
    <audio autoplay ref="audio2" playsinline></audio>
    <audio autoplay ref="audio3" playsinline></audio>
    <audio autoplay ref="audio4" playsinline></audio>
    <Button class="mic-button" size="small" @click="toggleMic" v-if="room.isUpSpeaker.value">
      <van-icon v-if="localIsOnMic" :name="micIcon.src" size="28px" />
      <van-icon v-else :name="micBanIcon.src" size="28px" />
    </Button>
  </div>
  <van-popup
    class="popup-for-open-mic-tips"
    :show="showOpenMicTips"
    teleport="body"
    @close="handleOpenMicAndCloseTips"
    :overlay-style="{ 'background-color': 'transparent' }"
  >
    <div class="open-mic-tips" @click="handleOpenMicAndCloseTips">点击屏幕打开声音</div>
  </van-popup>
</template>

<style scoped lang="less">
  @bg-color: #eaffd3cc;
  .text-shadow {
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  }
  .mic-wrapper {
    display: flex;
    gap: 8px;
    button {
      height: 24px;
      background-color: transparent;
    }
    .mute-button {
      opacity: 1;
      &.muted {
        opacity: 0.5;
      }
    }
    .mic-button {
      cursor: pointer;
      border: none;
      padding: 0;
      width: 40px;
      min-width: 40px;
      height: 40px;
      border-radius: 20px;
      background-color: @bg-color;
    }
    .change-voice-buttons {
      display: flex;
      align-items: center;
      justify-content: center;
      position: fixed;
      right: 10px;
      bottom: 60px;
      gap: 8px;
    }
  }
  .popup-for-open-mic-tips {
    background-color: transparent;
    .open-mic-tips {
      color: #fff;
      font-size: 16px;
      .text-shadow;
    }
  }
</style>
