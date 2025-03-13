import { NextRequest, NextResponse } from 'next/server'
import {
  verifyAdmin,
  exportToCsv,
  exportToJson,
} from '@/app/api/admin/_lib/data-export'
import { getAllPets } from '@/app/api/admin/_lib/pet-database'

export async function GET(request: NextRequest) {
  // 驗證管理員權限
  const authResult = await verifyAdmin(request)
  if (!authResult.success) {
    return authResult.response
  }

  try {
    // 獲取導出格式
    const format = request.nextUrl.searchParams.get('format') || 'csv'

    // 獲取寵物列表
    const pets = await getAllPets()

    // 根據格式導出數據
    if (format === 'json') {
      return exportToJson(pets, 'pets_export')
    } else {
      return exportToCsv(pets, 'pets_export')
    }
  } catch (error) {
    console.error('導出寵物數據時發生錯誤：', error)
    return NextResponse.json(
      { error: '導出寵物數據時發生錯誤' },
      { status: 500 }
    )
  }
}
