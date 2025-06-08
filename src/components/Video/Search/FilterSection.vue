<script setup lang="ts">
import { nextTick, ref, watch, onBeforeUnmount } from 'vue'
import { Popup } from 'vant'
import DateFilter from './DateFilter.vue'
import AuthorFilter from './AuthorFilter.vue'


const props = defineProps<{ 
  visible: boolean, 
  topTagList: Ref<any[]>,
  tagData: Ref<any[]>
}>()

const emit = defineEmits(['close', 'setFilter'])

const showDateFilter = ref<boolean>(false)
const showAuthorFilter = ref<boolean>(false)
const tags = ref<any[]>([])
const start = ref<string | null>(null)
const end = ref<string | null>(null)

type SectionItem = string | { beginTime: string; endTime: string } | { userId: number; nickname: string} | number
interface Section {
  title: string
  items: SectionItem[]
  selected: SectionItem | SectionItem[]
}

const initialSections: Section[] =[ 
  {
    title: '排序',
    items: ['综合排序', '最新发布', '最多点赞', '最多收藏'],
    selected: '综合排序'
  },
  {
    title: '发布时间',
    items: ['不限', '今天', '昨天', '一周内', '自定义'],
    selected: '不限'
  },
  {
    title: '作者',
    items: ['不限', '关注的人', '请选择'],
    selected: '不限'
  },
  {
    title: '话题',
    items: tags.value,
    selected: []
  }
]
const sections = ref<Section[]>( 
  JSON.parse(JSON.stringify(initialSections)) 
)

const isSelected = (sectionIdx: number, item: SectionItem) => {
  const selected = sections.value[sectionIdx].selected

  if (sectionIdx === 3 && Array.isArray(selected)) {
    // 話題區，依 tagId 或 item 本身判斷
    return selected.some(sel => {
      if (typeof sel === 'object' && typeof item === 'object' && 'tagId' in sel && 'tagId' in item) {
        return sel.tagId === item.tagId
      }
      return sel === item
    })
  }

  if (Array.isArray(selected)) {
    return selected.some(sel => 
      typeof sel === 'object' && typeof item === 'object' &&
      sel.beginTime === item.beginTime && sel.endTime === item.endTime
    ) || selected.includes(item)
  }

  if (typeof selected === 'object' && typeof item === 'object') {
    return selected.beginTime === item.beginTime && selected.endTime === item.endTime
  }

  return selected === item
}


const selectItem = (sectionIdx: number, item: SectionItem) => {
  const section = sections.value[sectionIdx]
  showAuthorFilter.value = false
  showDateFilter.value = false

  // 多選邏輯：話題（第4區）
  if (sectionIdx === 3 && Array.isArray(section.selected)) {
    const existingIndex = section.selected.findIndex(sel =>
      typeof sel === 'object' && typeof item === 'object' && 'tagId' in sel && 'tagId' in item
        ? sel.tagId === item.tagId
        : sel === item
    )
    if (existingIndex !== -1) {
      section.selected.splice(existingIndex, 1) // 取消選取
    } else {
      section.selected.push(item) // 新增選取
    }
    return
  }

  if (item === '自定义' || (typeof item === 'object' && 'beginTime' in item)) {
    showDateFilter.value = true
    if (typeof item === 'object') {
      start.value = item.beginTime
      end.value = item.endTime
    }
  } else if (sectionIdx === 2 && (item === '请选择' || (typeof item === 'object' && 'userId' in item))) {
    showAuthorFilter.value = true
  } else {
    // 還原為只保留 string，並確保特殊選項存在
    section.items = section.items.filter(i => typeof i === 'string')
    if (sectionIdx === 1 && !section.items.includes('自定义')) {
      section.items.push('自定义')
    } else if (sectionIdx === 2 && !section.items.includes('请选择')) {
      section.items.push('请选择')
    }
    section.selected = item
  }
}



const handleClose = () => {
  showDateFilter.value = false
}
const handleSelectAuthorClose = () => {
  showAuthorFilter.value = false
}
const onReset = async () => {
  sections.value = JSON.parse(JSON.stringify(initialSections))
  const topicSection = sections.value.find(s => s.title === '话题')
  if (topicSection) topicSection.items = tags.value
  start.value = null
  end.value = null
  if (topicSection) {
    topicSection.selected = []
  }
  await nextTick();
  emit('setFilter', JSON.parse(JSON.stringify(sections.value)))  
}

const confirm = (data: { start: string, end: string }) => {
  const customItem = { beginTime: data.start, endTime: data.end }
  const publishSection = sections.value[1]

  publishSection.items = publishSection.items.filter(i => 
    !(typeof i === 'string' && (i === '自定义' || i === '请选择')) && typeof i === 'string'
  )

  publishSection.items.push(customItem)
  publishSection.selected = customItem
  handleClose()
}
const confirmAuthor = (data: { userId: number, nickname: string }) => {
  if (data !== undefined) {
    const publishSection = sections.value[2]
    publishSection.items = publishSection.items.filter(i => 
      !(typeof i === 'string' && ( i === '请选择')) && typeof i === 'string'
    )

    publishSection.items.push(data)
    publishSection.selected = data
  }  
  handleSelectAuthorClose()
}
const handleFilterMaskClose = () => {
  showDateFilter.value = false
  showAuthorFilter.value = false
  setTimeout(() => {
    emit('close')
  }, 200)
  
}

watch(() => props.visible, (val: any) => {
  document.body.style.overflow = val ? 'hidden' : ''
})

watch([
  () => props.topTagList,
  () => props.tagData
], ([topTagListRef, tagDataRef]) => {
  if (topTagListRef && tagDataRef) {
    tags.value = [...topTagListRef, ...tagDataRef]
    const topicSection = sections.value.find(section => section.title === '话题')
    if (topicSection) topicSection.items = tags.value
  } else {
    tags.value = []
    const topicSection = sections.value.find(section => section.title === '话题')
    if (topicSection) topicSection.items = []
  }
}, { immediate: true })

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})
</script>

<template>
    <transition name="fade">
      <div v-if="visible" class="filter-mask" @click.self="emit('close')"></div>
    </transition>
    <transition name="slide-down">
      <div v-show="visible" class="filter-wrap">
        <div class="filter-box" @click.stop>
            <!-- 滾動區 -->
            <div class="filter-panel">
              <div
                class="dropdown-section"
                v-for="(section, index) in sections"
                :key="index"
              >
                <div class="section-title">{{ section.title }}</div>
                <div class="section-options">
                  <div
                    v-for="item in section.items"
                    :key="item"
                    class="option"
                    :class="{ active: isSelected(index, item) }"
                    @click="selectItem(index, item)"
                  >
                    {{ 
                    item.tagName ?  item.tagName : item.name ? item.name : 
                    item.nickname ? item.nickname :
                    item.beginTime ? item.beginTime + '至'+item.endTime : item }}
                  </div>
                </div>
              </div>
            </div>
            <!-- 固定按鈕 -->
            <div class="btn-group">
              <van-button @click="onReset" plain type="danger" class="btn reset" block>重置</van-button>
              <van-button @click="emit('setFilter', JSON.parse(JSON.stringify(sections)))" type="danger" class="btn set" block>确定</van-button>
            </div>
        </div>
        <Popup 
          class="date-filter"
          id="dateFilter"
          v-model:show="showDateFilter"
          round
          closeable
          @closed="handleClose"
          @click-overlay="handleFilterMaskClose"
          position="bottom"
          teleport="body"
          :style="{ height: '60vh' }"
        >
          <DateFilter @confirm="confirm" :startDate="start" :endDate="end"/>
        </Popup>
        <Popup 
          class="author-filter"
          id="selectAuthor"
          v-model:show="showAuthorFilter"
          round
          closeable
          @closed="handleSelectAuthorClose"
          @click-overlay="handleFilterMaskClose"
          position="bottom"
          teleport="body"
          :lock-scroll="false"
          :style="{ height: '60vh' }"
        >
          <div class="author-popup-body">
            <KeepAlive>
              <AuthorFilter @confirmAuthor="confirmAuthor" />
            </KeepAlive>
          </div> 
        </Popup>
      </div>  
    </transition>
  </template>
  <style scoped>
  .filter-wrap {
    position: absolute;
    top: 0px;
    left: 0;
    width: 100%;
    z-index: 20;
  }
  
  .filter-mask {
    position: absolute;
    background: rgba(0, 0, 0, 0.4);
    height: calc(100vh - 46px);
    top: 0;
    left: 0;
    right: 0;
    z-index: 9;
    display: flex;
    justify-content: center;
    align-items: flex-start;
  }
  
  .filter-box {
  width: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
  /* NEW: 讓它高度正常顯示 */
  max-height: 80vh;
}
  
  .filter-panel {
    height: 40vh;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding: 0 12px;
    box-sizing: border-box;
    overscroll-behavior: contain;
  touch-action: auto;
  }
  
  .btn-group {
    padding: 12px;
    display: flex;
    gap: 12px;
    background: #fff;
    align-items: center;
    justify-content: center;
  }
  .section-title {
    color: #aaa;
    font-size: 15px;
    padding-bottom: 6px;
    padding-top: 10px;
  }
  .section-options {
    display: flex;
    flex-wrap: wrap;
  }
  .option {
    min-width: 23%;
    margin-right: 2%;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 30px;
    font-size: 13px;
    margin-bottom: 6px;
    border-radius: 4px;
    background: #f2f2f2;
    color: #333;
    padding: 0 10px;
    box-sizing: border-box;
  }
  .option.active {
    background: #dc4c4c;
    color: #fff;
  }
  
  .slide-down-enter-active,
  .slide-down-leave-active {
    transition: all 0.3s ease;
  }
  .slide-down-enter-from,
  .slide-down-leave-to {
    transform: translateY(-100%);
    opacity: 0;
  }
  .slide-down-enter-to,
  .slide-down-leave-from {
    transform: translateY(0);
    opacity: 1;
  }
  .fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.fade-enter-to, .fade-leave-from {
  opacity: 1;
}
  .btn {
    position: sticky;
    left: 0;
    bottom: 0;
    display: flex;
    padding: 20px 0;
    justify-content: center;
    width: 100%;
    background: #fff;
    border: 1px solid #eb4d60;
    color: #eb4d60;

  }
  .reset {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 35px;
    margin-right: 30px;
    border-radius: 4px;
    width: 25%;
  }
  .set {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 35px;
    border-radius: 4px;
    width: 25%;
    background: #eb4d60;
    color: #fff;
  }
  .date-filter {
    position:absolute;
    left: 0;
    right: 0;
    margin: 0 auto;
  }
  
  .author-filter {
    background: white;
    max-width: 100%;
    position: absolute;
  }
  .author-popup-body {
    flex-direction: column;
    height: 100%;
    display: flex;
    
  }

  
  :deep(.van-nav-bar--fixed) {
    z-index: 100 !important;
  }
  @media screen and (min-width: 768px) {
    .date-filter {
      max-width: var(--custom-max-width);
    }
  }
  </style>
  