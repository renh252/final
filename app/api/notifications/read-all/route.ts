import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'
// 實際應用中需要引入資料庫連接和身份驗證
// import { db } from '@/app/lib/db';
// import { getServerSession } from 'next-auth';

export async function POST(request: NextRequest) {
  try {
    // 從請求體獲取用戶ID
    const body = await request.json().catch(() => ({}))
    const userId = body.userId

    if (!userId) {
      return NextResponse.json(
        { success: false, message: '缺少用戶ID' },
        { status: 400 }
      )
    }

    // 更新數據庫中的記錄
    await executeQuery(
      `UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0`,
      [userId]
    )

    console.log(`標記用戶 #${userId} 的所有通知為已讀`)

    return NextResponse.json({
      success: true,
      message: '所有通知已標記為已讀',
    })
  } catch (error) {
    console.error('標記所有通知已讀失敗:', error)
    return NextResponse.json(
      { success: false, message: '標記所有通知已讀失敗' },
      { status: 500 }
    )
  }
}
