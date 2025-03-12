import { NextResponse } from 'next/server'
import { verifyToken } from './jwt'

/**
 * 將數據導出為 CSV 格式
 * @param data 要導出的數據數組
 * @param filename 文件名（不含擴展名）
 */
export function exportToCsv(data: any[], filename: string): NextResponse {
  if (!data || !data.length) {
    return NextResponse.json({ error: '沒有可導出的數據' }, { status: 400 })
  }

  try {
    // 獲取所有列
    const columns = Object.keys(data[0])

    // 創建 CSV 內容
    let csvContent = columns.join(',') + '\n'

    // 添加數據行
    data.forEach((item) => {
      const row = columns
        .map((column) => {
          const value = item[column]
          // 處理特殊字符，如逗號、引號等
          if (value === null || value === undefined) {
            return ''
          }
          const stringValue = String(value)
          // 如果值包含逗號、引號或換行符，則用引號包裹並轉義引號
          if (
            stringValue.includes(',') ||
            stringValue.includes('"') ||
            stringValue.includes('\n')
          ) {
            return `"${stringValue.replace(/"/g, '""')}"`
          }
          return stringValue
        })
        .join(',')
      csvContent += row + '\n'
    })

    // 設置響應頭
    const headers = new Headers()
    headers.append('Content-Type', 'text/csv; charset=utf-8')
    headers.append(
      'Content-Disposition',
      `attachment; filename=${filename}.csv`
    )

    return new NextResponse(csvContent, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('導出 CSV 時發生錯誤：', error)
    return NextResponse.json({ error: '導出 CSV 時發生錯誤' }, { status: 500 })
  }
}

/**
 * 將數據導出為 JSON 格式
 * @param data 要導出的數據數組
 * @param filename 文件名（不含擴展名）
 */
export function exportToJson(data: any[], filename: string): NextResponse {
  if (!data || !data.length) {
    return NextResponse.json({ error: '沒有可導出的數據' }, { status: 400 })
  }

  try {
    // 將數據轉換為 JSON 字符串
    const jsonContent = JSON.stringify(data, null, 2)

    // 設置響應頭
    const headers = new Headers()
    headers.append('Content-Type', 'application/json; charset=utf-8')
    headers.append(
      'Content-Disposition',
      `attachment; filename=${filename}.json`
    )

    return new NextResponse(jsonContent, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('導出 JSON 時發生錯誤：', error)
    return NextResponse.json({ error: '導出 JSON 時發生錯誤' }, { status: 500 })
  }
}

/**
 * 驗證管理員權限
 * @param request 請求對象
 * @returns 驗證結果，包含成功/失敗狀態和可能的錯誤響應
 */
export async function verifyAdmin(request: Request): Promise<{
  success: boolean
  response?: NextResponse
}> {
  // 驗證管理員權限
  const token = request.headers.get('Authorization')?.split(' ')[1]
  if (!token) {
    return {
      success: false,
      response: NextResponse.json({ error: '未授權訪問' }, { status: 401 }),
    }
  }

  try {
    const decoded = await verifyToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return {
        success: false,
        response: NextResponse.json(
          { error: '沒有權限訪問此資源' },
          { status: 403 }
        ),
      }
    }

    return { success: true }
  } catch (error) {
    console.error('驗證管理員權限時發生錯誤：', error)
    return {
      success: false,
      response: NextResponse.json({ error: '驗證失敗' }, { status: 401 }),
    }
  }
}
