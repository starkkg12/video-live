<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import {
  Image,
  Field,
  Button,
  Cell,
  ActionSheet,
  Switch,
  CellGroup,
  Row,
  Col,
  showToast,
  showDialog,
} from 'vant'
import DynamicGameTypeSelection from '@/components/Video/DynamicGameTypeSelection.vue'
import TagsSelector, { type Tag } from '@/components/Video/TagsSelector.vue'
import { createVideo, getTags, auditVideo } from '@/service/api'
import service from '@/service'

const props = defineProps({
  poster: {
    type: String,
    required: true,
  },
  videoDuration: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  uploadInfo: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['complete', 'reupload'])

// 视频数据表单
const videoData = reactive({
  title: '',
  description: '',
  videoPath: props.uploadInfo.fileUrl || '',
  preview: props.poster,
  size: props.uploadInfo.size || 0,
  userId: props.userId,
  resolution: '',
  bitrate: '',
  encoding: '',
  language: '',
  hasComments: false,
  hasBarrages: false,
  hasListening: false,
  isPublic: true,
  tags: [],
  lotteryType: '',
})

// 临时数据
const tempData = reactive({
  lotteryTypeCode: '',
})

// 标签列表
const tagList = ref<Tag[]>([])
// 显示设置对话框
const show = ref(false)

// 获取标签列表
const handleGetTags = async () => {
  try {
    const res = await getTags()
    tagList.value = res.data.data
  } catch (error: any) {
    showToast(`获取标签失败: ${error.message}`)
  }
}

// 根据表单填写情况判断是否可以保存
const canSave = computed(() => {
  return !!videoData.title && !!videoData.description && !!props.uploadInfo.fileUrl
})

// 选择游戏类型
const selectGameItem = (game: { gameType: string; gameTypeCode: string }) => {
  videoData.lotteryType = game.gameType
  tempData.lotteryTypeCode = game.gameTypeCode
}

// 上传视频
const uploadVideo = async () => {
  if (!canSave.value) {
    showToast('请填写完整信息')
    return
  }

  try {
    const res = await service.bbs.createPost(
      'video',
      videoData.title,
      videoData.description,
      videoData.lotteryType,
      'a',
      [
        {
          url: props.uploadInfo.fileUrl || '',
          fileType: 'v',
        },
      ]
    )

    if (res.data.success) {
      const createVideoData = {
        ...videoData,
        postId: res.data.data,
      }

      const createRes = await createVideo(createVideoData)

      if (createRes.data.success) {
        showToast('上传成功')

        showDialog({
          title: '提示',
          message: '短视频创建成功，是否马上预览？',
          showCancelButton: true,
          confirmButtonText: '审核并预览',
          cancelButtonText: '取消',
          closeOnPopstate: false,
        })
          .then(async () => {
            const auditRes = await auditVideo(createRes.data.data.id, {
              auditStatus: 1,
              auditPersonId: '100',
              auditPersonName: '管理员A',
            })

            if (auditRes.data.success) {
              window.location.href = `/?previewId=${createRes.data.data.id}`
            }
          })
          .catch(() => {
            window.location.href = `/`
          })

        // 通知父组件完成
        emit('complete')
      }
    }
  } catch (error: any) {
    showToast(`上传失败: ${error.message}`)
  }
}

// 组件加载时获取标签列表
handleGetTags()
</script>

<template>
  <div class="step_3">
    <Row class="pd">
      <Col>
        <Row class="poster">
          <Col>
            <Row class="content">
              <Image :src="poster" width="126" height="155" />
            </Row>
            <p class="duration">时长{{ videoDuration }}</p>
          </Col>
        </Row>
      </Col>
      <Col class="desc">
        <Field
          placeholder="请填写视频简介"
          v-model="videoData.description"
          type="textarea"
          rows="5"
        ></Field>
        <p class="tip">还可输入20个字符</p>
      </Col>
    </Row>
    <Col class="title">
      <Field placeholder="请输入此视频标题" v-model="videoData.title"></Field>
      <p class="tip">还可输入20个字符</p>
    </Col>
    <DynamicGameTypeSelection
      :selected-game-type-code="tempData.lotteryTypeCode"
      @tab-click-get-item="selectGameItem"
    />
    <TagsSelector v-model:selectedTags="videoData.tags" :tagList="tagList" :maxTags="3" />
    <Row class="config">
      <Cell is-link title="高级设置" @click="show = true" />
      <ActionSheet title="高级设置" v-model:show="show">
        <CellGroup>
          <Cell title="开启弹幕">
            <template #right-icon>
              <Switch v-model="videoData.hasBarrages" size="20px" active-color="#07c160"></Switch>
            </template>
          </Cell>
          <Cell title="开启评论">
            <template #right-icon>
              <Switch v-model="videoData.hasComments" size="20px" active-color="#07c160"></Switch>
            </template>
          </Cell>
          <Cell title="开启听视频">
            <template #right-icon>
              <Switch v-model="videoData.hasListening" size="20px" active-color="#07c160"></Switch>
            </template>
          </Cell>
        </CellGroup>
      </ActionSheet>
    </Row>
    <Row class="button">
      <Button :disabled="!canSave" @click="uploadVideo" type="success" block>上传</Button>
    </Row>
  </div>
</template>

<style lang="less" scoped>
.step_3 {
  text-align: left;
  padding: 10px 0 80px;
  h3 {
    font-size: 14px;
    font-weight: bold;
  }
  .pd {
    margin: 0 16px 10px;
    padding-bottom: 20px;
    display: flex;
    border-bottom: solid 1px #ccc;
    white-space: nowrap;
    .poster {
      margin-right: 5px;
      text-align: center;
      .content {
        border-radius: 5px;
        width: 126px;
        height: 155px;
        display: block;
        position: relative;
        overflow: hidden;
        border: 1px solid var(--van-text-color);
        img {
          max-width: 100%;
          max-height: 100%;
        }
      }
    }
    .desc {
      flex: 1;
      width: 100%;
      .van-field {
        border: solid 1px #ccc;
        border-radius: 5px;
        height: 155px;
      }
    }
    p {
      margin-top: 10px;
      font-size: 12px;
    }
  }
  .tip {
    text-align: right;
    color: #666;
    font-size: 12px;
  }
  .title {
    margin: 0 16px 20px;
    .van-field {
      border: solid 1px #ccc;
      border-radius: 5px;
      margin-bottom: 10px;
    }
  }
  .button {
    position: fixed;
    bottom: 10px;
    left: 16px;
    right: 16px;
  }
  .config {
    ul {
      padding: 10px 20px;
    }
    li {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-top: solid 1px #ccc;
      &:first-child {
        border: none;
      }
    }
  }
  .duration {
    margin-top: 10px;
  }
}
:deep(.van-cell__title span) {
  font-weight: bold;
}
</style>
