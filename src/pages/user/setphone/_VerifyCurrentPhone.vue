<script setup lang="ts">
import StateManager from '@/components/StateManager.vue'
import service from '@/service'
import utils from '@/utils'
import { useCountDown } from '@vant/use'
import { Button, Field, NavBar, showDialog } from 'vant'
import { computed, onMounted, ref } from 'vue'
import constants from '@/constants'

const isLoading = ref(false)
const countDown = useCountDown({ time: 60 * 1000 })
const maskedPhone = ref('')
const actualPhone = ref('')
const hiddenDigits = ref('')
const sms = ref('')
const smsToken = ref('')
const userInfo = ref<any>(null)
const isPhoneVerified = ref(false)

// 从掩码手机号中提取前后数字和中间的*数量
function parseMaskedPhone(masked: string) {
  const match = masked.match(/^(\d+)(\*+)(\d+)$/)
  if (match) {
    const [_, prefix, stars, suffix] = match
    return {
      prefix,
      starsCount: stars.length,
      suffix,
    }
  }
  return null
}

onMounted(async () => {
  try {
    isLoading.value = true
    const response = await service.user.getUserInfo()
    if (response.data.success) {
      userInfo.value = response.data.data
      maskedPhone.value = userInfo.value.mobile
      const parsed = parseMaskedPhone(maskedPhone.value)
      if (parsed) {
        hiddenDigits.value = ''
      }
    }
  } catch (error) {
    console.error('Failed to get user info', error)
  } finally {
    isLoading.value = false
  }
})

const phoneInfo = computed(() => {
  const parsed = parseMaskedPhone(maskedPhone.value)
  if (!parsed) return null
  return {
    prefix: parsed.prefix,
    suffix: parsed.suffix,
    starsCount: parsed.starsCount,
    isComplete: hiddenDigits.value.length === parsed.starsCount,
  }
})

const completePhone = computed(() => {
  if (!phoneInfo.value) return ''
  return phoneInfo.value.prefix + hiddenDigits.value + phoneInfo.value.suffix
})

function onBack() {
  typeof window !== 'undefined' && window.history.back()
}

function verifyHiddenDigits() {
  if (!phoneInfo.value) return

  if (hiddenDigits.value.length !== phoneInfo.value.starsCount) {
    showDialog({ title: '验证失败', message: '请输入完整的手机号码' })
    return
  }

  if (!/^\d+$/.test(hiddenDigits.value)) {
    showDialog({ title: '验证失败', message: '请输入正确的数字' })
    return
  }

  actualPhone.value = completePhone.value
  isPhoneVerified.value = true
}

async function sendSms() {
  if (!isPhoneVerified.value) {
    showDialog({ title: '发送失败', message: '请先完成手机号验证' })
    return
  }

  try {
    isLoading.value = true
    const response = await service.user.currentMobileSendCode(
      userInfo.value?.mobileCountryCode || '86',
      actualPhone.value
    )
    if (response.data.success) {
      smsToken.value = response.data.data.token
      showDialog({ title: '发送成功', message: '验证码已发送到当前手机号，请注意查收' })
      sms.value = ''
      countDown.reset()
      countDown.start()
    } else {
      showDialog({ title: '发送失败', message: response.data.errMessage })
    }
  } catch (error) {
    console.error('error sending verification code', error)
    showDialog({ title: '发送失败', message: '发送失败，请稍后再试' })
  } finally {
    isLoading.value = false
  }
}

async function verifyCode() {
  if (!sms.value) {
    showDialog({ title: '验证失败', message: '请输入验证码' })
    return
  }

  if (sms.value.length !== 6) {
    showDialog({ title: '验证失败', message: '请输入正确的验证码' })
    return
  }

  if (smsToken.value === '') {
    showDialog({ title: '验证失败', message: '请先发送验证码' })
    return
  }

  try {
    isLoading.value = true
    const response = await service.user.currentMobileVerify(smsToken.value, sms.value)
    if (response.data.success) {
      const token = response.data.data.token
      utils.setLSItem(constants.localStorageKeys.SMS_TOKEN, token)
      utils.jumpTo('/user/setphone/change-phone')
    } else {
      showDialog({ title: '验证失败', message: response.data.errMessage })
    }
  } catch (error) {
    console.error('Failed to verify code', error)
    showDialog({ title: '验证失败', message: '验证失败，请稍后再试' })
  } finally {
    isLoading.value = false
  }
}

function onlyAllowDigits() {
  hiddenDigits.value = hiddenDigits.value.replace(/\D/g, '')
}
</script>

<template>
  <StateManager :loading="isLoading">
    <NavBar
      title="验证当前手机号"
      safe-area-inset-top
      fixed
      placeholder
      left-arrow
      @click-left="onBack"
    />

    <div class="form">
      <div class="tip">为了保障您的账号安全，更换手机号前需要验证当前手机号</div>

      <div v-if="phoneInfo && !isPhoneVerified" class="phone-verify">
        <div class="phone-label">请补全您的手机号：</div>
        <div class="phone-input-container">
          <div class="digit-boxes">
            <div
              v-for="digit in phoneInfo.prefix.split('')"
              :key="`prefix-${digit}`"
              class="digit-box disabled"
            >
              {{ digit }}
            </div>
          </div>
          <div class="hidden-digits">
            <input
              v-model="hiddenDigits"
              type="tel"
              inputmode="numeric"
              pattern="[0-9]*"
              :maxlength="phoneInfo.starsCount"
              placeholder="请输入"
              class="hidden-input"
              @input="onlyAllowDigits"
            />
            <div class="digit-boxes">
              <div
                v-for="i in phoneInfo.starsCount"
                :key="i"
                class="digit-box"
                :class="{ filled: hiddenDigits[i - 1] }"
              >
                {{ hiddenDigits[i - 1] || '' }}
              </div>
            </div>
          </div>
          <div class="digit-boxes">
            <div
              v-for="digit in phoneInfo.suffix.split('')"
              :key="`suffix-${digit}`"
              class="digit-box disabled"
            >
              {{ digit }}
            </div>
          </div>
        </div>
        <Button
          type="primary"
          block
          round
          :disabled="!phoneInfo.isComplete"
          @click="verifyHiddenDigits"
          style="margin-top: 20px"
        >
          确认
        </Button>
      </div>

      <template v-if="isPhoneVerified">
        <div class="verified-phone">
          <Field size="large" :model-value="actualPhone" center readonly label="当前手机号">
            <template #button>
              <Button
                size="small"
                type="primary"
                :disabled="countDown.current.value.seconds !== 0"
                :loading="isLoading"
                loading-text="发送中..."
                @click="sendSms"
              >
                发送验证码
                <span
                  v-if="countDown.current.value.seconds"
                  style="width: 27px; display: inline-block"
                >
                  ({{ countDown.current.value.seconds }})
                </span>
              </Button>
            </template>
          </Field>
        </div>
        <div>
          <Field size="large" v-model="sms" placeholder="请输入验证码" type="text" maxlength="6" />
        </div>
        <Button
          type="primary"
          block
          round
          :loading="isLoading"
          @click="verifyCode"
          :disabled="!sms || sms.length !== 6 || smsToken === ''"
          style="margin-top: 20px"
        >
          验证并继续
        </Button>
      </template>
    </div>
  </StateManager>
</template>

<style scoped>
.form {
  padding: 1rem;
}
.tip {
  color: #666;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}
.phone-verify {
  margin-top: 20px;
}
.phone-label {
  font-size: 14px;
  color: var(--van-gray-7);
  margin-bottom: 12px;
}
.phone-input-container {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 20px;
  width: 100%;
  overflow-x: auto;
}
.phone-segment {
  font-size: 20px;
  color: var(--van-gray-7);
  font-weight: 500;
}
.hidden-digits {
  position: relative;
  height: 44px;
}
.hidden-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  z-index: 1;
}
.digit-boxes {
  display: flex;
  gap: 4px;
  height: 100%;
}
.digit-box {
  width: 32px;
  height: 44px;
  border: 1px solid var(--van-gray-5);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 500;
  background: #fff;
  transition: all 0.3s;
}
.digit-box.filled {
  border-color: #07c160;
  background: #f0fff0;
}
.verified-phone {
  margin-bottom: 16px;
}
.digit-box.disabled {
  background-color: var(--van-gray-4);
  color: var(--van-gray-7);
  cursor: not-allowed;
}

@media screen and (max-width: 375px) {
  .phone-input-container {
    justify-content: center;
  }

  .digit-box {
    width: 28px;
    height: 40px;
    font-size: 16px;
  }

  .digit-boxes {
    gap: 2px;
  }
}
</style>
