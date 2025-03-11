import { NextResponse } from 'next/server'
import { verifyToken } from '@/app/api/admin/_lib/jwt'

// 獲取環境變量資訊
export async function GET(request: Request) {
  try {
    // 驗證管理員權限
    const token = request.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ error: '未授權訪問' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: '沒有權限訪問此資源' }, { status: 403 })
    }

    // 獲取資料庫相關環境變量
    const envInfo = {
      DB_HOST: process.env.DB_HOST || 'localhost',
      DB_DATABASE: process.env.DB_DATABASE || 'pet_proj',
      DB_PORT: process.env.DB_PORT || '3306',
      NODE_ENV: process.env.NODE_ENV || 'development',
    }

    return NextResponse.json(envInfo)
  } catch (error) {
    console.error('獲取環境變量時發生錯誤：', error)
    return NextResponse.json(
      { error: '獲取環境變量時發生錯誤' },
      { status: 500 }
    )
  }
}
