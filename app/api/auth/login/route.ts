import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/api/_lib/db'
import { generateToken } from '@/app/api/_lib/jwt'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

// 登入 API
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // 驗證必要欄位
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: '請輸入電子郵件和密碼' },
        { status: 400 }
      )
    }

    // 查詢用戶 - 使用正確的欄位名稱，只排除"停用"狀態的用戶
    const [users, error] = await db.query(
      `
      SELECT 
        user_id, 
        user_email, 
        user_password, 
        user_name, 
        user_level,
        user_status
      FROM users
      WHERE user_email = ? AND (user_status != '停用' OR user_status IS NULL)
      LIMIT 1
    `,
      [email]
    )

    if (error) {
      console.error('查詢用戶失敗:', error)
      return NextResponse.json(
        { success: false, message: '登入失敗，請稍後再試' },
        { status: 500 }
      )
    }

    // 檢查用戶是否存在
    if (!users || (users as any[]).length === 0) {
      return NextResponse.json(
        { success: false, message: '電子郵件或密碼錯誤' },
        { status: 401 }
      )
    }

    const user = (users as any[])[0]

    // 驗證密碼 - 處理明碼密碼的情況
    let isPasswordValid = false

    // 檢查密碼是否為明碼
    if (
      user.user_password &&
      (user.user_password.startsWith('$2y$') ||
        user.user_password.startsWith('$2a$') ||
        user.user_password.startsWith('$2b$'))
    ) {
      // 如果是bcrypt哈希密碼
      let compatibleHash = user.user_password
      if (user.user_password.startsWith('$2y$')) {
        compatibleHash = user.user_password.replace('$2y$', '$2a$')
      }
      isPasswordValid = await bcrypt.compare(password, compatibleHash)
    } else {
      // 如果是明碼密碼，直接比較
      isPasswordValid = password === user.user_password
      console.log('使用明碼密碼驗證')
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: '電子郵件或密碼錯誤' },
        { status: 401 }
      )
    }

    // 生成 JWT token
    const token = await generateToken({
      id: user.user_id,
      email: user.user_email,
      name: user.user_name,
      role: user.user_level || '一般會員',
      status: user.user_status || '正常',
    })

    // 設置 Cookie
    cookies().set({
      name: 'token',
      value: token,
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 天
      path: '/',
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    })

    // 準備安全的用戶資訊（不包含密碼）
    const safeUser = {
      user_id: user.user_id,
      user_email: user.user_email,
      user_name: user.user_name,
      role: user.user_level || '一般會員',
      status: user.user_status,
    }

    return NextResponse.json({
      success: true,
      message: '登入成功',
      data: {
        user: safeUser,
        token,
      },
    })
  } catch (err) {
    console.error('登入時發生錯誤:', err)
    return NextResponse.json(
      { success: false, message: '登入時發生錯誤' },
      { status: 500 }
    )
  }
}
