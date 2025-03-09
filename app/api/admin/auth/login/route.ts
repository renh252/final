import { NextRequest, NextResponse } from 'next/server'
import adminPool, { executeQuery } from '@/app/admin/api/_lib/database'
import { generateToken, verifyPassword } from '@/app/admin/api/_lib/jwt'

export async function POST(request: NextRequest) {
  try {
    // 解析請求體
    const body = await request.json()
    const { account, password } = body

    // 驗證參數
    if (!account || !password) {
      return NextResponse.json(
        { success: false, message: '帳號和密碼必須提供' },
        { status: 400 }
      )
    }

    try {
      // 從資料庫查詢管理員 - 修正欄位名稱
      // 首先檢查 is_active 欄位是否存在
      const isActiveExists = await executeQuery(
        "SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'manager' AND COLUMN_NAME = 'is_active'",
        []
      )

      // 根據 is_active 欄位是否存在選擇不同的查詢語句
      const query =
        isActiveExists[0].count > 0
          ? 'SELECT id, manager_account, manager_password, manager_privileges FROM manager WHERE manager_account = ? AND is_active = 1 LIMIT 1'
          : 'SELECT id, manager_account, manager_password, manager_privileges FROM manager WHERE manager_account = ? LIMIT 1'

      const managers = await executeQuery(query, [account])

      // 驗證管理員存在
      const manager = managers[0]
      if (!manager) {
        return NextResponse.json(
          { success: false, message: '帳號或密碼錯誤' },
          { status: 401 }
        )
      }

      // 驗證密碼
      const isPasswordValid = await verifyPassword(
        password,
        manager.manager_password
      )
      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, message: '帳號或密碼錯誤' },
          { status: 401 }
        )
      }

      // 生成 JWT
      const token = await generateToken({
        id: manager.id,
        account: manager.manager_account,
        privileges: manager.manager_privileges,
      })

      // 更新最後登入時間，確認表是否有 last_login_at 欄位
      try {
        // 使用 INFORMATION_SCHEMA 檢查欄位是否存在，並只在存在時更新
        await executeQuery(
          "SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'manager' AND COLUMN_NAME = 'last_login_at'); " +
            "SET @sql = IF(@column_exists > 0, 'UPDATE manager SET last_login_at = NOW() WHERE id = ?', 'SELECT 1'); " +
            'PREPARE stmt FROM @sql; ' +
            'EXECUTE stmt USING ?; ' +
            'DEALLOCATE PREPARE stmt;',
          [manager.id]
        )
      } catch (updateError) {
        console.warn('更新登入時間失敗:', updateError)
        // 但繼續處理登入流程，不要因為更新時間失敗而阻止登入
      }

      // 返回成功響應
      return NextResponse.json({
        success: true,
        message: '登入成功',
        data: {
          token,
          admin: {
            id: manager.id,
            account: manager.manager_account,
            privileges: manager.manager_privileges,
          },
        },
      })
    } catch (dbError) {
      console.error('資料庫操作錯誤:', dbError)
      return NextResponse.json(
        { success: false, message: '資料庫連接錯誤，請稍後再試' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('登入錯誤:', error)
    return NextResponse.json(
      { success: false, message: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    )
  }
}
