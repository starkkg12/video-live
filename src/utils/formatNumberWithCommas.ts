function formatNumberWithCommas(input: number | string): string {
  if (typeof input !== 'number' && typeof input !== 'string') {
    throw new Error('Input must be a number or a string.')
  }

  // 将输入转为字符串后再处理
  const numberString = input.toString()

  // 检查是否是有效的数字格式
  if (isNaN(Number(numberString))) {
    throw new Error('Input must be a valid number.')
  }

  // 使用正则表达式插入逗号
  return numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export default formatNumberWithCommas
