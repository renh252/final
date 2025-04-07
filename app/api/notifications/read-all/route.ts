import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/api/_lib/db'
// 實際應用中需要引入資料庫連接和身份驗證
// import { getServerSession } from 'next-auth';

export async function POST(request: NextRequest) {
  try {
    // 從請求體獲取用戶ID或管理員ID
    const body = await request.json().catch(() => ({}))
    const userId = body.userId
    const adminId = body.adminId

    if (!userId && !adminId) {
      return NextResponse.json(
        { success: false, message: '缺少用戶ID或管理員ID' },
        { status: 400 }
      )
    }

    // 更新數據庫中的記錄
    let queryString = ''
    let queryParams: any[] = []

    if (adminId) {
      // 更新管理員通知，包括admin_id為NULL的通知
      queryString = `UPDATE notifications SET is_read = 1 WHERE (admin_id = ? OR admin_id IS NULL) AND is_read = 0`
      queryParams = [adminId]
    } else {
      // 更新用戶通知
      queryString = `UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0`
      queryParams = [userId]
    }

    console.log('執行標記全部已讀查詢:', queryString, queryParams)

    const [result, error] = await db.query(queryString, queryParams)

    if (error) {
      console.error('標記所有通知已讀失敗:', error)
      return NextResponse.json(
        { success: false, message: '標記所有通知已讀失敗' },
        { status: 500 }
      )
    }

    const idType = adminId ? '管理員' : '用戶'
    const id = adminId || userId
    console.log(`標記${idType} #${id} 的所有通知為已讀`)

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
