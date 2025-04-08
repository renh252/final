import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/api/_lib/db'

// 發送系統通知給所有用戶
async function sendSystemNotificationToAllUsers(
  title: string,
  message: string,
  link?: string
) {
  try {
    // 獲取所有用戶，不論狀態
    const [users] = await db.query('SELECT user_id FROM users')

    if (!Array.isArray(users)) {
      throw new Error('無法獲取用戶列表')
    }

    // 為每個用戶創建通知
    for (const user of users) {
      await db.query(
        `INSERT INTO notifications 
        (user_id, type, title, message, link, created_at) 
        VALUES (?, ?, ?, ?, ?, NOW())`,
        [(user as any).user_id, 'system', title, message, link || null]
      )
    }

    return true
  } catch (error) {
    console.error('發送系統通知給所有用戶時出錯:', error)
    return false
  }
}

// 發送系統通知給所有管理員
async function sendSystemNotificationToAllAdmins(
  title: string,
  message: string,
  link?: string
) {
  try {
    // 獲取所有管理員
    const [managers] = await db.query('SELECT id FROM manager')

    if (!Array.isArray(managers)) {
      throw new Error('無法獲取管理員列表')
    }

    // 為每個管理員創建通知
    for (const manager of managers) {
      await db.query(
        `INSERT INTO notifications 
        (admin_id, type, title, message, link, created_at) 
        VALUES (?, ?, ?, ?, ?, NOW())`,
        [(manager as any).id, 'system', title, message, link || null]
      )
    }

    return true
  } catch (error) {
    console.error('發送系統通知給所有管理員時出錯:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, message, link, notifyType, adminOnly } = await request.json()

    if (!title || !message || !notifyType) {
      return NextResponse.json(
        {
          success: false,
          message: '缺少必要參數',
        },
        { status: 400 }
      )
    }

    let userSuccess = true
    let adminSuccess = true

    // 根據通知類型發送不同的系統通知
    switch (notifyType) {
      case 'maintenance':
      case 'update':
      case 'announcement':
        // 系統維護通知、功能更新通知、重要公告
        if (!adminOnly) {
          userSuccess = await sendSystemNotificationToAllUsers(
            title,
            message,
            link
          )
        }
        // 無論是否僅管理員可見，都發送給管理員
        adminSuccess = await sendSystemNotificationToAllAdmins(
          title,
          message,
          link
        )
        break

      default:
        return NextResponse.json(
          {
            success: false,
            message: '不支援的通知類型',
          },
          { status: 400 }
        )
    }

    if (!userSuccess || !adminSuccess) {
      return NextResponse.json(
        {
          success: false,
          message: '部分或全部通知發送失敗',
          details: {
            userSuccess,
            adminSuccess,
          },
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '系統通知發送成功',
    })
  } catch (error: any) {
    console.error('發送系統通知時發生錯誤:', error)
    return NextResponse.json(
      {
        success: false,
        message: '發送系統通知失敗',
        error: error?.message || '未知錯誤',
      },
      { status: 500 }
    )
  }
}
