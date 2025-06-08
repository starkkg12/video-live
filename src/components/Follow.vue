<script setup lang="ts">
  import { Button as VanButton, showToast, Icon as VanIcon } from 'vant'
  import { onMounted, ref, inject } from 'vue'
  import { addRelationship, delRelationship, getRelationship } from '@/service/relationship'
  import utils from '@/utils'
  import constants from '@/constants'
  import getLSItem from '@/utils/getLocalStorageItem'

  const myUserId = getLSItem(constants.localStorageKeys.USER_ID)

  const props = withDefaults(
    defineProps<{
      userId: string
      isRound?: boolean
      size?: 'small' | 'normal' | 'mini' | 'large'
      color?: string
      isFollow?: boolean | undefined
      hasIcon?: boolean
      text?: string
      cancelText?: string
      type?: string
      isPlain?: boolean
    }>(),
    {
      userId: '',
      isRound: true,
      size: 'small',
      color: '#07c160',
      text: '关注',
      cancelText: '取消关注',
      type: 'default',
      isPlain: true,
    }
  )

  const emit = defineEmits<{
    change: [isFollow: boolean]
  }>()

  const isFollow = defineModel('isFollow', {
    type: Boolean as () => boolean | undefined,
    default: undefined,
  })

  const onUpdateFollowStatus: any = inject('onUpdateFollowStatus', () => {})

  const getRelation = () => {
    const params = {
      targetUserId: props.userId,
      direct: '1',
    }
    getRelationship(params)
      .then(res => {
        if (res.data && res.data.errCode === '0') {
          isFollow.value = ['1', '2'].includes(res.data.data.relationFlag)
          onUpdateFollowStatus?.(props.userId, isFollow.value)
        } else {
          showToast(res.data.errMessage)
        }
      })
      .catch(err => console.log(err))
  }
  const followAction = async () => {
    const params = {
      toUserId: props.userId,
      ipInfo: await utils.getIpData(),
    }
    const res = isFollow.value === true ? await delRelationship(params) : await addRelationship(params)
    if (res.data.errCode === '0') {
      showToast(isFollow.value ? '取消关注成功' : '关注成功')
      getRelation()
      emit('change', isFollow.value ?? false)
    } else {
      showToast(res.data.errMessage)
    }
  }

  onMounted(async () => {
    if (props.userId) {
      if (props.isFollow !== undefined) {
        isFollow.value = props.isFollow
      } else {
        getRelation()
      }
    }
  })
</script>

<template>
  <!-- follow -->
  <van-button
    :round="props.isRound"
    v-if="props.userId && props.userId !== myUserId"
    class="btn-follow"
    :class="{ 'is-follow': isFollow }"
    :size="props.size"
    :color="props.color"
    :plain="props.isPlain"
    @click="followAction"
  >
    <template v-if="hasIcon">
      <van-icon v-if="isFollow" name="success" />
      <van-icon v-else name="plus" />
    </template>
    {{ isFollow ? cancelText : text }}
  </van-button>
</template>
<style scoped>
  /* .btn-follow {
    //box-shadow: 0 4px 8px 0 #09a958;
  }*/
</style>
