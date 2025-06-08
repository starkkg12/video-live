import * as Tone from 'tone'

type VoiceEffect =
  | 'normal' // 正常
  | 'female' // 男变女声
  | 'male' // 女变男声
  | 'matureFemale' // 御姐音
  | 'loli' // 萝莉音
  | 'uncle' // 大叔音
  | 'deep' // 低沉音
  | 'robot' // 机器人音
  | 'highPitch' // 高音
  | 'lowPitch' // 低音
  | 'echo' // 回音

export default function createVoiceChanger(stream: MediaStream) {
  // Initialize Tone context
  const audioContext = new AudioContext()
  Tone.setContext(audioContext)

  // Create Web Audio API nodes
  const mediaStreamSource = audioContext.createMediaStreamSource(stream)
  const mediaStreamDestination = audioContext.createMediaStreamDestination()

  // Create Tone.js processing chain
  const inputGain = new Tone.Gain(1)
  const outputGain = new Tone.Gain(1)
  let effectChain: Tone.ToneAudioNode | null = null

  // Create bridge nodes
  const inputBridge = audioContext.createGain()
  const outputBridge = audioContext.createGain()

  // Connect input chain
  mediaStreamSource.connect(inputBridge)
  inputBridge.connect(inputGain.input)

  // Connect output chain
  outputGain.connect(outputBridge as unknown as AudioNode)
  outputBridge.connect(mediaStreamDestination)

  // 应用不同的变声效果
  function applyEffect(effect: VoiceEffect): void {
    if (effectChain) {
      inputGain.disconnect()
      effectChain.disconnect()
    }

    switch (effect) {
      case 'highPitch':
        effectChain = createHighPitchEffect()
        break
      case 'lowPitch':
        effectChain = createLowPitchEffect()
        break
      case 'robot':
        effectChain = createRobotEffect()
        break
      case 'echo':
        effectChain = createEchoEffect()
        break
      case 'female':
        effectChain = createFemaleVoiceEffect()
        break
      case 'male':
        effectChain = createMaleVoiceEffect()
        break
      case 'matureFemale':
        effectChain = createMatureFemaleVoiceEffect()
        break
      case 'loli':
        effectChain = createLoliVoiceEffect()
        break
      case 'uncle':
        effectChain = createUncleVoiceEffect()
        break
      case 'deep':
        effectChain = createDeepVoiceEffect()
        break
      default: // "normal"
        effectChain = new Tone.Gain(1)
        break
    }

    inputGain.connect(effectChain)
    effectChain.connect(outputGain)
    console.log(`Effect applied: ${effect}`)
  }

  // 获取处理后的音频流
  function getProcessedStream(): MediaStream {
    return mediaStreamDestination.stream
  }

  // 各种效果的实现
  function createHighPitchEffect(): Tone.ToneAudioNode {
    const pitchShift = new Tone.PitchShift({
      pitch: 12, // Up one octave
      windowSize: 0.1,
    })

    const eq = new Tone.EQ3({
      high: 6,
      mid: 0,
      low: -3,
    })

    pitchShift.connect(eq)
    return pitchShift
  }

  function createLowPitchEffect(): Tone.ToneAudioNode {
    const pitchShift = new Tone.PitchShift({
      pitch: -12, // Down one octave
      windowSize: 0.1,
    })

    const eq = new Tone.EQ3({
      high: -3,
      mid: 0,
      low: 6,
    })

    pitchShift.connect(eq)
    return pitchShift
  }

  function createRobotEffect(): Tone.ToneAudioNode {
    const bitCrusher = new Tone.BitCrusher(4)

    const autoFilter = new Tone.AutoFilter({
      frequency: 4,
      depth: 0.5,
      baseFrequency: 200,
      octaves: 4,
    }).start()

    const distortion = new Tone.Distortion(0.4)

    bitCrusher.connect(autoFilter)
    autoFilter.connect(distortion)
    return bitCrusher
  }

  function createEchoEffect(): Tone.ToneAudioNode {
    const delay = new Tone.FeedbackDelay({
      delayTime: 0.5,
      feedback: 0.4,
    })

    const reverb = new Tone.Reverb({
      decay: 2,
      wet: 0.3,
    })

    delay.connect(reverb)
    return delay
  }

  // Initialize default effect
  applyEffect('normal')

  function createFemaleVoiceEffect(): Tone.ToneAudioNode {
    const pitchShift = new Tone.PitchShift({
      pitch: 4, // Shift up by 4 semitones for female voice
      windowSize: 0.1,
    })

    const eq = new Tone.EQ3({
      high: 3, // Boost high frequencies for clarity
      mid: 2, // Slight boost in mids for warmth
      low: -2, // Reduce low frequencies
    })

    pitchShift.connect(eq)
    return pitchShift
  }

  function createMaleVoiceEffect(): Tone.ToneAudioNode {
    const pitchShift = new Tone.PitchShift({
      pitch: -2, // Shift down by 2 semitones for male voice
      windowSize: 0.1,
    })

    const eq = new Tone.EQ3({
      high: -1, // Slightly reduce highs
      mid: 1, // Small boost in mids
      low: 3, // Boost low frequencies for depth
    })

    pitchShift.connect(eq)
    return pitchShift
  }

  function createMatureFemaleVoiceEffect(): Tone.ToneAudioNode {
    const pitchShift = new Tone.PitchShift({
      pitch: 2, // Slight pitch up for mature female voice
      windowSize: 0.1,
    })

    const eq = new Tone.EQ3({
      high: 2, // Enhance high frequencies for clarity
      mid: 4, // Strong boost in mids for warmth and maturity
      low: 1, // Slight boost in lows for depth
    })

    const compressor = new Tone.Compressor({
      threshold: -24,
      ratio: 4,
      attack: 0.005,
      release: 0.1,
    })

    pitchShift.connect(eq)
    eq.connect(compressor)
    return pitchShift
  }

  function createLoliVoiceEffect(): Tone.ToneAudioNode {
    const pitchShift = new Tone.PitchShift({
      pitch: 7, // Higher pitch for young voice
      windowSize: 0.1,
    })

    const eq = new Tone.EQ3({
      high: 5, // Boost highs for brightness
      mid: 2, // Moderate mids
      low: -4, // Reduce lows significantly
    })

    const compressor = new Tone.Compressor({
      threshold: -20,
      ratio: 3,
      attack: 0.003,
      release: 0.1,
    })

    pitchShift.connect(eq)
    eq.connect(compressor)
    return pitchShift
  }

  function createUncleVoiceEffect(): Tone.ToneAudioNode {
    const pitchShift = new Tone.PitchShift({
      pitch: -4, // Lower pitch for mature male voice
      windowSize: 0.1,
    })

    const eq = new Tone.EQ3({
      high: -2, // Reduce highs for warmth
      mid: 3, // Boost mids for presence
      low: 5, // Strong boost in lows for depth
    })

    const distortion = new Tone.Distortion({
      distortion: 0.1, // Slight distortion for roughness
      wet: 0.3,
    })

    pitchShift.connect(eq)
    eq.connect(distortion)
    return pitchShift
  }

  function createDeepVoiceEffect(): Tone.ToneAudioNode {
    const pitchShift = new Tone.PitchShift({
      pitch: -6, // Significant pitch down for deep voice
      windowSize: 0.1,
    })

    const eq = new Tone.EQ3({
      high: -4, // Reduce highs significantly
      mid: 0, // Neutral mids
      low: 8, // Strong boost in lows
    })

    const compressor = new Tone.Compressor({
      threshold: -25,
      ratio: 4,
      attack: 0.01,
      release: 0.2,
    })

    pitchShift.connect(eq)
    eq.connect(compressor)
    return pitchShift
  }

  return {
    applyEffect,
    getProcessedStream,
  }
}
