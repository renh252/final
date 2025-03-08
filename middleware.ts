import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 這個 middleware 用於檢查權限
export function middleware(request: NextRequest) {
  // 獲取當前路徑
  const { pathname } = request.nextUrl

  // 處理後台路徑 - 只處理實際的 /admin 路徑
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    // 在這裡可以添加權限檢查等
    // 例如：檢查用戶是否登入、是否有後台權限

    // 放行所有管理員路由
    return NextResponse.next()
  }

  // 所有其他路徑直接放行
  return NextResponse.next()
}

// 配置觸發middleware的路徑
export const config = {
  matcher: ['/admin/:path*'],
}
