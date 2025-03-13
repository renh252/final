import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './app/api/admin/_lib/jwt'

// 需要保護的路徑模式
const PROTECTED_PATHS = ['/admin']
// 不需要認證的路徑模式
const PUBLIC_PATHS = ['/admin/login', '/api/admin/auth/login']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 檢查是否為API請求
  if (
    pathname.startsWith('/api/admin') &&
    !pathname.startsWith('/api/admin/auth/login')
  ) {
    // API 驗證由各自的路由處理，這裡只做簡單的檢查
    return NextResponse.next()
  }

  // 如果是公開路徑，允許直接訪問
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // 如果是受保護的路徑，檢查是否已認證
  if (PROTECTED_PATHS.some((path) => pathname.startsWith(path))) {
    // 從 cookie 獲取 token
    const token = request.cookies.get('admin_token')?.value

    if (!token) {
      // 如果沒有 token，重定向到登入頁面
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    try {
      // 驗證 token
      const payload = await verifyToken(token)
      if (!payload) {
        // token 無效，重定向到登入頁面
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }

      // token 有效，繼續
      return NextResponse.next()
    } catch (error) {
      // 驗證出錯，重定向到登入頁面
      console.error('Token 驗證錯誤:', error)
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // 其他路徑直接放行
  return NextResponse.next()
}

export const config = {
  matcher: [
    // 需要中間件處理的路徑
    '/admin/:path*',
    '/api/admin/:path*',
  ],
}
