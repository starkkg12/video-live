<script setup lang="ts">
import { NavBar, Icon, Field, Button, Popup, Picker, showDialog, showConfirmDialog } from 'vant'
import StateManager from '@/components/StateManager.vue'
import { computed, ref } from 'vue'
import { useCountDown } from '@vant/use'
import countryCodeAndPhoneCodeList from '@/constants/countryCodeAndPhoneCode.json'
import service from '@/service'
import utils from '@/utils'
import constants from '@/constants'

interface CountryAndPhoneCode {
  english_name: string
  chinese_name: string
  country_code: string
  phone_code: string
}

const isLoading = ref(false)
const phoneCode = ref('86')
const showCountryPicker = ref(false)
const countDown = useCountDown({ time: 60 * 1000 })
const phone = ref('')
const sms = ref('')
const smsToken = ref('')
const smsTokenPhone = ref('')
const passwordErrorMessage = ref<string>()

const loginSmsToken = computed(() => {
  return utils.getLSItem(constants.localStorageKeys.SMS_TOKEN)
})

const countryLabel = computed(() => {
  const country = countryCodeAndPhoneCodeList.find(
    (item: CountryAndPhoneCode) => item.phone_code === phoneCode.value
  )
  return country ? `${country.chinese_name}(+${country.phone_code})` : ''
})
const bindPhoneCode = computed<string[]>({
  get: () => [phoneCode.value],
  set: value => {
    phoneCode.value = value[0]
  },
})

function onBack() {
  typeof window !== 'undefined' && window.history.back()
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
    const response = await service.user.changeMobileSendCode(
      phoneCode.value,
      phone.value
      // loginSmsToken.value
    )
    if (response.data.success) {
      smsToken.value = response.data.data.token
      smsTokenPhone.value = phone.value
      showDialog({ title: '发送成功', message: '验证码已发送，请注意查收' })
      sms.value = ''
      countDown.reset()
      countDown.start()
    } else {
      showDialog({ title: '发送失败', message: response.data.errMessage })
    }
  } catch (error) {
    console.error('error cc modifyMobileSendCode', error)
    showDialog({ title: '发送失败', message: '发送失败，请稍后再试' })
  } finally {
    isLoading.value = false
  }
}

async function smsLogin() {
  if (!phone.value) {
    showDialog({ title: '修改失败', message: '请输入手机号' })
    return
  }

  if (phone.value.length < 7) {
    showDialog({ title: '修改失败', message: '请输入正确的手机号' })
    return
  }

  if (phone.value.length > 15) {
    showDialog({ title: '修改失败', message: '请输入正确的手机号' })
    return
  }

  if (!/^\d+$/.test(phone.value)) {
    showDialog({ title: '修改失败', message: '请输入正确的手机号' })
    return
  }

  if (!sms.value) {
    showDialog({ title: '修改失败', message: '请输入验证码' })
    return
  }

  if (sms.value.length !== 6) {
    showDialog({ title: '修改失败', message: '请输入正确的验证码' })
    return
  }

  if (smsToken.value === '') {
    showDialog({ title: '修改失败', message: '请重新发送验证码' })
    return
  }

  if (smsTokenPhone.value !== phone.value) {
    showDialog({ title: '修改失败', message: '请重新发送验证码' })
    return
  }
  try {
    isLoading.value = true
    const response = await service.user.changeMobileVerify(smsToken.value, sms.value)
    if (response.data.success) {
      showConfirmDialog({
        title: '修改成功',
        message: '手机号修改成功',
        confirmButtonText: '确定',
        showCancelButton: false,
        beforeClose: onBack,
      })
    } else {
      showDialog({ title: '修改失败', message: response.data.errMessage })
    }
  } catch (error) {
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <StateManager :loading="isLoading">
    <NavBar
      title="修改手机号"
      safe-area-inset-top
      fixed
      placeholder
      left-arrow
      @click-left="onBack"
    />

    <div class="form">
      <div>
        <Field
          v-model="countryLabel"
          is-link
          readonly
          placeholder="国家/地区"
          @click="showCountryPicker = true"
        />
      </div>
      <div>
        <Field size="large" v-model="phone" center clearable placeholder="请输入手机号" type="tel">
          <template #button>
            <Button
              size="small"
              type="primary"
              color="#07c160"
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
        color="#07c160"
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
        登录 / 注册
      </Button>
    </div>

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
          <div style="padding: 0.5rem 0.75rem">
            {{ option.chinese_name }}(+{{ option.phone_code }})
          </div>
        </template>
      </Picker>
    </Popup>
  </StateManager>
</template>

<style scoped>
.form {
  padding: 1rem 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.form div {
  width: 100%;
}
</style>
