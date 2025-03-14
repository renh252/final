import { NextResponse } from 'next/server'
import { adminDb } from '@/app/api/admin/_lib/database'
import { verifyToken } from '@/app/api/admin/_lib/jwt'
import { headers } from 'next/headers'

// 允許的 SQL 查詢類型
const ALLOWED_QUERY_TYPES = ['SELECT', 'SHOW', 'DESCRIBE', 'EXPLAIN']

export async function POST(request: Request) {
  try {
    // 從 header 獲取並驗證 token
    const authHeader = headers().get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: '未授權的訪問' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const payload = await verifyToken(token)

    if (!payload) {
      return NextResponse.json({ error: '無效的認證' }, { status: 401 })
    }

    const { sql } = await request.json()

    if (!sql) {
      return NextResponse.json({ error: '缺少 SQL 查詢語句' }, { status: 400 })
    }

    // 檢查 SQL 查詢類型
    const queryType = sql.trim().split(' ')[0].toUpperCase()
    if (!ALLOWED_QUERY_TYPES.includes(queryType)) {
      return NextResponse.json(
        { error: '只允許執行 SELECT、SHOW、DESCRIBE 和 EXPLAIN 查詢' },
        { status: 400 }
      )
    }

    // 執行查詢
    const [result, error] = await adminDb.query(sql)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('查詢測試錯誤:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '查詢執行失敗' },
      { status: 500 }
    )
  }
}
