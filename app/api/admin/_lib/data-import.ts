import { NextResponse } from 'next/server'

/**
 * 從 CSV 字符串解析數據
 * @param csvString CSV 格式的字符串
 * @returns 解析後的數據數組
 */
export function parseCSV(csvString: string): any[] {
  try {
    // 按行分割
    const lines = csvString.split('\n').filter((line) => line.trim() !== '')

    // 第一行是標題
    const headers = lines[0].split(',').map((header) => header.trim())

    // 解析數據行
    const data = []
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      const values = []
      let inQuotes = false
      let currentValue = ''

      // 手動解析 CSV，處理引號內的逗號
      for (let j = 0; j < line.length; j++) {
        const char = line[j]

        if (char === '"' && (j === 0 || line[j - 1] !== '\\')) {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue)
          currentValue = ''
        } else {
          currentValue += char
        }
      }

      // 添加最後一個值
      values.push(currentValue)

      // 創建對象
      const obj: Record<string, string> = {}
      for (let j = 0; j < headers.length; j++) {
        // 處理引號
        let value = values[j] || ''
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1).replace(/""/g, '"')
        }
        obj[headers[j]] = value
      }

      data.push(obj)
    }

    return data
  } catch (error) {
    console.error('解析 CSV 時發生錯誤：', error)
    throw new Error('CSV 格式無效')
  }
}

/**
 * 從 JSON 字符串解析數據
 * @param jsonString JSON 格式的字符串
 * @returns 解析後的數據數組
 */
export function parseJSON(jsonString: string): any[] {
  try {
    const data = JSON.parse(jsonString)

    // 確保數據是數組
    if (!Array.isArray(data)) {
      throw new Error('JSON 數據必須是數組格式')
    }

    return data
  } catch (error) {
    console.error('解析 JSON 時發生錯誤：', error)
    throw new Error('JSON 格式無效')
  }
}

/**
 * 驗證導入的數據是否符合指定的模式
 * @param data 導入的數據
 * @param requiredFields 必填字段數組
 * @param validateField 字段驗證函數，返回錯誤消息或 null
 * @returns 驗證結果，包含成功/失敗狀態和錯誤信息
 */
export function validateImportData(
  data: any[],
  requiredFields: string[],
  validateField?: (field: string, value: any) => string | null
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // 檢查數據是否為空
  if (!data || data.length === 0) {
    errors.push('導入的數據為空')
    return { valid: false, errors }
  }

  // 檢查每條記錄
  data.forEach((item, index) => {
    // 檢查必填字段
    for (const field of requiredFields) {
      if (
        item[field] === undefined ||
        item[field] === null ||
        item[field] === ''
      ) {
        errors.push(`第 ${index + 1} 條記錄缺少必填字段: ${field}`)
      }
    }

    // 如果提供了字段驗證函數，則進行驗證
    if (validateField) {
      for (const [field, value] of Object.entries(item)) {
        const error = validateField(field, value)
        if (error) {
          errors.push(`第 ${index + 1} 條記錄字段 ${field} 驗證失敗: ${error}`)
        }
      }
    }
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * 處理文件上傳並解析數據
 * @param formData 包含文件的表單數據
 * @returns 解析後的數據
 */
export async function processFileUpload(formData: FormData): Promise<{
  success: boolean
  data?: any[]
  error?: string
}> {
  try {
    const file = formData.get('file') as File

    if (!file) {
      return { success: false, error: '未找到上傳的文件' }
    }

    // 檢查文件類型
    const fileName = file.name.toLowerCase()
    const fileContent = await file.text()

    let data: any[]

    if (fileName.endsWith('.csv')) {
      data = parseCSV(fileContent)
    } else if (fileName.endsWith('.json')) {
      data = parseJSON(fileContent)
    } else {
      return { success: false, error: '不支持的文件格式，僅支持 CSV 和 JSON' }
    }

    return { success: true, data }
  } catch (error) {
    console.error('處理文件上傳時發生錯誤：', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '處理文件上傳時發生錯誤',
    }
  }
}
