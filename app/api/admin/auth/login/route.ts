import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/app/api/admin/_lib/database'
import { generateToken, verifyPassword } from '@/app/api/admin/_lib/jwt'

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

    try {
      // 從資料庫查詢管理員
      const [managers, queryError] = await adminDb.query(
        'SELECT id, manager_account, manager_password, manager_privileges FROM manager WHERE manager_account = ? LIMIT 1',
        [account]
      )

      if (queryError) {
        throw queryError
      }

      // 驗證管理員存在
      const manager = managers[0]
      if (!manager) {
        return NextResponse.json(
          { success: false, message: '帳號或密碼錯誤' },
          { status: 401 }
        )
      }

      // 驗證密碼
      const isPasswordValid = await verifyPassword(
        password,
        manager.manager_password
      )
      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, message: '帳號或密碼錯誤' },
          { status: 401 }
        )
      }

      // 生成 JWT
      const token = await generateToken({
        id: manager.id,
        account: manager.manager_account,
        privileges: manager.manager_privileges,
        role: 'admin',
      })

      // 返回成功響應
      return NextResponse.json({
        success: true,
        message: '登入成功',
        data: {
          token,
          admin: {
            id: manager.id,
            account: manager.manager_account,
            privileges: manager.manager_privileges,
          },
        },
      })
    } catch (dbError) {
      console.error('資料庫操作錯誤:', dbError)
      return NextResponse.json(
        { success: false, message: '資料庫連接錯誤，請稍後再試' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('登入錯誤:', error)
    return NextResponse.json(
      { success: false, message: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    )
  }
}
