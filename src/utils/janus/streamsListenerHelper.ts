const streamsListenerHelper = (): {
  addPublisher: (publisher: any) => void
  removePublisher: (id: string) => void
  addVoiceListener: (data: { stream: MediaStream; id?: string; userId?: string }) => void
  onVoiceChange: (publisher: any) => void
} => {
  let publishersMap: any = {} // 保存发布者信息：{ id: { userId, display } }
  let handleVoiceChange: any = () => {}
  let voiceNumbers: any = {}
  let voiceStatus: any = {}
  let intervalIds: any = {}
  let lastestStatus: any = {}

  // 添加发布者
  const addPublisher = (publisher: any) => {
    const userId = publisher.id
    publisher.streams.forEach((stream: { id: string }) => {
      const id = stream.id

      if (!publishersMap[id]) {
        // 保存发布者信息和监听停止方法
        publishersMap[id] = { userId, display: publisher.display }
        console.log(`已添加发布者: ${publisher.display}, id: ${id}`)
      }
    })
  }

  // 添加音频监听
  const addVoiceListener = ({ stream, id, userId }: { stream: MediaStream; id?: string; userId?: string }) => {
    const key: string = id || userId || ''
    const stopMonitoring = monitorAudio(stream, key, _voiceChange)
    // 保存发布者信息和监听停止方法
    publishersMap[key] = { ...(publishersMap[key] ?? {}), stopMonitoring, ...(userId ? { userId } : {}) }
  }

  // 删除发布者
  const removePublisher = (id: string) => {
    if (publishersMap[id]) {
      // 停止监听并清理
      publishersMap[id].stopMonitoring()
      delete publishersMap[id]
      console.log(`已删除发布者, id: ${id}`)
    }
  }

  const _voiceChange = ({ key, voice }: { key: string; voice: boolean }) => {
    const voiceNum = voice ? 5 : (voiceNumbers[publishersMap[key].userId] ?? 0) - 1
    voiceNumbers = {
      ...voiceNumbers,
      [publishersMap[key].userId]: Math.max(voiceNum, 0),
    }
    voiceStatus = {
      ...voiceStatus,
      [publishersMap[key].userId]: voiceNum > 0,
    }
    if (JSON.stringify(lastestStatus) !== JSON.stringify(voiceStatus)) {
      handleVoiceChange && handleVoiceChange(voiceStatus)
      lastestStatus = voiceStatus
    }
  }

  const onVoiceChange = (callback: Function) => {
    handleVoiceChange = callback
  }

  // 音频监听函数
  const monitorAudio = (stream: MediaStream, key: string, callback: Function) => {
    const audioContext = new ((window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext)()
    const analyser = audioContext.createAnalyser()
    const mediaStreamSource = audioContext.createMediaStreamSource(stream)

    mediaStreamSource.connect(analyser)

    analyser.fftSize = 256
    const dataArray = new Uint8Array(analyser.frequencyBinCount)

    const checkAudio = () => {
      analyser.getByteFrequencyData(dataArray)

      const averageVolume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length

      callback({
        key,
        voice: averageVolume > 5,
      })
    }

    intervalIds[key] && clearInterval(intervalIds[key])
    intervalIds[key] = setInterval(() => {
      checkAudio()
    }, 300)

    return () => {
      clearInterval(intervalIds[key])
      audioContext.close()
    }
  }

  return {
    addPublisher,
    removePublisher,
    addVoiceListener,
    onVoiceChange,
  }
}

export default streamsListenerHelper
