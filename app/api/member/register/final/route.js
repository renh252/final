// app/api/member/register/final/route.js
import { NextResponse } from 'next/server'
import { database } from '@/app/api/_lib/db'

export async function POST(req) {
  try {
    const {
      tempToken,
      password,
      name,
      phone,
      birthday,
      address,
      googleEmail, // 接收 googleEmail
      isGoogleSignIn, // 接收 isGoogleSignIn 標誌
    } = await req.json()

    if (
      isGoogleSignIn === true &&
      googleEmail &&
      name &&
      phone &&
      birthday &&
      address
    ) {
      // 處理 Google 登入的註冊情況
      try {
        // 查詢具有此 googleEmail 但尚未填寫詳細資料的使用者 (假設在 /api/member/googleCallback 中創建)
        const [existingUserRows, errorCheck] =
          await database.executeSecureQuery(
            'SELECT user_id FROM users WHERE google_email = ? AND has_additional_info = 0',
            [googleEmail]
          )

        if (errorCheck) {
          console.error('查詢 Google 電子郵件錯誤:', errorCheck)
          return NextResponse.json(
            { message: '資料庫查詢錯誤', error: errorCheck.message },
            { status: 500 }
          )
        }

        if (existingUserRows && existingUserRows.length > 0) {
          const userIdToUpdate = existingUserRows[0].user_id
          // 更新現有使用者的詳細資料
          const [updateResult, updateError] = await database.executeSecureQuery(
            'UPDATE users SET user_name = ?, user_number = ?, user_birthday = ?, user_address = ?, has_additional_info = ? WHERE user_id = ?',
            [name, phone, birthday, address, true, userIdToUpdate]
          )
          if (updateError) {
            console.error('更新使用者詳細資料錯誤:', updateError)
            return NextResponse.json(
              { message: '更新使用者詳細資料失敗', error: updateError.message },
              { status: 500 }
            )
          }

          // 完成註冊時發送歡迎通知
          try {
            await fetch(
              `${
                process.env.NEXT_PUBLIC_API_BASE_URL || ''
              }/api/notifications/add`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  user_id: userIdToUpdate,
                  type: 'system',
                  title: '歡迎加入寵物之家',
                  message: `親愛的 ${name}，歡迎您完成資料設定！您現在可以瀏覽我們的網站，探索可愛的寵物，參與各種活動，以及使用會員專屬服務。`,
                  link: '/member',
                }),
              }
            )
          } catch (notifyError) {
            console.error('發送歡迎通知時發生錯誤:', notifyError)
            // 不阻礙主要流程
          }

          return NextResponse.json(
            { message: '詳細資料已更新' },
            { status: 200 }
          )
        } else {
          return NextResponse.json(
            { message: 'Google 帳號驗證失敗或詳細資料已存在，請重新登入' },
            { status: 400 }
          )
        }
      } catch (error) {
        console.error('處理 Google 登入註冊錯誤:', error)
        return NextResponse.json(
          { message: '處理 Google 登入註冊失敗', error: error.message },
          { status: 500 }
        )
      }
    } else {
      // 處理一般的電子郵件/密碼註冊流程
      if (!tempToken || !password || !name || !phone || !birthday || !address) {
        return NextResponse.json(
          { message: '請提供驗證 Token、密碼和所有詳細資料' },
          { status: 400 }
        )
      }

      try {
        const emailFromToken = Buffer.from(tempToken, 'base64').toString(
          'utf-8'
        )

        if (!emailFromToken) {
          return NextResponse.json(
            { message: '驗證 Token 無效' },
            { status: 401 }
          )
        }

        // 檢查電子郵件是否已存在
        const [existingUserRows, errorCheck] =
          await database.executeSecureQuery(
            'SELECT user_id FROM users WHERE user_email = ?',
            [emailFromToken]
          )

        if (errorCheck) {
          console.error('查詢電子郵件錯誤:', errorCheck)
          return NextResponse.json(
            { message: '資料庫查詢錯誤', error: errorCheck.message },
            { status: 500 }
          )
        }

        if (existingUserRows && existingUserRows.length > 0) {
          return NextResponse.json(
            { message: '該電子郵件已被註冊' },
            { status: 409 }
          )
        }

        // 插入使用者資料 (直接儲存明碼密碼 - 請注意安全性風險！)
        const [result, error2] = await database.executeSecureQuery(
          'INSERT INTO users (user_email, user_password, user_name, user_number, user_birthday, user_address, has_additional_info) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [emailFromToken, password, name, phone, birthday, address, true]
        )

        if (error2) {
          console.error('資料庫插入錯誤:', error2)
          return NextResponse.json(
            { message: '資料庫插入錯誤', error: error2.message },
            { status: 500 }
          )
        }

        console.log('資料庫插入結果:', result)

        // 註冊成功時發送歡迎通知
        try {
          const userId = result.insertId

          if (userId) {
            await fetch(
              `${
                process.env.NEXT_PUBLIC_API_BASE_URL || ''
              }/api/notifications/add`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  user_id: userId,
                  type: 'system',
                  title: '歡迎加入寵物之家',
                  message: `親愛的 ${name}，感謝您註冊成為我們的會員！您現在可以瀏覽我們的網站，探索可愛的寵物，參與各種活動，以及使用會員專屬服務。`,
                  link: '/member',
                }),
              }
            )
          }
        } catch (notifyError) {
          console.error('發送歡迎通知時發生錯誤:', notifyError)
          // 不阻礙主要流程
        }

        return NextResponse.json({ message: '註冊成功' }, { status: 201 })
      } catch (decodeError) {
        console.error('解析 Token 錯誤:', decodeError)
        return NextResponse.json(
          { message: '驗證 Token 無效' },
          { status: 401 }
        )
      }
    }
  } catch (error) {
    console.error('最終註冊錯誤:', error)
    return NextResponse.json(
      { message: '註冊最終步驟失敗，請稍後重試', error: error.message },
      { status: 500 }
    )
  }
}
