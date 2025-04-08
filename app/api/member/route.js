// app/api/member/route.js
import { NextResponse } from 'next/server'
import { database } from '@/app/api/_lib/db' // 引入你的資料庫連接模組
import jwt from 'jsonwebtoken'

export async function POST(request) {
  try {
    const { email, password, firebaseUid } = await request.json() // 接收 firebaseUid

    if (!email) {
      return NextResponse.json(
        { success: false, message: '請輸入電子郵件' },
        { status: 400 }
      )
    }

    let query = 'SELECT * FROM users WHERE user_email = ? LIMIT 1'
    let queryParams = [email]

    if (firebaseUid) {
      query = 'SELECT * FROM users WHERE firebase_uid = ? LIMIT 1'
      queryParams = [firebaseUid]
    } else if (!password) {
      return NextResponse.json(
        { success: false, message: '請輸入密碼' },
        { status: 400 }
      )
    }

    const [users, queryError] = await database.executeSecureQuery(
      query,
      queryParams
    )

    if (queryError || !users || users.length === 0) {
      return NextResponse.json(
        { success: false, message: '電子郵件或帳號不存在' },
        { status: 401 }
      )
    }

    const user = users[0]

    // 驗證密碼（如果不是 Google 登入）
    if (
      !firebaseUid &&
      (user.user_password === null || password !== user.user_password)
    ) {
      return NextResponse.json(
        { success: false, message: '電子郵件或密碼錯誤' },
        { status: 401 }
      )
    }

    // 登入成功
    const token = jwt.sign(
      {
        userId: user.user_id,
        email: user.user_email,
        // 增加使用者資訊，確保與 jose 版本相容
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 天過期，與 jose 設置一致
      },
      process.env.JWT_SECRET || 'your-secret-key'
    )

    return NextResponse.json({
      success: true,
      message: '登入成功',
      data: {
        token,
        firebase_uid: user.firebase_uid,
        user: {
          id: user.user_id,
          name: user.user_name,
          email: user.user_email,
          number: user.user_number,
          address: user.user_address,
        },
      },
    })
  } catch (error) {
    console.error('登入時發生錯誤:', error)
    return NextResponse.json(
      { success: false, message: '登入時發生錯誤，請稍後再試' },
      { status: 500 }
    )
  }
}
