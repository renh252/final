import { NextResponse } from 'next/server'
import { database } from '../../../_lib/db'

// 獲取特定問卷的詳細信息
export async function GET(request, { params }) {
  try {
    const { id } = params

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ message: '無效的問卷 ID' }, { status: 400 })
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
      WHERE id = ?
      LIMIT 1
    `

    const [results, error] = await database.executeSecureQuery(sql, [id])

    if (error) {
      console.error('獲取問卷詳情時出錯:', error)
      return NextResponse.json(
        { message: '獲取問卷詳情時出錯' },
        { status: 500 }
      )
    }

    if (!results || results.length === 0) {
      return NextResponse.json({ message: '未找到該問卷' }, { status: 404 })
    }

    // 返回問卷詳情
    return NextResponse.json(results[0])
  } catch (error) {
    console.error('處理請求時出錯:', error)
    return NextResponse.json(
      { message: '處理請求時出錯: ' + error.message },
      { status: 500 }
    )
  }
}

// 更新特定問卷
export async function PUT(request, { params }) {
  try {
    const { id } = params

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ message: '無效的問卷 ID' }, { status: 400 })
    }

    // 獲取請求數據
    const {
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
      UPDATE user_questionnaire
      SET 
        living_environment = ?, 
        activity_level = ?, 
        experience_level = ?, 
        time_available = ?, 
        preferred_size = ?, 
        preferred_age = ?, 
        preferred_traits = ?, 
        allergies = ?, 
        has_children = ?, 
        has_other_pets = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `

    // 參數數組
    const params = [
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
      id,
    ]

    // 執行查詢
    const [result, error] = await database.executeSecureQuery(sql, params)

    if (error) {
      console.error('更新問卷時出錯:', error)
      return NextResponse.json({ message: '更新問卷時出錯' }, { status: 500 })
    }

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: '未找到該問卷或無變更' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: '問卷更新成功',
      id: id,
    })
  } catch (error) {
    console.error('處理請求時出錯:', error)
    return NextResponse.json(
      { message: '處理請求時出錯: ' + error.message },
      { status: 500 }
    )
  }
}

// 刪除特定問卷
export async function DELETE(request, { params }) {
  try {
    const { id } = params

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ message: '無效的問卷 ID' }, { status: 400 })
    }

    // 構建 SQL 查詢
    const sql = `DELETE FROM user_questionnaire WHERE id = ?`

    // 執行查詢
    const [result, error] = await database.executeSecureQuery(sql, [id])

    if (error) {
      console.error('刪除問卷時出錯:', error)
      return NextResponse.json({ message: '刪除問卷時出錯' }, { status: 500 })
    }

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: '未找到該問卷' }, { status: 404 })
    }

    return NextResponse.json({
      message: '問卷刪除成功',
      id: id,
    })
  } catch (error) {
    console.error('處理請求時出錯:', error)
    return NextResponse.json(
      { message: '處理請求時出錯: ' + error.message },
      { status: 500 }
    )
  }
}
