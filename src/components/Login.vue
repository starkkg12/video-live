<script setup lang="ts">
  import {  Image, Field, Button, Popup, Picker, showDialog } from 'vant'
  import { computed, nextTick, onBeforeUnmount, onMounted, onUnmounted, ref, watch } from 'vue'
  import { useCountDown } from '@vant/use'
  import jumpTo from '@/utils/jumpTo'
  import logoImage from '@/assets/images/logo.png'
  import service from '@/service'
  import utils from '@/utils'
  import facebook from '@/assets/icons/facebook.svg'
  import google from '@/assets/icons/google.svg'
  import instagram from '@/assets/icons/instagram.svg'
  import x from '@/assets/icons/x.svg'
  import line from '@/assets/icons/line.svg'
  import axios from 'axios'
  import constants from '@/constants'
  import countryCodeAndPhoneCodeList from '@/constants/countryCodeAndPhoneCode.json'
  interface CountryAndPhoneCode {
    english_name: string
    chinese_name: string
    country_code: string
    phone_code: string
  }

  const props = withDefaults(defineProps<{
    size: string
    phoneCode: string
    callback?: boolean  // 注意這裡要設為可選
  }>(), {
    callback: false
  })
  const emit = defineEmits(['closeLoginModal', 'setIsLoading', 'loginSuccess'])


  const username = ref('hotori')
  const password = ref('QAQqaz123')
  // const usernameErrorMessage = ref<string>()
  const passwordErrorMessage = ref<string>()
  const phoneCode = ref(props.phoneCode ? props.phoneCode : '86')
  const showThirdPartyLogin = ref(false)
  const showCountryPicker = ref(false)


  // 验证码登录
  const phone = ref('')
  const sms = ref('')
  const smsToken = ref('')
  const smsTokenPhone = ref('')

  const email = ref('')
  // const emailCode = ref('')
  // const emailToken = ref('')
  // const emailTokenEmail = ref('')

  const countDown = useCountDown({ time: 60 * 1000 })
  const superiorUserPromotionCode = ref<string | null>(null)  
  const countryLabel = computed(() => {
    const country = countryCodeAndPhoneCodeList.find((item: CountryAndPhoneCode) => item.phone_code === phoneCode.value);
    return country ? `${country.chinese_name}(+${country.phone_code})` : ''
  })

  const bindPhoneCode = computed<string[]>({
    get: () => [phoneCode.value],
    set: value => {
      phoneCode.value = value[0]
    },
  })
  // email 是否合法
  // const isEmailValid = computed(() => {
  //   return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+(\.[a-zA-Z]{2,})$/.test(email.value)
  // })

  const isLoading = ref(false)
  const isSameDomainReferrer = () => {
    const ref = document.referrer
    if (!ref) return false // 沒有上一頁

    const currentOrigin = window.location.origin
    try {
      const refOrigin = new URL(ref).origin
      return currentOrigin === refOrigin
    } catch (e) {
      return false
    }
  }

  function onBack() {
    if (isSameDomainReferrer()) {
      typeof window !== 'undefined' && window.history.back()
    } else {
      jumpTo('/')
    }
   
  }
  
  async function sendSms() {
    // 必须输入手机号
    if (!phone.value) {
      showDialog({ title: '发送失败', message: '请输入手机号' })
      return
    }
    // 手机号长度必须大于7
    if (phone.value.length < 7) {
      showDialog({ title: '发送失败', message: '请输入正确的手机号' })
      return
    }
    // 手机号最长长度不能超过15
    if (phone.value.length > 15) {
      showDialog({ title: '发送失败', message: '请输入正确的手机号' })
      return
    }
    // 只能输入数字
    if (!/^\d+$/.test(phone.value)) {
      showDialog({ title: '发送失败', message: '请输入正确的手机号' })
      return
    }

    try {
      isLoading.value = true
      smsToken.value = ''
      const ipInfo = await utils.getIpData()
      const response = await service.auth.mobileLoginSendCode(phoneCode.value, phone.value, ipInfo)
      if (response.data.success) {
        smsToken.value = response.data.data.token
        smsTokenPhone.value = phone.value
        // 存储 smsToken 到 localStorage
        utils.setLSItem(constants.localStorageKeys.SMS_TOKEN, smsToken.value)
        showDialog({ title: '发送成功', message: '验证码已发送，请注意查收' })
        sms.value = ''
        countDown.reset()
        countDown.start()
      } else {
        showDialog({ title: '发送失败', message: response.data.errMessage })
      }
    } catch (error) {
      console.error('error cc login sendSms', error)
      showDialog({ title: '发送失败', message: '发送失败，请稍后再试' })
    } finally {
      isLoading.value = false
    }
  }

  async function smsLogin() {
    if (!phone.value) {
      showDialog({ title: '登录失败', message: '请输入手机号' })
      return
    }

    if (phone.value.length < 7) {
      showDialog({ title: '登录失败', message: '请输入正确的手机号' })
      return
    }

    if (phone.value.length > 15) {
      showDialog({ title: '登录失败', message: '请输入正确的手机号' })
      return
    }

    if (!/^\d+$/.test(phone.value)) {
      showDialog({ title: '登录失败', message: '请输入正确的手机号' })
      return
    }

    if (!sms.value) {
      showDialog({ title: '登录失败', message: '请输入验证码' })
      return
    }

    if (sms.value.length !== 6) {
      showDialog({ title: '登录失败', message: '请输入正确的验证码' })
      return
    }

    if (smsToken.value === '') {
      showDialog({ title: '登录失败', message: '请重新发送验证码' })
      return
    }

    if (smsTokenPhone.value !== phone.value) {
      showDialog({ title: '登录失败', message: '请重新发送验证码' })
      return
    }
    try {
      isLoading.value = true
      if (props.size !== 'small') {
        // props.size == 'small': 彈窗登入，props.size ！== 'small': 登入頁面(pages/login/Login.vue)
        // 回到pages/login/login.vue
        emit("setIsLoading", true)
      }
      const ipInfo = await utils.getIpData()
      const response = await service.auth.mobileLoginVerify(smsToken.value, sms.value, ipInfo)
      if (response.data.success) {
        utils.saveAuthTokens(response)
        emit('loginSuccess')
        if (!props.callback) {
          nextTick(() => {
            onBack()
          })
        } else {
          emit('closeLoginModal')
        }
      } else {
        showDialog({ title: '登录失败', message: response.data.errMessage })
      }
    } catch (error) {
      console.error('error cc login smsLogin', error)
      showDialog({ title: '登录失败', message: '登录失败，请稍后再试' })
    } finally {
      isLoading.value = false
      // props.size == 'small': 彈窗登入，props.size ！== 'small': 登入頁面(pages/login/Login.vue)
      if (props.size !== 'small') {
        // 回到pages/login/login.vue
        emit("setIsLoading", false)
      }
    }
  }

  async function login() {
    if (!username.value) {
      showDialog({ title: '登录失败', message: '请输入用户名' })
      return
    }

    if (!password.value) {
      showDialog({ title: '登录失败', message: '请输入密码' })
      return
    }

    if (username.value.length < 6) {
      showDialog({ title: '登录失败', message: '用户名长度不能小于6位' })
      return
    }

    if (username.value.length > 16) {
      showDialog({ title: '登录失败', message: '用户名长度不能大于16位' })
      return
    }

    if (password.value.length < 8) {
      showDialog({ title: '登录失败', message: '密码长度不能小于8位' })
      return
    }

    if (password.value.length > 16) {
      showDialog({ title: '登录失败', message: '密码长度不能大于16位' })
      return
    }

    try {
      isLoading.value = true
      const ipInfo = await utils.getIpData()
      const salt = Math.random().toString(36).slice(-8)
      const sha1Password = utils.encodeBase64(utils.encodeSha1(username.value + password.value))
      const secret = utils.encodeBase64(utils.encodeSha1(salt + username.value + sha1Password))
      const response = await service.auth.accountLogin(username.value, salt, secret, ipInfo)

      if (response.data.success) {
        utils.saveAuthTokens(response)
      } else {
        showDialog({ title: '登录失败', message: response.data.errMessage })
      }
      if (response.data.success) {
        utils.saveAuthTokens(response)
        onBack()
      } else {
        showDialog({ title: '登录失败', message: response.data.errMessage })
      }
    } catch (error) {
      console.error('error cc login login', error)
      showDialog({ title: '登录失败', message: '登录失败，请稍后再试' })
    } finally {
      isLoading.value = false
    }
  }

  // async function sendEmailCode() {
  //   if (!email.value) {
  //     showDialog({ title: '发送失败', message: '请输入邮箱' })
  //     return
  //   }

  //   if (!isEmailValid.value) {
  //     showDialog({ title: '发送失败', message: '请输入正确的邮箱' })
  //     return
  //   }

  //   try {
  //     isLoading.value = true
  //     emailToken.value = ''
  //     const response = await service.auth.mailLoginSendCode(email.value)
  //     if (response.data.success) {
  //       emailToken.value = response.data.data.token
  //       emailTokenEmail.value = email.value
  //       showDialog({ title: '发送成功', message: '验证码已发送，请注意查收' })
  //       emailCode.value = ''
  //       countDown.reset()
  //       countDown.start()
  //     } else {
  //       showDialog({ title: '发送失败', message: response.data.errMessage })
  //     }
  //   } catch (error) {
  //     console.error('error cc login sendEmailCode', error)
  //     showDialog({ title: '发送失败', message: '发送失败，请稍后再试' })
  //   } finally {
  //     isLoading.value = false
  //   }
  // }

  // async function emailCodeLogin() {
  //   if (!email.value) {
  //     showDialog({ title: '登录失败', message: '请输入邮箱' })
  //     return
  //   }

  //   if (!isEmailValid.value) {
  //     showDialog({ title: '登录失败', message: '请输入正确的邮箱' })
  //     return
  //   }

  //   if (!emailCode.value) {
  //     showDialog({ title: '登录失败', message: '请输入验证码' })
  //     return
  //   }

  //   if (emailCode.value.length !== 6) {
  //     showDialog({ title: '登录失败', message: '请输入正确的验证码' })
  //     return
  //   }

  //   if (emailToken.value === '') {
  //     showDialog({ title: '登录失败', message: '请重新发送验证码' })
  //     return
  //   }

  //   if (emailTokenEmail.value !== email.value) {
  //     showDialog({ title: '登录失败', message: '请重新发送验证码' })
  //     return
  //   }

  //   try {
  //     isLoading.value = true
  //     const response = await service.auth.mailLoginVerify(emailToken.value, emailCode.value)
  //     if (response.data.success) {
  //       utils.saveAuthTokens(response)
  //       onBack()
  //     } else {
  //       showDialog({ title: '登录失败', message: response.data.errMessage })
  //     }
  //   } catch (error) {
  //     console.error('error cc login emailCodeLogin', error)
  //     showDialog({ title: '登录失败', message: '登录失败，请稍后再试' })
  //   } finally {
  //     isLoading.value = false
  //   }
  // }
  async function initPhoneCode() {
    try {
      const ipInfo = await axios.get('https://ip.ai4funs.com/')
      countryCodeAndPhoneCodeList.find((item: CountryAndPhoneCode) => {
        if (item.country_code.toUpperCase() === ipInfo.data.country?.toUpperCase()) {
          phoneCode.value = item.phone_code
          emit('setPhoneCode', item.phone_code)
        }
      })
    } catch (error) {
      console.error('error cc login initPhoneCode', error)
    }
  }
  const updateFontSize = () => {
    // 強制把這頁面font-size改為64px或13.33vw(只有進入登入頁面時用，離開則恢復)
    const width = window.innerWidth
    const fontSize = width >= 769 ? '64px' : '13.33vw'
    document.documentElement.style.fontSize = fontSize
  }
  
  onMounted(() => {
    console.log("mount");
    superiorUserPromotionCode.value = utils.getLSItem(constants.localStorageKeys.SUPERIOR_USER_PROMOTION_CODE)
    const urlParams = new URLSearchParams(window.location.search)
    superiorUserPromotionCode.value = urlParams.get('promotion_code')
    initPhoneCode();
    updateFontSize()
    window.addEventListener('resize', updateFontSize)
  })
  

  onUnmounted(() => {
    // 還原 font-size，避免影響其他頁
    document.documentElement.style.fontSize = ''
    window.removeEventListener('resize', updateFontSize)
  })
  onBeforeUnmount(() => {
    showThirdPartyLogin.value = false;
  })
  
  watch(() => props.phoneCode, () => {
    console.log("phoneCode ", props.phoneCode)
     phoneCode.value = props.phoneCode;
  });

</script>
<template>
    <!-- 彈窗登入 -->
    <div v-if="size === 'small'" class="login-small">
      <!-- LOGO -->
      <div class="logo-wrapper">
        <div class="logo">
           <Image class="logo-image" :src="logoImage.src" />
           <i class="van-icon van-icon-cross close-btn" @click="emit('closeLoginModal')"></i>
        </div>
      </div> 

      <!-- 表單區 -->
      <div class="form">
         <!-- 關閉按鈕 -->
        
          <div class="inputField">
            <Field v-model="countryLabel" is-link readonly placeholder="国家/地区" @click="showCountryPicker = true" />
          </div>
          <div class="inputField">
            <Field v-model="phone" center clearable placeholder="请输入手机号" type="tel">
              <template #button>
                <div class="btn-wrapper">
                  <Button
                    size="small"
                    type="primary"
                    color="#eb4d60"
                    class="send-btn"
                    :disabled="countDown.current.value.seconds !== 0 || !phone || phone.length < 7 || phone.length > 15 || !/^\d+$/.test(phone)"
                    :loading="isLoading"
                    loading-text="发送中..."
                    @click="sendSms"
                  >
                    发送验证码
                    <span v-if="countDown.current.value.seconds" style="width: 27px; display: inline-block">
                      ({{ countDown.current.value.seconds }})
                    </span>
                  </Button>
                </div>
              </template>
            </Field>
          </div>
          <div class="inputField">
            <Field
              size="large"
              v-model="sms"
              placeholder="请输入验证码"
              :error-message="passwordErrorMessage"
              type="text"
              maxlength="6"
            />
          </div>
          <Button
            type="primary"
            block
            round
            class="login-btn"
            color="#eb4d60"
            :loading="isLoading"
            @click="smsLogin"
            :disabled="
              !phone ||
              phone.length < 7 ||
              phone.length > 15 ||
              !/^\d+$/.test(phone) ||
              !sms ||
              sms.length !== 6 ||
              smsToken === '' ||
              smsTokenPhone !== phone
            "
          >
            登录
          </Button>
          <Transition name="fade">
            <div class="third-party" v-if="showThirdPartyLogin">
              <Image class="third-party-item" :src="facebook.src" @click="utils.jumpToThirdPartyLogin('facebook')" />
              <Image class="third-party-item" :src="google.src" @click="utils.jumpToThirdPartyLogin('google')" />
              <Image class="third-party-item" :src="instagram.src" @click="utils.jumpToThirdPartyLogin('instagram')" />
              <Image class="third-party-item" :src="x.src" @click="utils.jumpToThirdPartyLogin('x')" />
              <Image class="third-party-item" :src="line.src" @click="utils.jumpToThirdPartyLogin('line')" />
            </div>
          </Transition>
          <div class="show-third-party" v-if="!showThirdPartyLogin" @click="showThirdPartyLogin = true">
            使用第三方登录
          </div>
      </div>
    </div>
    <!-- 從登入頁面登入-->
    <div v-else class="login">
      <div>
        <div class="logo">
          <Image class="logo-image" :src="logoImage.src" />
        </div>
        <div class="form">
          <div class="inputField">
            <Field v-model="countryLabel" is-link readonly placeholder="国家/地区" @click="showCountryPicker = true" />
          </div>
          <div class="inputField">
            <Field size="large" v-model="phone" center clearable placeholder="请输入手机号" type="tel">
              <template #button>
                <Button
                  size="small"
                  type="primary"
                  color="#eb4d60"
                  class="send-btn"
                  :disabled="
                    countDown.current.value.seconds !== 0 ||
                    !phone ||
                    phone.length < 7 ||
                    phone.length > 15 ||
                    !/^\d+$/.test(phone)
                  "
                  :loading="isLoading"
                  loading-text="发送中..."
                  @click="sendSms"
                >
                  发送验证码
                  <span v-if="countDown.current.value.seconds" style="width: 27px; display: inline-block">
                    ({{ countDown.current.value.seconds }})
                  </span>
                </Button>
              </template>
            </Field>
          </div>
          <div class="inputField">
            <Field
              size="large"
              v-model="sms"
              placeholder="请输入验证码"
              :error-message="passwordErrorMessage"
              type="text"
              maxlength="6"
            />
          </div>
          <Button
            type="primary"
            block
            round
            color="#eb4d60"
            :loading="isLoading"
            @click="smsLogin"
            :disabled="
              !phone ||
              phone.length < 7 ||
              phone.length > 15 ||
              !/^\d+$/.test(phone) ||
              !sms ||
              sms.length !== 6 ||
              smsToken === '' ||
              smsTokenPhone !== phone
            "
          >
            登录
          </Button>
          <!-- 'facebook' | 'instagram' | 'google' | 'line' | 'x' -->
          <Transition name="fade">
            <div class="third-party" v-if="showThirdPartyLogin">
              <Image class="third-party-item" :src="facebook.src" @click="utils.jumpToThirdPartyLogin('facebook')" />
              <Image class="third-party-item" :src="google.src" @click="utils.jumpToThirdPartyLogin('google')" />
              <Image class="third-party-item" :src="instagram.src" @click="utils.jumpToThirdPartyLogin('instagram')" />
              <Image class="third-party-item" :src="x.src" @click="utils.jumpToThirdPartyLogin('x')" />
              <Image class="third-party-item" :src="line.src" @click="utils.jumpToThirdPartyLogin('line')" />
            </div>
          </Transition>
          <div class="show-third-party" v-if="!showThirdPartyLogin" @click="showThirdPartyLogin = true">
            使用第三方登录
          </div>
        </div>
      </div>
    </div>
    <teleport to='body' >
      <Popup v-model:show="showCountryPicker" round position="bottom">
          <Picker
            :columns="countryCodeAndPhoneCodeList"
            :columns-field-names="{ text: 'chinese_name', value: 'phone_code' }"
            @confirm="showCountryPicker = false"
            @cancel="showCountryPicker = false"
            title="选择地区"
            :default-index="0"
            v-model="bindPhoneCode"
          >
            <template #option="option">
              <div style="padding: 0.5rem 0.75rem">{{ option.chinese_name }}(+{{ option.phone_code }})</div>
            </template>
          </Picker>
        </Popup>  
    </teleport>  
     
</template>
<style scoped lang="less">
  .send-btn {
    line-height: 30Px;
    padding: 0 10px;
    height: .5rem;
    font-size: 12px;
    box-sizing: border-box;
  }
  .inputField {
    border-radius: .1rem;
  }

  .show-third-party {
    margin: 15px 0;
    color: #fff;
    text-align: center;
    cursor: pointer;
    user-select: none;
  }
  // .logo-image {
  //   border-radius: 2rem;
  //   box-shadow: 0 0 .36rem #898989;
  //   width: 1.5rem; 
  //   height: 1.5rem;
  //   top: .2rem;
  //   margin-left: -1rem;
  //   background-color: #000;
  // }
  .login-btn {
    height: 0.8rem;
  }
  .login-small {
    .logo {
      width: 100%;
      height: 12rem;
      display: flex;
      justify-content: center;
      align-items: end;
    }
    .close-btn {
      position: fixed;
      top: 0.2rem;
      padding: .06rem;
      right: 0.2rem;
      border-radius: 50%;
      border: 1px solid #fff;
      color: #fff;
      font-size: 16px;
      background-color: transparent;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10;
      cursor: pointer;
    }

    .logo-wrapper {
      .logo {
        height: 1.42rem;
        top: -.6rem;
        position: relative;
        background-size: 100% 100%;
      }
      :deep(.van-image__img) {
        // border-radius: 2rem;
        // box-shadow: 0 0 .36rem #898989;
        // width: 1.5rem;
        // height: 1.5rem;
        // left: calc(50% + 15px);
        // top: .2rem;
        // margin-left: -1rem;
        // background-color: #000;
        width: 0.8rem;
        height: auto;
      }
    }
    .third-party {
      display: flex;
      justify-content: space-evenly;
      align-items: center;
      margin-top: 15px;
    }

    .third-party .third-party-item {
      width: min(10vw, 60px);
      height: min(10vw, 60px);
    }
    .form {
      padding: .6rem .5rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    .btn-wrapper {
      display: flex;
      align-items: center;
      height: 0.8rem;
    }

    .send-btn {
      display: flex;
      align-items: center; // 垂直置中
      justify-content: center; // 水平置中（可選）
      font-size: 12px;
      padding: 0 10px;
      box-sizing: border-box;
    }
    
    
  }
  .login {
    height: 100vh;
    margin: 0 auto;
    background-color: var(--custom-block-1);
    .logo { 
      height: 3.8rem;
      padding-top: .4rem;
      background-size: 100% 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
    }

    .form {
      margin: 0 .6rem;
      padding: .6rem .32rem 0;;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: .2rem;
      border-radius: 0.2rem;
      box-shadow: 0 0 0.36rem #898989;
    }

    .third-party {
      display: flex;
      justify-content: space-evenly;
      align-items: center;
    }

    .third-party .third-party-item {
      width: min(10vw, 60px);
      height: min(10vw, 60px);
    }
    .btn-wrapper {
      display: flex;
      align-items: center;
      height: 0.8rem;
    }
    .logo {
      background-color: #000
    }
    
    :deep(.logo-image > .van-image__img) {
      width: 1.74rem;
      height: 1.74rem;
      margin: 0 auto;
      
    }
  }
  .form div {
    width: 100%;
  }

 
  :deep(.van-nav-bar) {
    border-bottom: none !important;
    box-shadow: none !important;
  }
  
  :deep(.van-field) {
    padding: 0 var(--van-padding-sm);
    align-items: center;
    border: 1Px solid #fff;
    border-radius: 10px;
    height: .8rem;
    color: #fff;
    background: #131313;
    overflow: hidden; 
    margin-bottom: 15px;
    font-size: 18px;
  }
  .inputField :deep(.van-field__control) {
    line-height: 44px;
    height: 100%;
    box-sizing: border-box;
    color: #fff;
    font-size: 16px;
  }
  .inputField :deep(input:-internal-autofill-selected) {
    background: #131313;
  }
  .inputField :deep(.van-field__button) {
    padding-left: unset;
  }
  .inputField :deep(input:-webkit-autofill),
  .inputField :deep(input:-webkit-autofill:focus),
  .inputField :deep(input:-webkit-autofill:hover) {
    -webkit-box-shadow: 0 0 0 1000px #131313 inset !important;
    -webkit-text-fill-color: #fff !important;
    transition: background-color 9999s ease-in-out 0s !important;
  }

  .login-small {
  .logo {
    width: 100%;
    height: 12rem;
    display: flex;
    justify-content: center; // 水平置中
    align-items: end; // 底部對齊
    position: relative;
  }

  .logo-image {
    width: 1.5rem;
    height: 1.5rem;
    background-color: #000;
    border-radius: 2rem;
    box-shadow: 0 0 .36rem #898989;
    margin: 0 auto; // 保險置中
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .close-btn {
    position: fixed;
    top: 0.2rem;
    padding: .06rem;
    right: 0.2rem;
    border-radius: 50%;
    border: 1px solid #fff;
    color: #fff;
    font-size: 16px;
    background-color: transparent;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
    cursor: pointer;
  }
}
</style>