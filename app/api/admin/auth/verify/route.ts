import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/app/api/admin/_lib/auth'

export async function GET(request: NextRequest) {
  try {
    // 驗證JWT
    const admin = await isAuthenticated(request)

    if (!admin) {
      return NextResponse.json(
        { success: false, message: '未授權或令牌已過期' },
        { status: 401 }
      )
    }

    // 返回管理員信息
    return NextResponse.json({
      success: true,
      message: '令牌有效',
      data: { admin },
    })
  } catch (error) {
    console.error('驗證錯誤:', error)
    return NextResponse.json(
      { success: false, message: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    )
  }
}
