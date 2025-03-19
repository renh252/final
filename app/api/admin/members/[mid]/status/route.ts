import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/admin/_lib/auth'
import { guard } from '@/app/api/admin/_lib/guard'
import { PERMISSIONS } from '@/app/api/admin/_lib/permissions'
import { db } from '@/app/api/admin/_lib/db'

// 更新會員狀態
export const PUT = guard.api(async (request: NextRequest, authData) => {
  try {
    // 獲取會員ID
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const midIndex = pathParts.findIndex(
      (part) => part === '[mid]' || part.match(/^\d+$/)
    )
    const mid = pathParts[midIndex]

    if (!mid || isNaN(Number(mid))) {
      return NextResponse.json(
        { success: false, message: '無效的會員 ID' },
        { status: 400 }
      )
    }

    // 檢查權限
    if (!auth.can(authData, PERMISSIONS.MEMBERS.WRITE)) {
      return NextResponse.json(
        { success: false, message: '權限不足' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // 檢查狀態參數
    if (!body.status || !['正常', '禁言'].includes(body.status)) {
      return NextResponse.json(
        { success: false, message: '無效的狀態值' },
        { status: 400 }
      )
    }

    // 檢查會員是否存在
    const [members] = await db.query(
      'SELECT user_id FROM users WHERE user_id = ?',
      [mid]
    )

    if (!members?.[0]) {
      return NextResponse.json(
        { success: false, message: '找不到此會員' },
        { status: 404 }
      )
    }

    // 更新會員狀態
    await db.query('UPDATE users SET user_status = ? WHERE user_id = ?', [
      body.status,
      mid,
    ])

    return NextResponse.json({
      success: true,
      message: `會員狀態已更新為${body.status}`,
    })
  } catch (error) {
    console.error('更新會員狀態錯誤:', error)
    return NextResponse.json(
      { success: false, message: '伺服器錯誤' },
      { status: 500 }
    )
  }
})
