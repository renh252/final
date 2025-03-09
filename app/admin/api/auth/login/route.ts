import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/db'
import { generateToken, verifyPassword } from '@/app/admin/api/_lib/jwt'

export async function POST(request: NextRequest) {
  try {
    // 解析請求體
    const body = await request.json()
    const { account, password } = body

    // 驗證參數
    if (!account || !password) {
      return NextResponse.json(
        { success: false, message: '帳號和密碼必須提供' },
        { status: 400 }
      )
    }

    // 從資料庫查詢管理員
    const [managers] = await db.query(
      'SELECT id, account, password, manager_privileges FROM manager WHERE account = ? AND is_active = 1 LIMIT 1',
      [account]
    )

    // 驗證管理員存在
    const manager = managers[0]
    if (!manager) {
      return NextResponse.json(
        { success: false, message: '帳號或密碼錯誤' },
        { status: 401 }
      )
    }

    // 驗證密碼
    const isPasswordValid = await verifyPassword(password, manager.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: '帳號或密碼錯誤' },
        { status: 401 }
      )
    }

    // 生成 JWT
    const token = await generateToken({
      id: manager.id,
      account: manager.account,
      privileges: manager.manager_privileges,
    })

    // 更新最後登入時間
    await db.query('UPDATE manager SET last_login_at = NOW() WHERE id = ?', [
      manager.id,
    ])

    // 返回成功響應
    return NextResponse.json({
      success: true,
      message: '登入成功',
      data: {
        token,
        admin: {
          id: manager.id,
          account: manager.account,
          privileges: manager.manager_privileges,
        },
      },
    })
  } catch (error) {
    console.error('登入錯誤:', error)
    return NextResponse.json(
      { success: false, message: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    )
  }
}
