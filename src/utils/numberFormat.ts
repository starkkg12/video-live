/**
 * 格式化数字
 * @param {number | string} num - 要格式化的数字或字符串
 * @returns {string} 格式化后的字符串
 *
 * 格式化规则:
 * - 小于1000，直接返回原数字
 * - 1000-9999，格式化为x.xK (千)
 * - 10000-99999999，格式化为x.x万
 * - 100000000及以上，格式化为x.x亿
 */
export default function formatNumber(num: number | string): string {
  const n = typeof num === 'string' ? parseFloat(num) : num

  if (isNaN(n)) {
    return '0'
  }

  if (n < 1000) {
    return n.toString()
  } else if (n < 10000) {
    return (n / 1000).toFixed(1) + 'K'
  } else if (n < 100000000) {
    return (n / 10000).toFixed(1) + '万'
  } else {
    return (n / 100000000).toFixed(1) + '亿'
  }
}
