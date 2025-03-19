import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/admin/_lib/auth'
import { guard } from '@/app/api/admin/_lib/guard'
import { PERMISSIONS } from '@/app/api/admin/_lib/permissions'
import { db } from '@/app/api/admin/_lib/db'

// 獲取會員詳情
export const GET = guard.api(async (request: NextRequest, authData) => {
  try {
    const mid = request.url.split('/').pop()
    if (!mid || isNaN(Number(mid))) {
      return NextResponse.json(
        { success: false, message: '無效的會員 ID' },
        { status: 400 }
      )
    }

    // 檢查權限
    if (!auth.can(authData, PERMISSIONS.MEMBERS.READ)) {
      return NextResponse.json(
        { success: false, message: '權限不足' },
        { status: 403 }
      )
    }

    // 從資料庫獲取會員資訊
    const [members] = await db.query('SELECT * FROM users WHERE user_id = ?', [
      mid,
    ])

    const member = members?.[0]
    if (!member) {
      return NextResponse.json(
        { success: false, message: '找不到此會員' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      member,
    })
  } catch (error) {
    console.error('獲取會員詳情錯誤:', error)
    return NextResponse.json(
      { success: false, message: '伺服器錯誤' },
      { status: 500 }
    )
  }
})

// 更新會員資料
export const PUT = guard.api(async (request: NextRequest, authData) => {
  try {
    const mid = request.url.split('/').pop()
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

    // 更新會員資料
    await db.query('UPDATE users SET ? WHERE user_id = ?', [body, mid])

    return NextResponse.json({
      success: true,
      message: '會員資料已更新',
    })
  } catch (error) {
    console.error('更新會員資料錯誤:', error)
    return NextResponse.json(
      { success: false, message: '伺服器錯誤' },
      { status: 500 }
    )
  }
})

// 刪除會員
export const DELETE = guard.api(async (request: NextRequest, authData) => {
  try {
    const mid = request.url.split('/').pop()
    if (!mid || isNaN(Number(mid))) {
      return NextResponse.json(
        { success: false, message: '無效的會員 ID' },
        { status: 400 }
      )
    }

    // 檢查權限
    if (!auth.can(authData, PERMISSIONS.MEMBERS.DELETE)) {
      return NextResponse.json(
        { success: false, message: '權限不足' },
        { status: 403 }
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

    // 刪除會員
    await db.query('DELETE FROM users WHERE user_id = ?', [mid])

    return NextResponse.json({
      success: true,
      message: '會員已刪除',
    })
  } catch (error) {
    console.error('刪除會員錯誤:', error)
    return NextResponse.json(
      { success: false, message: '伺服器錯誤' },
      { status: 500 }
    )
  }
})
