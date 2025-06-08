<template>
  <div>
    <video ref="videoRef" width="100%" height="100%" controls></video>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue'
  import shaka from 'shaka-player'
  const videoUrl = '/test.m3u8'

  // 视频元素引用
  const videoRef = ref<HTMLVideoElement | null>(null)

  // Shaka Player 实例
  let player: shaka.Player | null = null

  onMounted(async () => {
    if (videoRef.value) {
      if (shaka.Player.isBrowserSupported()) {
        player = new shaka.Player(videoRef.value)

        try {
          await player.load(videoUrl)
          videoRef.value.muted = true
          await videoRef.value.play()
        } catch (error) {
          console.error('Error loading video:', error)
        }
      } else {
        console.error('Shaka Player is not supported on this browser.')
      }
    }
  })

  onBeforeUnmount(() => {
    if (player) {
      player.destroy()
      player = null
    }
  })
</script>

<style scoped></style>
