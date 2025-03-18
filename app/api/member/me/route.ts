import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// 模擬用戶資料
const mockUser = {
  user_id: 1,
  name: '測試用戶',
  email: 'test@example.com',
  phone: '0912345678',
  created_at: '2024-03-01T00:00:00Z',
  updated_at: '2024-03-01T00:00:00Z',
}

export async function GET(request: NextRequest) {
  try {
    // 在實際專案中，這裡會檢查 session cookie 或 JWT token
    // const cookieStore = cookies()
    // const token = cookieStore.get('auth_token')

    // if (!token) {
    //   return NextResponse.json(
    //     { success: false, message: '未登入' },
    //     { status: 401 }
    //   )
    // }

    // 模擬已登入狀態
    return NextResponse.json({
      success: true,
      message: '獲取用戶資料成功',
      data: mockUser,
    })
  } catch (err) {
    console.error('Error in /api/member/me:', err)
    return NextResponse.json(
      { success: false, message: '獲取用戶資料失敗' },
      { status: 500 }
    )
  }
}
