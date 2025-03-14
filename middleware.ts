import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './app/api/admin/_lib/jwt'

// 需要保護的路徑模式
const PROTECTED_PATHS = ['/admin']
// 不需要認證的路徑模式
const PUBLIC_PATHS = ['/admin/login', '/api/admin/auth/login']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 如果是公開路徑，允許直接訪問
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // 檢查是否為API請求或受保護的路徑
  if (
    pathname.startsWith('/api/admin') ||
    PROTECTED_PATHS.some((path) => pathname.startsWith(path))
  ) {
    // 從 cookie 或 header 獲取 token
    const token =
      request.cookies.get('admin_token')?.value ||
      request.headers.get('Authorization')?.replace('Bearer ', '')

    if (!token) {
      // 如果沒有 token，返回未授權錯誤或重定向到登入頁面
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json({ error: '未授權的訪問' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    try {
      // 驗證 token
      const payload = await verifyToken(token)
      if (!payload) {
        if (pathname.startsWith('/api/admin')) {
          return NextResponse.json({ error: '無效的認證' }, { status: 401 })
        }
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }

      // token 有效，繼續
      return NextResponse.next()
    } catch (error) {
      console.error('Token 驗證錯誤:', error)
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json({ error: '認證錯誤' }, { status: 401 })
      }
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
