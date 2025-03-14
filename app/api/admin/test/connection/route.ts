import { NextResponse } from 'next/server'
import { adminDatabase } from '@/app/api/admin/_lib/database'
import { verifyToken } from '@/app/api/admin/_lib/jwt'
import { headers } from 'next/headers'

export async function GET() {
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

    const isConnected = await adminDatabase.testConnection()

    if (!isConnected) {
      return NextResponse.json({ error: '資料庫連接測試失敗' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: '資料庫連接成功' })
  } catch (error) {
    console.error('資料庫連接測試錯誤:', error)
    return NextResponse.json(
      { error: '資料庫連接測試發生錯誤' },
      { status: 500 }
    )
  }
}
