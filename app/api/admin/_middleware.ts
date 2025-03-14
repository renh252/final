import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from './_lib/auth'

// 不需要驗證的路徑
const PUBLIC_PATHS = ['/api/admin/auth/login']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 檢查是否為公開路徑
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next()
  }

  try {
    // 驗證授權
    const authData = await auth.fromRequest(request)
    if (!authData) {
      return NextResponse.json(
        { success: false, message: '未授權的請求' },
        { status: 401 }
      )
    }

    // 將授權資訊添加到請求頭
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-auth-id', authData.id.toString())
    requestHeaders.set('x-auth-role', authData.role)
    requestHeaders.set('x-auth-perms', authData.perms.join(','))

    // 繼續處理請求
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    console.error('授權驗證錯誤:', error)
    return NextResponse.json(
      { success: false, message: '伺服器錯誤' },
      { status: 500 }
    )
  }
}

// 配置中間件匹配路徑
export const config = {
  matcher: '/api/admin/:path*',
}
