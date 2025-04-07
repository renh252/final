import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/api/_lib/db'

export async function POST(request: NextRequest) {
  try {
    const { user_id, type, title, message, link, image, sender_id, admin_id } =
      await request.json()

    // 必填欄位驗證
    if (!user_id || !type || !title || !message) {
      return NextResponse.json(
        {
          success: false,
          message: '缺少必要參數: user_id, type, title, message 為必填欄位',
        },
        { status: 400 }
      )
    }

    // 構建查詢
    const query = `
      INSERT INTO notifications 
      (user_id, type, title, message, link, image, created_at, sender_id, admin_id) 
      VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?)
    `

    // 執行插入操作
    const [result, error] = await db.query(query, [
      user_id,
      type,
      title,
      message,
      link || null,
      image || null,
      sender_id || null,
      admin_id || null,
    ])

    if (error) {
      console.error('添加通知失敗:', error)
      return NextResponse.json(
        { success: false, message: '添加通知失敗', error: error.message },
        { status: 500 }
      )
    }

    console.log(`已成功為用戶 #${user_id} 添加類型為 "${type}" 的通知`)

    return NextResponse.json({
      success: true,
      message: '通知添加成功',
      notification_id: result ? (result as any).insertId : null,
    })
  } catch (error: any) {
    console.error('添加通知時發生錯誤:', error)
    return NextResponse.json(
      {
        success: false,
        message: '添加通知時發生錯誤',
        error: error?.message || '未知錯誤',
      },
      { status: 500 }
    )
  }
}
