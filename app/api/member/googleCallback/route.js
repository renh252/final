// app/api/member/googleCallback/route.js
import { NextResponse } from 'next/server'
import { database } from '@/app/api/_lib/db'
import jwt from 'jsonwebtoken'

// 獲取 JWT 秘密金鑰
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request) {
  try {
    const { googleEmail, googleName, defaultPassword } = await request.json()

    if (!googleEmail) {
      return NextResponse.json(
        { success: false, message: '未提供 Google 電子郵件' },
        { status: 400 }
      )
    }

    console.log('處理 Google 登入:', googleEmail)

    // 先檢查 users 表結構，確保欄位存在
    try {
      const [columns, columnsError] = await database.executeSecureQuery(
        'SHOW COLUMNS FROM users'
      )
      if (columnsError) {
        console.error('檢查資料表結構錯誤:', columnsError)
        return NextResponse.json(
          {
            success: false,
            message: '資料庫結構檢查錯誤',
            error: columnsError.message,
          },
          { status: 500 }
        )
      }

      console.log('資料表欄位:', columns.map((c) => c.Field).join(', '))

      // 檢查必要的欄位是否存在
      const requiredFields = [
        'user_id',
        'user_email',
        'google_email',
        'has_additional_info',
      ]
      const missingFields = requiredFields.filter(
        (field) => !columns.some((c) => c.Field === field)
      )

      if (missingFields.length > 0) {
        console.error('缺少必要欄位:', missingFields)
        return NextResponse.json(
          {
            success: false,
            message: `資料表缺少必要欄位: ${missingFields.join(', ')}`,
          },
          { status: 500 }
        )
      }
    } catch (schemaError) {
      console.error('檢查資料表結構時發生錯誤:', schemaError)
    }

    // 檢查用戶是否已存在
    let [existingUsers, queryError] = await database.executeSecureQuery(
      'SELECT * FROM users WHERE user_email = ? OR google_email = ?',
      [googleEmail, googleEmail]
    )

    if (queryError) {
      console.error('查詢用戶錯誤:', queryError)
      return NextResponse.json(
        {
          success: false,
          message: '資料庫查詢錯誤',
          error: queryError.message,
        },
        { status: 500 }
      )
    }

    let user
    let needsAdditionalInfo = false

    if (existingUsers && existingUsers.length > 0) {
      user = existingUsers[0]
      console.log('找到現有用戶:', user.user_id)
      // 檢查用戶是否已填寫詳細資料
      needsAdditionalInfo =
        user.has_additional_info === 0 || !user.has_additional_info
    } else {
      console.log('未找到用戶，創建新用戶')
      // 用戶不存在，創建新的用戶記錄
      try {
        const password =
          defaultPassword || `Google@${googleEmail.split('@')[0]}`

        // 完善插入語句，確保所有必要欄位都有預設值
        const insertSql = `
          INSERT INTO users 
          (user_email, google_email, user_password, user_name, user_number, user_address, user_level, has_additional_info, created_at) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `

        const [insertResult, insertError] = await database.executeSecureQuery(
          insertSql,
          [
            googleEmail,
            googleEmail,
            password,
            googleName || googleEmail.split('@')[0],
            '', // 為 user_number 提供空字串預設值
            '', // 為 user_address 提供空字串預設值
            1, // 為 user_level 提供預設值 1 (普通會員)
            0, // has_additional_info 設為 0，表示仍需填寫詳細資料
          ]
        )

        if (insertError) {
          console.error('新增 Google 用戶錯誤:', insertError)
          return NextResponse.json(
            {
              success: false,
              message: '註冊 Google 用戶失敗',
              error: insertError.message,
            },
            { status: 500 }
          )
        }

        if (!insertResult || !insertResult.insertId) {
          console.error('插入結果無效:', insertResult)
          return NextResponse.json(
            {
              success: false,
              message: '插入用戶失敗，未獲得有效的用戶 ID',
            },
            { status: 500 }
          )
        }

        console.log('用戶創建成功，ID:', insertResult.insertId)

        // 獲取新創建的用戶 ID
        const userId = insertResult.insertId

        // 查詢新插入的用戶資料
        const [newUserResult, newUserError] = await database.executeSecureQuery(
          'SELECT * FROM users WHERE user_id = ? LIMIT 1',
          [userId]
        )

        if (newUserError) {
          console.error('查詢新用戶錯誤:', newUserError)
          return NextResponse.json(
            {
              success: false,
              message: '查詢新用戶失敗',
              error: newUserError.message,
            },
            { status: 500 }
          )
        }

        if (newUserResult && newUserResult.length > 0) {
          user = newUserResult[0]
          console.log('獲取新用戶資料成功')
        } else {
          console.error('未找到新插入的用戶')
          return NextResponse.json(
            {
              success: false,
              message: '創建用戶後無法獲取用戶資料',
            },
            { status: 500 }
          )
        }

        needsAdditionalInfo = true
      } catch (createError) {
        console.error('創建用戶過程發生錯誤:', createError)
        return NextResponse.json(
          {
            success: false,
            message: '註冊 Google 用戶失敗',
            error: createError.message,
          },
          { status: 500 }
        )
      }
    }

    // 確保有 userId，即使沒有 user 對象
    const userId = user?.user_id || null
    console.log('準備生成 token，userId:', userId)

    // 生成 token (使用 jsonwebtoken)
    const token = jwt.sign(
      {
        userId: userId ? Number(userId) : null,
        email: googleEmail,
        isGoogle: true,
        // 增加時間戳記確保 token 相容性
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 天過期
      },
      JWT_SECRET
    )

    if (!token) {
      console.error('生成 token 失敗')
      return NextResponse.json(
        { success: false, message: '無法生成授權令牌' },
        { status: 500 }
      )
    }

    console.log(
      'Google 登入/註冊成功，needsAdditionalInfo:',
      needsAdditionalInfo
    )

    return NextResponse.json({
      success: true,
      message: needsAdditionalInfo ? '需要填寫詳細資訊' : '登入成功',
      needsAdditionalInfo,
      authToken: token,
      user: user
        ? {
            id: user.user_id,
            name: user.user_name,
            email: user.user_email,
            number: user.user_number,
            address: user.user_address,
          }
        : null,
    })
  } catch (error) {
    console.error('Google 登入回調錯誤:', error)
    return NextResponse.json(
      {
        success: false,
        message: '處理 Google 登入時發生錯誤',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
