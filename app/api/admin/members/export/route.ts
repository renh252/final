import { NextRequest, NextResponse } from 'next/server'
import {
  verifyAdmin,
  exportToCsv,
  exportToJson,
} from '@/app/api/admin/_lib/data-export'
import { getAllMembers } from '@/app/api/admin/_lib/member-database'

export async function GET(request: NextRequest) {
  // 驗證管理員權限
  const authResult = await verifyAdmin(request)
  if (!authResult.success) {
    return authResult.response
  }

  try {
    // 獲取導出格式
    const format = request.nextUrl.searchParams.get('format') || 'csv'

    // 獲取會員列表
    const members = await getAllMembers()

    // 移除敏感信息
    const sanitizedMembers = members.map((member) => {
      const { user_password, ...rest } = member
      return rest
    })

    // 根據格式導出數據
    if (format === 'json') {
      return exportToJson(sanitizedMembers, 'members_export')
    } else {
      return exportToCsv(sanitizedMembers, 'members_export')
    }
  } catch (error) {
    console.error('導出會員數據時發生錯誤：', error)
    return NextResponse.json(
      { error: '導出會員數據時發生錯誤' },
      { status: 500 }
    )
  }
}
