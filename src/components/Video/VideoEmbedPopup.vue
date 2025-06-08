<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Popup, Button } from 'vant'
import utils from '@/utils'
import logoQQ from '@/assets/images/short_video/logo_qq.png'

const props = defineProps<{
  visible: boolean
  url: string
}>()

const emit = defineEmits(['update:visible'])

const embedCode = ref('')

onMounted(() => {
  // 生成嵌入代码
  embedCode.value = `<iframe src='${props.url}' width='375' height='700' frameborder='0'></iframe>`
})

const handleCopyCode = () => {
  utils.copyText(embedCode.value)
}

const openQQSupport = () => {
  // 这里可以添加打开QQ客服的逻辑
  console.log('打开QQ客服')
}
</script>

<template>
  <Popup
    :show="visible"
    position="bottom"
    @update:show="val => emit('update:visible', val)"
    teleport="body"
    round
  >
    <div class="embed-container">
      <div class="embed-header">
        <div class="title">调用视频</div>
        <span class="close-icon" @click="emit('update:visible', false)">×</span>
      </div>

      <div class="embed-content">
        <p class="copy-hint">代码已复制，嵌入站点，免费调用</p>

        <div class="code-box" @click="handleCopyCode">
          {{ embedCode }}
        </div>

        <p class="embed-hint">
          说明：width='375'，其中375可修改，建议设置值> 375;<br />
          height='700'，也可修改，建议设置值>700
        </p>

        <div class="cooperation-info">
          <h3>接口合作说明</h3>
          <p>
            提供用户注册、短视频上传、短视频浏览、定制短视频查询
            发起直播、直播观看、定制直播间等多种数据内容以及多种 合作模式。详情咨询客服。
          </p>
        </div>

        <div class="qq-support" @click="openQQSupport">
          <div class="qq-icon">
            <img :src="logoQQ.src" alt="QQ" />
          </div>
          <div class="qq-text">
            <span>QQ</span>
          </div>
        </div>
      </div>
    </div>
  </Popup>
</template>

<style scoped lang="less">
.embed-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fff;
}

.embed-header {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  padding: 16px;
  border-bottom: 1px solid #f5f5f5;

  .title {
    font-size: 16px;
    font-weight: 600;
    color: #323233;
  }

  .close-icon {
    position: absolute;
    right: 16px;
    font-size: 22px;
    color: #969799;
  }
}

.embed-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;

  .copy-hint {
    margin: 0 0 12px;
    font-size: 14px;
    color: #323233;
  }

  .code-box {
    border: 1px solid #ebedf0;
    padding: 12px;
    background-color: #f7f8fa;
    border-radius: 4px;
    margin-bottom: 16px;
    word-break: break-all;
    font-family: monospace;
    font-size: 13px;
    line-height: 1.5;
  }

  .embed-hint {
    color: #666;
    font-size: 13px;
    line-height: 1.5;
    margin-bottom: 16px;
  }

  .cooperation-info {
    background-color: #f7f8fa;
    padding: 12px;
    margin-bottom: 20px;
    border-radius: 4px;

    h3 {
      margin-top: 0;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 600;
      color: #323233;
    }

    p {
      color: #646566;
      font-size: 13px;
      line-height: 1.5;
      margin: 0;
    }
  }

  .qq-support {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 20px 0;

    .qq-icon {
      img {
        width: 60px;
        height: 60px;
      }
    }

    .qq-text {
      font-size: 14px;
      color: #323233;
    }
  }
}
</style>
