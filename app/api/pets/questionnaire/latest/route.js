import { NextResponse } from 'next/server'
import { database } from '../../../_lib/db'
import { getTokenData } from '../../../_lib/auth'

// 獲取當前登入用戶的最新問卷
export async function GET(request) {
  try {
    // 獲取當前用戶 ID
    const tokenData = await getTokenData(request)
    const userId = tokenData?.userId

    if (!userId) {
      return NextResponse.json(
        { message: '用戶未登入或無法獲取用戶信息' },
        { status: 401 }
      )
    }

    // 構建 SQL 查詢
    const sql = `
      SELECT 
        id, 
        user_id, 
        living_environment, 
        activity_level, 
        experience_level, 
        time_available, 
        preferred_size, 
        preferred_age, 
        preferred_traits, 
        allergies, 
        has_children, 
        has_other_pets, 
        created_at
      FROM user_questionnaire
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `

    const [results, error] = await database.executeSecureQuery(sql, [userId])

    if (error) {
      console.error('獲取最新問卷時出錯:', error)
      return NextResponse.json(
        { message: '獲取最新問卷時出錯' },
        { status: 500 }
      )
    }

    if (!results || results.length === 0) {
      return NextResponse.json(
        { message: '未找到該用戶的問卷' },
        { status: 404 }
      )
    }

    // 返回最新問卷
    return NextResponse.json(results[0])
  } catch (error) {
    console.error('處理請求時出錯:', error)
    return NextResponse.json(
      { message: '處理請求時出錯: ' + error.message },
      { status: 500 }
    )
  }
}
