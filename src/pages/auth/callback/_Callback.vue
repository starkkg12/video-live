<script setup lang="ts">
  import constants from '@/constants'
  import service from '@/service'
  import utils from '@/utils'
  import { showConfirmDialog, showLoadingToast, closeToast } from 'vant'
  import { onMounted, ref } from 'vue'

  // 参数不足错误
  const isParamsError = ref(false)

  // cid不匹配错误
  const isCidError = ref(false)

  function jumpToLogin() {
    utils.jumpTo('/')
  }

  async function thridPartyLogin(token: string, businessType: string, clientType: string) {
    try {
      const response: any = await service.auth.thirdPartyLogin(token, businessType, clientType)
      console.log(response)

      if (!response.data.success) {
        showConfirmDialog({
          title: '提示',
          message: response.data.errMessage,
          confirmButtonText: '确定',
          confirmButtonColor: '#1989fa',
          showCancelButton: false,
        })
          .then(jumpToLogin)
          .catch(jumpToLogin)
        return
      }
      response.data.data.userInfo = {
        nickname: response?.data?.data?.nickname,
        userLevel: response?.data.data?.userLevel,
        avatar: response?.data?.data?.avatar,
        vipLevel: response?.data?.data?.vipLevel,
        myPromotionCodeList: response?.data?.data?.promotionCode,
        talent: response?.data?.data?.talent,
      }

      utils.saveAuthTokens(response)

      const toast = showLoadingToast({
        message: '登录成功, 3秒后返回...',
        duration: 0,
      })

      let second = 3

      const timer = setInterval(() => {
        second--
        toast.message = `登录成功, ${second}秒后返回...`
        if (second === 0) {
          clearInterval(timer)
          closeToast()
          utils.jumpTo('/')
        }
      }, 1000)
    } catch (error) {
      console.error(error)
      showConfirmDialog({
        title: '提示',
        message: (error as any).message ?? '登录失败, 请检查网络...',
        confirmButtonText: '确定',
        confirmButtonColor: '#1989fa',
        showCancelButton: false,
      })
        .then(jumpToLogin)
        .catch(jumpToLogin)
    } finally {
    }
  }

  onMounted(async () => {
    const url = new URL(window.location.href)
    const token = url.searchParams.get('token')
    const cid = url.searchParams.get('cid')
    const businessType = url.searchParams.get('businessType')
    const clientType = url.searchParams.get('clientType')

    if (!token || !cid || !businessType || !clientType) {
      isParamsError.value = true
      showConfirmDialog({
        title: '提示',
        message: '参数不足',
        confirmButtonText: '确定',
        confirmButtonColor: '#1989fa',
        showCancelButton: false,
      })
        .then(jumpToLogin)
        .catch(jumpToLogin)
      return
    }
    const localCid = await utils.getCid()
    if (localCid !== cid) {
      isCidError.value = true
      showConfirmDialog({
        title: '提示',
        message: 'cid不匹配',
        confirmButtonText: '确定',
        confirmButtonColor: '#1989fa',
        showCancelButton: false,
      })
        .then(jumpToLogin)
        .catch(jumpToLogin)
      return
    }

    thridPartyLogin(token, businessType, clientType)
  })
</script>

<template>
  <div></div>
  <div class="tips">登录完成，即将返回...</div>
</template>

<style scoped>
  .tips {
    text-align: center;
    padding: 20px;
  }
</style>
