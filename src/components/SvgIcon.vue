<template>
  <div
    v-if="processedSvg"
    v-html="processedSvg"
    :style="{ width: size + 'px', height: size + 'px', color: color }"
    class="svg-icon"
  ></div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
const SESSION_STORAGE_ICONS_KEY = 'SESSION_STORAGE_ICONS_KEY'

const getCacheSvg = () => {
  const cacheSvg = sessionStorage.getItem(SESSION_STORAGE_ICONS_KEY)
  return cacheSvg ? JSON.parse(cacheSvg) : {}
}

const setCacheSvg = (url, svg) => {
  const cacheSvg = getCacheSvg()
  cacheSvg[url] = svg
  sessionStorage.setItem(SESSION_STORAGE_ICONS_KEY, JSON.stringify(cacheSvg))
}

// Props
const props = defineProps({
  icon: String, // SVG 文件路径
  size: { type: String, default: '24' }, // 图标大小
  color: { type: String, default: 'currentColor' }, // 颜色
})

const cacheSvg = getCacheSvg()
const widthHeight = computed(() => props.size.split('*'))
const processedSvg = ref('')

// 加载 SVG
const loadSvg = async url => {
  if (!url) return
  const cachedSvg = cacheSvg[url]
  if (cachedSvg) {
    processedSvg.value = cachedSvg
  } else {
    try {
      const response = await fetch(url)
      const svgContent = await response.text()
      processedSvg.value = svgContent
        .replace(/ width="(.*?)"/g, ` width="${widthHeight.value[0]}"`)
        .replace(/ height="(.*?)"/g, ` height="${widthHeight.value[1] || widthHeight.value[0]}"`)
      setCacheSvg(url, processedSvg.value)
    } catch (error) {
      console.error('加载 SVG 失败:', error)
    }
  }
}

// 监听 props.icon 变化
watch(
  () => props.icon,
  newIcon => {
    loadSvg(newIcon)
  }
)

// 初始加载
onMounted(() => {
  loadSvg(props.icon)
})
</script>

<style scoped>
.svg-icon {
  display: inline-block;
}
.svg-icon svg {
  width: 100%;
  height: 100%;
}
</style>
