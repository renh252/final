import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'
import { getServerSession } from 'next-auth/next'

export async function GET(request: NextRequest) {
  try {
    // 獲取查詢參數
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // 如果沒有提供 userId，嘗試從 session 獲取
    // 這裡我們不使用 getServerSession 因為我們的項目使用自定義認證
    if (!userId) {
      return NextResponse.json(
        { success: false, message: '需要使用者ID' },
        { status: 400 }
      )
    }

    // 構建基本查詢
    let query = `
      SELECT * FROM notifications 
      WHERE user_id = ?
    `
    let params: any[] = [userId]

    // 如果提供了類型過濾
    if (type && type !== 'all') {
      query += ` AND type = ?`
      params.push(type)
    }

    // 添加排序和分頁
    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`
    params.push(limit, offset)

    // 執行查詢
    const notifications = await executeQuery(query, params)

    // 計算未讀通知數量
    const countQuery = `
      SELECT COUNT(*) as count FROM notifications 
      WHERE user_id = ? AND is_read = 0
    `
    const countResult = await executeQuery(countQuery, [userId])
    const unreadCount = countResult[0]?.count || 0

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    })
  } catch (error) {
    console.error('獲取通知失敗:', error)
    return NextResponse.json(
      { success: false, message: '獲取通知失敗' },
      { status: 500 }
    )
  }
}
