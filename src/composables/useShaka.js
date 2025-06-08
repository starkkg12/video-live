import { ref, shallowRef, reactive, onUnmounted, computed } from 'vue';
import shaka from 'shaka-player';

/**
 * Shaka Player 播放器管理 Composable
 * 保证全局只有一个实例，支持多个组件共享使用
 */
export function useShaka() {
  // 静态变量，确保只创建一个实例
  const staticPlayer = shallowRef(null);
  const videoElement = shallowRef(null);
  const isPlayerReady = ref(false);
  const error = ref(null);
  const currentSource = ref(null);
  const timer = ref(null);
  
  // 播放状态
  const playerState = reactive({
    isLoading: false,
    isPlaying: false,
    isMuted: false,
    duration: 0,
    currentTime: 0,
    buffered: 0,
    volume: 1
  });

  // 视频信息
  const videoInfo = reactive({
    width: 0,
    height: 0,
    videoTracks: [],
    audioTracks: [],
    textTracks: []
  });

  // 统计信息
  const stats = reactive({
    droppedFrames: 0,
    estimatedBandwidth: 0,
    loadLatency: 0,
    playTime: 0,
    bufferingTime: 0
  });

  // 计算属性
  const isBuffering = computed(() => {
    return playerState.isLoading && !playerState.isPlaying;
  });

  /**
   * 初始化播放器
   * @param {HTMLVideoElement} videoEl - 视频元素
   * @param {Object} config - 播放器配置
   * @returns {Promise<void>}
   */
  const init = async (videoEl, config = {}) => {
    if (!videoEl) {
      error.value = new Error('必须提供视频元素');
      return;
    }

    videoElement.value = videoEl;

    try {
      // 检查浏览器支持
      shaka.polyfill.installAll();
      if (!shaka.Player.isBrowserSupported()) {
        throw new Error('浏览器不支持 Shaka Player');
      }

      // 如果已经存在实例，则先卸载当前内容
      if (staticPlayer.value) {
        await unload();
      } else {
        // 创建新的播放器实例
        staticPlayer.value = new shaka.Player(videoEl);
        
        // 配置播放器
        const defaultConfig = {
          streaming: {
            bufferingGoal: 60,
            rebufferingGoal: 2,
            bufferBehind: 30
          },
          abr: {
            enabled: true
          }
        };
        
        staticPlayer.value.configure({...defaultConfig, ...config});

        // 添加事件监听
        setupEventListeners();
      }

      isPlayerReady.value = true;
    } catch (err) {
      error.value = err;
      console.error('播放器初始化失败:', err);
    }
  };

  /**
   * 设置事件监听
   */
  const setupEventListeners = () => {
    if (!staticPlayer.value || !videoElement.value) return;

    // Shaka 播放器事件
    staticPlayer.value.addEventListener('error', (event) => {
      error.value = event.detail;
    });

    staticPlayer.value.addEventListener('buffering', (event) => {
      playerState.isLoading = event.buffering;
    });

    staticPlayer.value.addEventListener('streaming', () => {
      updateVideoInfo();
      updateStats();
    });

    // 视频元素事件
    const video = videoElement.value;

    video.addEventListener('play', () => {
      playerState.isPlaying = true;
    });

    video.addEventListener('pause', () => {
      playerState.isPlaying = false;
    });

    video.addEventListener('timeupdate', () => {
      playerState.currentTime = video.currentTime;
      
      // 更新缓冲进度
      if (video.buffered.length > 0) {
        playerState.buffered = video.buffered.end(video.buffered.length - 1);
      }
    });

    video.addEventListener('durationchange', () => {
      playerState.duration = video.duration;
    });

    video.addEventListener('volumechange', () => {
      playerState.volume = video.volume;
      playerState.isMuted = video.muted;
    });

    video.addEventListener('loadedmetadata', () => {
      videoInfo.width = video.videoWidth;
      videoInfo.height = video.videoHeight;
    });
  };

  /**
   * 更新视频信息
   */
  const updateVideoInfo = () => {
    if (!staticPlayer.value) return;

    try {
      const tracks = staticPlayer.value.getVariantTracks();
      const audioTracks = staticPlayer.value.getAudioLanguagesAndRoles();
      const textTracks = staticPlayer.value.getTextLanguagesAndRoles();

      videoInfo.videoTracks = tracks;
      videoInfo.audioTracks = audioTracks;
      videoInfo.textTracks = textTracks;
    } catch (err) {
      console.error('获取视频信息失败:', err);
    }
  };

  /**
   * 更新统计信息
   */
  const updateStats = () => {
    if (!staticPlayer.value) return;

    try {
      const shakaStats = staticPlayer.value.getStats();
      
      stats.droppedFrames = shakaStats.droppedFrames;
      stats.estimatedBandwidth = shakaStats.estimatedBandwidth;
      stats.loadLatency = shakaStats.loadLatency;
      stats.playTime = shakaStats.playTime;
      stats.bufferingTime = shakaStats.bufferingTime;
    } catch (err) {
      console.error('获取统计信息失败:', err);
    }
  };

  /**
   * 加载视频
   * @param {string} source - 视频资源地址
   * @param {Object} options - 可选配置
   * @returns {Promise<void>}
   */
  const load = async (source, options = {}) => {
    if (!staticPlayer.value || !isPlayerReady.value) {
      error.value = new Error('播放器未初始化');
      return;
    }

    try {
      playerState.isLoading = true;
      error.value = null;
      currentSource.value = source;
      
      // 应用 DRM 配置（如果有）
      if (options.drmInfo) {
        const drmConfig = getDrmConfig(options.drmInfo);
        staticPlayer.value.configure({
          drm: drmConfig
        });
      }
      
      // 加载视频
      await staticPlayer.value.load(source, null, options.mimeType);

      // 更新视频信息
      updateVideoInfo();
      
      playerState.isLoading = false;
      console.log('视频加载成功:', source);
      return true
    } catch (err) {
      playerState.isLoading = false;
      error.value = err;
      console.error('视频加载失败:', err);
      return false
    }
  };

  /**
   * 获取 DRM 配置
   * @param {Object} drmInfo - DRM 信息
   * @returns {Object} DRM 配置
   */
  const getDrmConfig = (drmInfo) => {
    const config = {
      servers: {}
    };
    
    if (drmInfo.widevine) {
      config.servers['com.widevine.alpha'] = drmInfo.widevine;
    }
    if (drmInfo.playready) {
      config.servers['com.microsoft.playready'] = drmInfo.playready;
    }
    if (drmInfo.clearkey) {
      config.servers['org.w3.clearkey'] = drmInfo.clearkey;
    }
    
    return config;
  };

  /**
   * 播放视频
   * @returns {Promise<void>}
   */
  const play = async () => {
    if (!videoElement.value)  return;
    
    try {
      await videoElement.value.play();
      playerState.isPlaying = true;
    } catch (err) {
      console.error('播放失败:', err);
    }
  };

  /**
   * 暂停视频
   */
  const pause = () => {
    if (!videoElement.value) return;
    
    videoElement.value.pause();
    playerState.isPlaying = false;
  };

  /**
   * 切换播放/暂停
   * @returns {Promise<void>}
   */
  const togglePlay = async () => {
    if (playerState.isPlaying) {
      pause();
    } else {
      await play();
    }
  };

  /**
   * 设置音量
   * @param {number} value - 音量值 (0-1)
   */
  const setVolume = (value) => {
    if (!videoElement.value) return;
    
    const volume = Math.min(Math.max(value, 0), 1);
    videoElement.value.volume = volume;
    playerState.volume = volume;
  };

  /**
   * 切换静音
   */
  const toggleMute = () => {
    if (!videoElement.value) return;
    
    videoElement.value.muted = !videoElement.value.muted;
    playerState.isMuted = videoElement.value.muted;
  };

  /**
   * 跳转到指定时间
   * @param {number} time - 时间（秒）
   */
  const seek = (time) => {
    if (!videoElement.value) return;
    
    videoElement.value.currentTime = Math.min(Math.max(time, 0), playerState.duration);
  };

  /**
   * 选择视频轨道
   * @param {number} trackId - 轨道ID
   */
  const selectVariantTrack = (trackId) => {
    if (!staticPlayer.value) return;
    
    try {
      staticPlayer.value.selectVariantTrack(trackId, /* clearBuffer */ true);
    } catch (err) {
      console.error('选择视频轨道失败:', err);
    }
  };

  /**
   * 选择音频轨道
   * @param {string} language - 语言
   */
  const selectAudioLanguage = (language) => {
    if (!staticPlayer.value) return;
    
    try {
      staticPlayer.value.selectAudioLanguage(language);
    } catch (err) {
      console.error('选择音频轨道失败:', err);
    }
  };

  /**
   * 选择字幕轨道
   * @param {string} language - 语言
   */
  const selectTextLanguage = (language) => {
    if (!staticPlayer.value) return;
    
    try {
      staticPlayer.value.selectTextLanguage(language);
    } catch (err) {
      console.error('选择字幕轨道失败:', err);
    }
  };

  /**
   * 卸载当前视频
   * @returns {Promise<void>}
   */
  const unload = async () => {
    if (staticPlayer.value) {
      try {
        await staticPlayer.value.unload();
        currentSource.value = null;
        
        // 重置状态
        // playerState.isPlaying = false;
        playerState.isLoading = false;
        playerState.currentTime = 0;
        playerState.duration = 0;
        playerState.buffered = 0;
        
        console.log('视频已卸载');
      } catch (err) {
        error.value = err;
        console.error('视频卸载失败:', err);
      }
    }
  };

  /**
   * 销毁播放器实例
   */
  const destroy = () => {
    if (staticPlayer.value) {
      // 移除所有事件监听器
      if (videoElement.value) {
        const video = videoElement.value;
        video.removeEventListener('play', () => {});
        video.removeEventListener('pause', () => {});
        video.removeEventListener('timeupdate', () => {});
        video.removeEventListener('durationchange', () => {});
        video.removeEventListener('volumechange', () => {});
        video.removeEventListener('loadedmetadata', () => {});
      }
      
      staticPlayer.value.destroy();
      staticPlayer.value = null;
      isPlayerReady.value = false;
      currentSource.value = null;
      
      // 重置状态
      playerState.isPlaying = false;
      playerState.isLoading = false;
      playerState.currentTime = 0;
      playerState.duration = 0;
      playerState.buffered = 0;
      
      console.log('播放器已销毁');
    }
  };

  // 组件卸载时自动卸载视频
  onUnmounted(() => {
    // 注意：如果希望在组件卸载时保留播放器实例，可以不进行卸载
    unload();
    // 如果想完全销毁播放器，取消下面这行的注释
    // destroy();
  });

  // 返回播放器控制方法和状态
  return {
    // 核心实例
    player: staticPlayer,
    videoElement,
    isPlayerReady,
    currentSource,
    error,
    
    // 状态
    playerState,
    videoInfo,
    stats,
    isBuffering,
    
    // 核心方法
    init,
    load,
    unload,
    destroy,
    
    // 控制方法
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    
    // 轨道控制
    selectVariantTrack,
    selectAudioLanguage,
    selectTextLanguage,
    
    // 内部方法（也可以给外部使用）
    updateVideoInfo,
    updateStats
  };
} 