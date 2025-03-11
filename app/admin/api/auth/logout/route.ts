import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '../../_lib/database'
import { isAuthenticated } from '../../_lib/auth'

export async function POST(request: NextRequest) {
  try {
    // 驗證JWT
    const admin = await isAuthenticated(request)

    if (admin) {
      try {
        // 先檢查欄位是否存在
        const logoutColumnExists = await executeQuery(
          "SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'manager' AND COLUMN_NAME = 'last_logout_at'",
          []
        )

        // 如果欄位存在，則更新登出時間
        if (logoutColumnExists[0].count > 0) {
          await executeQuery(
            'UPDATE manager SET last_logout_at = NOW() WHERE id = ?',
            [admin.id]
          )
        }
      } catch (error) {
        console.warn('更新登出時間失敗:', error)
        // 但繼續處理登出流程，不要因為更新時間失敗而阻止登出
      }
    }

    // 在客戶端，應該清除令牌
    return NextResponse.json({
      success: true,
      message: '登出成功',
    })
  } catch (error) {
    console.error('登出錯誤:', error)
    return NextResponse.json(
      { success: false, message: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    )
  }
}
