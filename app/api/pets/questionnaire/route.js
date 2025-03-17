import { NextResponse } from 'next/server'
import { database } from '../../_lib/db'

// 處理 POST 請求 - 提交問卷
export async function POST(request) {
  try {
    // 獲取請求數據
    const {
      user_id,
      livingEnvironment,
      activityLevel,
      experienceLevel,
      timeAvailable,
      preferredSize,
      preferredAge,
      preferredTraits,
      allergies,
      hasChildren,
      hasOtherPets,
    } = await request.json()

    // 驗證必要字段
    if (
      !livingEnvironment ||
      !activityLevel ||
      !experienceLevel ||
      !timeAvailable ||
      !preferredSize ||
      !preferredAge ||
      !Array.isArray(preferredTraits) ||
      preferredTraits.length === 0
    ) {
      return NextResponse.json(
        { message: '必須填寫所有必要問題' },
        { status: 400 }
      )
    }

    // 將特徵列表轉換為 JSON 字符串
    const traitsJson = JSON.stringify(preferredTraits)

    // 構建 SQL 查詢
    const sql = `
      INSERT INTO user_questionnaire (
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
        has_other_pets
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    // 參數數組
    const params = [
      user_id || null,
      livingEnvironment,
      activityLevel,
      experienceLevel,
      timeAvailable,
      preferredSize,
      preferredAge,
      traitsJson,
      allergies ? 1 : 0,
      hasChildren ? 1 : 0,
      hasOtherPets ? 1 : 0,
    ]

    // 執行查詢
    const [result, error] = await database.executeSecureQuery(sql, params)

    if (error) {
      console.error('保存問卷時出錯:', error)
      return NextResponse.json({ message: '保存問卷時出錯' }, { status: 500 })
    }

    // 獲取插入的問卷 ID
    const questionnaireId = result.insertId

    // 處理推薦邏輯 - 將在另一個 API 端點中實現
    // 僅保存結果

    return NextResponse.json({
      message: '問卷提交成功',
      questionnaireId: questionnaireId,
    })
  } catch (error) {
    console.error('處理請求時出錯:', error)
    return NextResponse.json(
      { message: '處理請求時出錯: ' + error.message },
      { status: 500 }
    )
  }
}

// 處理 GET 請求 - 獲取問卷列表
export async function GET() {
  try {
    // 查詢最近的問卷
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
      ORDER BY created_at DESC
      LIMIT 10
    `

    const [results, error] = await database.executeSecureQuery(sql)

    if (error) {
      console.error('獲取問卷列表時出錯:', error)
      return NextResponse.json(
        { message: '獲取問卷列表時出錯' },
        { status: 500 }
      )
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('處理請求時出錯:', error)
    return NextResponse.json(
      { message: '處理請求時出錯: ' + error.message },
      { status: 500 }
    )
  }
}
