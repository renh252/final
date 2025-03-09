import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/db'
import { isAuthenticated } from '@/app/admin/api/_lib/auth'

export async function POST(request: NextRequest) {
  try {
    // 驗證JWT
    const admin = await isAuthenticated(request)

    if (admin) {
      // 記錄登出時間
      await db.query('UPDATE manager SET last_logout_at = NOW() WHERE id = ?', [
        admin.id,
      ])
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
