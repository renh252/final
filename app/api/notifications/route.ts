import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/api/_lib/db'
import { getServerSession } from 'next-auth/next'
import { RowDataPacket } from 'mysql2/promise'

interface CountResult extends RowDataPacket {
  count: number
}

export async function GET(request: NextRequest) {
  try {
    // 獲取查詢參數
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const adminId = searchParams.get('adminId')
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // 如果沒有提供 userId 或 adminId，返回錯誤
    if (!userId && !adminId) {
      return NextResponse.json(
        { success: false, message: '需要使用者ID或管理員ID' },
        { status: 400 }
      )
    }

    // 構建基本查詢
    let query = ''
    let params: any[] = []

    if (adminId) {
      // 僅查詢發給特定管理員的通知，移除 admin_id IS NULL 條件
      query = `
        SELECT * FROM notifications 
        WHERE admin_id = ?
      `
      params = [adminId]
    } else {
      // 查詢用戶通知
      query = `
        SELECT * FROM notifications 
        WHERE user_id = ?
      `
      params = [userId]
    }

    // 如果提供了類型過濾
    if (type && type !== 'all') {
      query += ` AND type = ?`
      params.push(type)
    }

    // 添加排序和分頁
    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`
    params.push(limit, offset)

    console.log('執行通知查詢:', query, params)

    // 執行查詢
    const [notifications, error] = await db.query(query, params)

    if (error) {
      console.error('查詢通知失敗:', error)

      // 檢查是否為資料表不存在的錯誤
      if (
        error.message &&
        error.message.includes('Table') &&
        error.message.includes("doesn't exist")
      ) {
        return NextResponse.json({
          success: true,
          notifications: [],
          unreadCount: 0,
          message: '通知功能尚未完全設置',
        })
      }

      return NextResponse.json(
        { success: false, message: '查詢通知數據庫失敗' },
        { status: 500 }
      )
    }

    // 計算未讀通知數量
    let countQuery = ''
    let countParams: any[] = []

    if (adminId) {
      // 移除 admin_id IS NULL 條件
      countQuery = `
        SELECT COUNT(*) as count FROM notifications 
        WHERE admin_id = ? AND is_read = 0
      `
      countParams = [adminId]
    } else {
      countQuery = `
        SELECT COUNT(*) as count FROM notifications 
        WHERE user_id = ? AND is_read = 0
      `
      countParams = [userId]
    }

    console.log('執行未讀統計查詢:', countQuery, countParams)

    const [countResult, countError] = await db.query<CountResult[]>(
      countQuery,
      countParams
    )

    let unreadCount = 0

    if (
      !countError &&
      countResult &&
      Array.isArray(countResult) &&
      countResult.length > 0
    ) {
      unreadCount = countResult[0]?.count || 0
    } else if (countError) {
      console.error('查詢未讀通知數量失敗:', countError)
      // 如果計算未讀數量失敗，但已經成功獲取通知列表，我們仍然返回通知列表
    }

    // 將通知資料轉換為前端需要的格式
    const formattedNotifications = Array.isArray(notifications)
      ? notifications.map((notification) => {
          // 確保屬性名稱符合前端需求
          return {
            ...notification,
            // 將蛇形命名轉換為駝峰命名
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            link: notification.link,
            image: notification.image,
            isRead: notification.is_read === 1,
            createdAt: notification.created_at,
            // 保留原始屬性以兼容
            created_at: notification.created_at,
            is_read: notification.is_read,
          }
        })
      : []

    return NextResponse.json({
      success: true,
      notifications: formattedNotifications,
      unreadCount,
    })
  } catch (error: any) {
    console.error('獲取通知失敗:', error)

    // 即使發生錯誤，也返回一個空的通知列表，避免前端出現錯誤
    return NextResponse.json({
      success: true,
      notifications: [],
      unreadCount: 0,
      error: error?.message || '獲取通知時發生未知錯誤',
    })
  }
}
