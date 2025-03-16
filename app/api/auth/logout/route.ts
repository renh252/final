import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// 登出 API
export async function POST(request: NextRequest) {
  try {
    // 刪除 Cookie 中的 token
    cookies().delete('token')

    return NextResponse.json({
      success: true,
      message: '登出成功',
    })
  } catch (err) {
    console.error('登出時發生錯誤:', err)
    return NextResponse.json(
      { success: false, message: '登出時發生錯誤' },
      { status: 500 }
    )
  }
}
