import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/admin/_lib/auth'

// 已轉換舊格式權限的用戶ID暫存，避免重複日誌
const convertedUsers = new Set<number>()

export async function GET(request: NextRequest) {
  try {
    console.log('開始處理管理員驗證請求')

    // 驗證JWT
    const authData = await auth.fromRequest(request)

    if (!authData) {
      console.log('驗證失敗：未授權或令牌已過期')
      return NextResponse.json(
        { success: false, message: '未授權或令牌已過期' },
        { status: 401 }
      )
    }

    console.log('JWT驗證成功，用戶ID:', authData.id)

    // 從資料庫獲取完整的管理員資訊
    const managerData = await auth.getAdmin(authData.id)

    if (!managerData) {
      console.log('找不到管理員資訊，ID:', authData.id)
      return NextResponse.json(
        { success: false, message: '管理員資訊不存在' },
        { status: 404 }
      )
    }

    // 確保 manager_privileges 字段有值且格式正確
    if (!managerData.manager_privileges) {
      console.warn('警告：管理員權限為空，ID:', authData.id)
      managerData.manager_privileges = ''
    } else {
      // 檢查權限格式是否符合標準 (應該包含冒號或是111)
      const privileges = managerData.manager_privileges
      if (privileges !== '111' && !privileges.includes(':')) {
        // 只有第一次轉換時才記錄日誌
        const isFirstConversion = !convertedUsers.has(managerData.id)

        if (isFirstConversion) {
          convertedUsers.add(managerData.id)
          console.log(
            `管理員 ${managerData.id} 正在使用舊格式權限 '${privileges}'，已自動轉換為標準格式`
          )
        }

        // 處理舊式權限格式
        if (privileges === 'donation') {
          managerData.manager_privileges =
            'finance:read,finance:transactions:read'
        } else if (privileges === 'general') {
          managerData.manager_privileges = 'members:read,shop:read'
        } else {
          // 對於未知的非標準格式，提供最基本的權限
          managerData.manager_privileges = 'members:read'
        }
      }
    }

    console.log('驗證成功，返回管理員信息:', JSON.stringify(managerData))

    // 返回管理員信息 - 直接使用資料庫欄位名稱
    return NextResponse.json({
      success: true,
      message: '令牌有效',
      data: { admin: managerData },
    })
  } catch (error) {
    console.error('驗證錯誤:', error)
    return NextResponse.json(
      { success: false, message: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    )
  }
}
