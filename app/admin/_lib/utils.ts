/**
 * 管理後台通用工具函數庫
 */

/**
 * 格式化日期為易讀格式
 * @param dateInput 日期字符串或日期對象
 * @param includeTime 是否包含時間部分
 * @returns 格式化後的日期字符串，格式為 YYYY-MM-DD 或 YYYY-MM-DD HH:MM:SS
 */
export function formatDate(
  dateInput: string | Date | null | undefined,
  includeTime = false
): string {
  if (!dateInput) return '-'

  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput

    // 檢查日期是否有效
    if (isNaN(date.getTime())) {
      return '-'
    }

    // 格式化日期部分
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`

    // 如果需要包含時間
    if (includeTime) {
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${dateStr} ${hours}:${minutes}:${seconds}`
    }

    return dateStr
  } catch (error) {
    console.error('Error formatting date:', error)
    return '-'
  }
}

/**
 * 格式化金額為貨幣格式
 * @param amount 金額數值
 * @param currency 貨幣符號，預設為 NT$
 * @returns 格式化後的金額字符串
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  currency = 'NT$'
): string {
  if (amount === null || amount === undefined || amount === '') {
    return '-'
  }

  try {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

    if (isNaN(numAmount)) {
      return '-'
    }

    return `${currency} ${numAmount.toLocaleString('zh-TW')}`
  } catch (error) {
    console.error('Error formatting currency:', error)
    return '-'
  }
}

/**
 * 截斷文本並添加省略號
 * @param text 要截斷的文本
 * @param maxLength 最大長度
 * @returns 截斷後的文本
 */
export function truncateText(
  text: string | null | undefined,
  maxLength: number
): string {
  if (!text) return ''

  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
}

/**
 * 生成隨機ID
 * @param length ID長度
 * @returns 隨機ID字符串
 */
export function generateRandomId(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return result
}

/**
 * 深度複製對象
 * @param obj 要複製的對象
 * @returns 複製後的新對象
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * 檢查是否為有效的電子郵件格式
 * @param email 電子郵件地址
 * @returns 是否有效
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 檢查是否為有效的台灣手機號碼
 * @param phone 手機號碼
 * @returns 是否有效
 */
export function isValidTaiwanPhone(phone: string): boolean {
  const phoneRegex = /^09\d{8}$/
  return phoneRegex.test(phone)
}
