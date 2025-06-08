<template>
  <div class="videobox">
    <video ref="videoRef" id="example-video" class="video-js" muted playsinline controls>
      <source :src="videoUrl2" type="application/x-mpegURL" />
      <!-- <source :src="videoUrl" /> -->
    </video>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import videojs from 'video.js'
  import 'video.js/dist/video-js.css'

  // theme vjs-theme-city
  // import '@videojs/themes/dist/city/index.css'
  // import '@videojs/themes/dist/fantasy/index.css'
  // import '@videojs/themes/dist/forest/index.css'
  // import '@videojs/themes/dist/sea/index.css'

  const videoUrl = '/videos/h1.mp4'
  const videoUrl2 = 'https://gw.huajia141.com/medium-service-api/external/medium/m3u8/HD/924041910131002.m3u8?cid=0'
  const videoRef = ref<HTMLVideoElement | null>(null)

  const videoControlParams = {
    controls: true, // 启用控制栏
    controlBar: {
      children: [
        'playToggle', // 播放/暂停按钮
        'volumePanel', // 音量控制
        'currentTimeDisplay', // 当前时间显示
        'timeDivider', // 时间分隔符
        'durationDisplay', // 总时长显示
        'progressControl', // 进度条
        'fullscreenToggle', // 全屏按钮
      ],
    },
  }

  let player: any | null = null

  onMounted(() => {
    if (videoRef.value) {
      player = videojs(videoRef.value, { ...videoControlParams }, () => {
        console.log('Player is ready')
      })
      player.muted(true)
      setTimeout(() => {
        player
          .play()
          .then(() => {
            console.log('Autoplay is allowed')
          })
          .catch(error => {
            console.error('Autoplay failed:', error)
            // 提示用户手动播放
            alert('Please click to start the video')
          })
      }, 100)
    }
  })
</script>

<style scoped>
  .videobox {
    width: 100%;
    height: 100%;
    margin: 0 auto;
    display: flex;
    align-items: center;
  }
  .video-js {
    width: 100%;
    height: 100%;
  }
  :deep(.vjs-button span) {
    height: 100%;
  }
</style>
