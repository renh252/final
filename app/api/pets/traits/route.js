import { NextResponse } from 'next/server'
import { database } from '../../_lib/db'

// 獲取所有寵物特徵
export async function GET() {
  try {
    // 構建 SQL 查詢
    const sql = `
      SELECT id, trait_tag, description
      FROM pet_trait_list
      ORDER BY id ASC
    `

    const [results, error] = await database.executeSecureQuery(sql)

    if (error) {
      console.error('獲取寵物特徵時出錯:', error)
      return NextResponse.json(
        { message: '獲取寵物特徵時出錯' },
        { status: 500 }
      )
    }

    // 返回特徵列表
    return NextResponse.json(results)
  } catch (error) {
    console.error('處理請求時出錯:', error)
    return NextResponse.json(
      { message: '處理請求時出錯: ' + error.message },
      { status: 500 }
    )
  }
}
