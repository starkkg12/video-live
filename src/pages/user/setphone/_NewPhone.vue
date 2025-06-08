<script setup lang="ts">
import StateManager from '@/components/StateManager.vue'
import countryCodeAndPhoneCodeList from '@/constants/countryCodeAndPhoneCode.json'
import service from '@/service'
import utils from '@/utils'
import { useCountDown } from '@vant/use'
import { Button, Field, NavBar, Picker, Popup, showConfirmDialog, showDialog } from 'vant'
import { computed, onMounted, ref } from 'vue'
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

const token = computed(() => {
  if (typeof window !== 'undefined') {
    return utils.getLSItem(constants.localStorageKeys.SMS_TOKEN) || ''
  }
  return ''
})

onMounted(() => {
  if (!token.value) {
    showDialog({
      title: '错误',
      message: '缺少必要的验证信息，请重新验证当前手机号',
      beforeClose: () => {
        utils.jumpTo('/user/setphone')
        return true
      },
    })
  }
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
      phone.value,
      token.value
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
    console.error('error sending verification code', error)
    showDialog({ title: '发送失败', message: '发送失败，请稍后再试' })
  } finally {
    isLoading.value = false
  }
}

async function changePhone() {
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
        beforeClose: () => {
          utils.setLSItem(constants.localStorageKeys.SMS_TOKEN, '')
          setTimeout(() => {
            utils.jumpTo('/user')
          }, 1500)
          return true
        },
      })
    } else {
      showDialog({ title: '修改失败', message: response.data.errMessage })
    }
  } catch (error) {
    console.error('Failed to change phone number', error)
    showDialog({ title: '修改失败', message: '修改失败，请稍后再试' })
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
      <div class="tip">请输入您要更换的新手机号</div>
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
        <Field
          size="large"
          v-model="phone"
          center
          clearable
          placeholder="请输入新手机号"
          type="tel"
        >
          <template #button>
            <Button
              size="small"
              type="primary"
              :disabled="
                countDown.current.value.seconds !== 0 ||
                !phone ||
                phone.length < 7 ||
                phone.length > 15 ||
                !/^\d+$/.test(phone) ||
                !token
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
        <Field size="large" v-model="sms" placeholder="请输入验证码" type="text" maxlength="6" />
      </div>
      <Button
        type="primary"
        block
        round
        :loading="isLoading"
        @click="changePhone"
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
        style="margin-top: 20px"
      >
        确认修改
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
          <div>{{ option.chinese_name }} +{{ option.phone_code }}</div>
        </template>
      </Picker>
    </Popup>
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
</style>
