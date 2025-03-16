import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/_lib/auth'

// 驗證用戶身份API
export async function GET(request: NextRequest) {
  try {
    // 注意：以下代碼被暫時註釋，以允許所有用戶訪問前台，之後將重新啟用
    /*
    // 使用更新後的auth模組驗證用戶身份
    const user = await auth.fromRequest(request)

    if (!user) {
      return NextResponse.json(
        { success: false, message: '驗證失敗', isAuthenticated: false },
        { status: 401 }
      )
    }

    // 如果驗證成功，返回用戶資訊
    return NextResponse.json({
      success: true,
      message: '驗證成功',
      isAuthenticated: true,
      data: {
        user_id: user.user_id,
        user_email: user.user_email,
        user_name: user.user_name,
        role: user.role || '一般會員',
        status: user.status || '正常',
      },
    })
    */

    // 暫時跳過授權檢查，直接返回成功
    return NextResponse.json({
      success: true,
      message: '驗證成功 (暫時跳過授權檢查)',
      isAuthenticated: true,
      data: {
        user_id: 0,
        user_email: 'guest@example.com',
        user_name: '訪客用戶',
        role: '訪客',
        status: '正常',
      },
    })
  } catch (error) {
    console.error('身份驗證時出現錯誤:', error)
    return NextResponse.json(
      {
        success: false,
        message: '身份驗證過程中出現錯誤',
        isAuthenticated: false,
      },
      { status: 500 }
    )
  }
}
