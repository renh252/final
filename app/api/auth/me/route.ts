import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/api/_lib/db'
import { auth } from '@/app/api/_lib/auth'

// 獲取當前用戶資料
export async function GET(request: NextRequest) {
  try {
    const user = await auth.fromRequest(request)

    if (!user) {
      return NextResponse.json(
        { success: false, message: '請先登入' },
        { status: 401 }
      )
    }

    // 查詢用戶詳細資料（不包含敏感信息如密碼）
    const [users, error] = await db.query(
      `
      SELECT 
        user_id, 
        user_email, 
        user_name,
        user_number AS mobile,
        user_address AS address,
        user_birthday AS birthday,
        user_level AS role,
        profile_picture,
        user_status AS status
      FROM users
      WHERE user_id = ? AND (user_status != '停用' OR user_status IS NULL)
      LIMIT 1
    `,
      [user.user_id]
    )

    if (error) {
      console.error('查詢用戶資料失敗:', error)
      return NextResponse.json(
        { success: false, message: '獲取用戶資料失敗' },
        { status: 500 }
      )
    }

    if ((users as any[]).length === 0) {
      return NextResponse.json(
        { success: false, message: '用戶不存在或已停用' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: (users as any[])[0],
    })
  } catch (err) {
    console.error('獲取用戶資料時發生錯誤:', err)
    return NextResponse.json(
      {
        success: false,
        message: '獲取用戶資料時發生錯誤',
      },
      { status: 500 }
    )
  }
}
