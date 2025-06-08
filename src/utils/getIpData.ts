import axios from 'axios'

const getIpData = async () => {
  const response = await axios.get('https://ip.ai4funs.com/')
  const data = response.data
  // 将数据转换为 JSON 字符串
  const jsonString = JSON.stringify(data)
  // 将字符串转换为 Base64 编码
  const base64String = base64EncodeUnicode(jsonString)
  return base64String
}

function base64EncodeUnicode(str: string) {
  const encoder = new TextEncoder()
  const uint8Array = encoder.encode(str)
  let binary = ''
  uint8Array.forEach(byte => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}

export default getIpData
