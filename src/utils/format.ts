/**
 * 格式化数字为易读形式
 * - 10000以上显示为 x 万 (万)
 * @param value 要格式化的数字
 * @param decimals 小数点位数(默认1位)
 * @returns 格式化后的字符串
 */
export function formatNumber(value: number | string | undefined | null): string {
  if (value === undefined || value === null) return '0';
  
  const num = Number(value);
  if (isNaN(num)) return '0';
  
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  } else {
    return num.toString();
  }
} 