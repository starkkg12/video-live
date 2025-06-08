<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Popup, showToast, Icon, Field } from 'vant'

export interface Tag {
  id: string
  name: string
  [key: string]: any
}

const props = defineProps({
  tagList: {
    type: Array as () => Tag[],
    default: () => [],
  },
  selectedTags: {
    type: Array as () => string[],
    default: () => [],
  },
  maxTags: {
    type: Number,
    default: 3,
  },
})

const emit = defineEmits(['update:visible', 'update:selectedTags'])

const searchValue = ref('')
const selectedTagIds = ref<string[]>([])
const showTagsList = ref(false)

// 初始化选中的标签
watch(
  () => props.selectedTags,
  newVal => {
    selectedTagIds.value = [...newVal]
  },
  { immediate: true }
)

// 过滤的标签列表
const filteredTags = computed(() => {
  if (!searchValue.value) {
    return props.tagList
  }
  return props.tagList.filter(tag =>
    tag.name.toLowerCase().includes(searchValue.value.toLowerCase())
  )
})

// 已选中的标签对象
const selectedTagObjects = computed(() => {
  return selectedTagIds.value
    .map(id => props.tagList.find(tag => tag.id === id))
    .filter(tag => tag) as Tag[]
})

// 切换标签选择状态
const toggleTag = (id: string) => {
  if (selectedTagIds.value.includes(id)) {
    // 已选中，取消选择
    selectedTagIds.value = selectedTagIds.value.filter(tagId => tagId !== id)
  } else {
    // 未选中，添加选择
    if (selectedTagIds.value.length >= props.maxTags) {
      showToast(`最多选择${props.maxTags}个标签`)
      return
    }
    selectedTagIds.value.push(id)
  }

  // 更新父组件的选中状态
  emit('update:selectedTags', selectedTagIds.value)
}

// 关闭弹窗
const closePopup = () => {
  emit('update:visible', false)
}

// 清空搜索
const clearSearch = () => {
  searchValue.value = ''
}

const toggleTagsList = () => {
  showTagsList.value = !showTagsList.value
}
</script>

<template>
  <div class="tags-selector">
    <div class="tags-header" @click="toggleTagsList">
      <h3 class="current-text-color">
        选择标签:<span>(最多{{ maxTags }}个)</span>
      </h3>
      <span class="material-icons">{{ showTagsList ? 'expand_less' : 'expand_more' }}</span>
    </div>

    <!-- 已选择的标签 -->
    <div class="selected-tags" v-if="selectedTagIds.length > 0">
      <div
        class="selected-tag"
        v-for="tag in selectedTagObjects"
        :key="tag.id"
        @click="toggleTag(tag.id)"
      >
        #{{ tag.name }}# <Icon name="cross" size="12" />
      </div>
    </div>

    <template v-if="showTagsList">
      <!-- 搜索框 -->
      <div class="search-box">
        <Field v-model="searchValue" placeholder="搜索标签" clearable @clear="clearSearch">
          <template #left-icon>
            <Icon name="search" size="16" />
          </template>
        </Field>
      </div>

      <!-- 标签列表 -->
      <div class="tags-list-container">
        <div class="tags-list">
          <div
            v-for="tag in filteredTags"
            :key="tag.id"
            class="tag-item"
            :class="{ selected: selectedTagIds.includes(tag.id) }"
            @click="toggleTag(tag.id)"
          >
            #{{ tag.name }}#
          </div>

          <div class="no-results" v-if="filteredTags.length === 0">没有找到匹配的标签</div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="less">
.tags-selector {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
}

.tags-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;

  h3 {
    font-size: 14px;
    font-weight: bold;
    margin: 0;

    span {
      font-size: 14px;
      color: #999;
      font-weight: normal;
      margin-left: 5px;
    }
  }

  .close-icon {
    font-size: 22px;
    color: #999;
    cursor: pointer;
  }
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 16px;
  gap: 8px;

  .selected-tag {
    background-color: #07c160;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    display: flex;
    align-items: center;

    .van-icon {
      margin-left: 4px;
    }
  }
}

.search-box {
  margin-bottom: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  :deep(.van-field__left-icon) {
    margin-right: 8px;
  }
}
.tags-list-container {
  overflow-y: auto;
  height: 30vh;
}
.tags-list {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-content: flex-start;
  gap: 8px;

  .tag-item {
    color: #666;
    background-color: #f5f5f5;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 12px;
    border: 1px solid transparent;

    &.selected {
      border-color: #07c160;
    }
  }

  .no-results {
    width: 100%;
    text-align: center;
    color: #999;
    padding: 20px 0;
  }
}
.material-icons {
  font-size: 24px;
  color: #07c160;
}
</style>
