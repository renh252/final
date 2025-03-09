import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/app/admin/api/_lib/database'
import { isAuthenticated } from '@/app/admin/api/_lib/auth'

export async function POST(request: NextRequest) {
  try {
    // 驗證JWT
    const admin = await isAuthenticated(request)

    if (admin) {
      try {
        // 注意：若 manager 表中沒有 last_logout_at 欄位，此操作會失敗
        // 以下語句使用 IF EXISTS 確保語句不會因欄位不存在而失敗
        await executeQuery(
          "SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'manager' AND COLUMN_NAME = 'last_logout_at'); " +
            "SET @sql = IF(@column_exists > 0, 'UPDATE manager SET last_logout_at = NOW() WHERE id = ?', 'SELECT 1'); " +
            'PREPARE stmt FROM @sql; ' +
            'EXECUTE stmt USING ?; ' +
            'DEALLOCATE PREPARE stmt;',
          [admin.id]
        )
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
