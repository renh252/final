import { NextRequest, NextResponse } from 'next/server'
import { getAllPetStores } from '@/app/api/admin/_lib/pet-database'
import { auth } from '@/app/api/admin/_lib/auth'

// GET: 獲取所有店鋪
export async function GET(request: NextRequest) {
  try {
    // 驗證管理員權限
    const token = request.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ error: '未授權訪問' }, { status: 401 })
    }

    const admin = await auth.verify(token)
    if (!admin) {
      return NextResponse.json({ error: '無效的授權令牌' }, { status: 401 })
    }

    if (!auth.can(admin, 'pet_management')) {
      return NextResponse.json({ error: '沒有管理寵物的權限' }, { status: 403 })
    }

    // 獲取所有店鋪
    const stores = await getAllPetStores()

    return NextResponse.json({
      success: true,
      stores,
    })
  } catch (error) {
    console.error('獲取店鋪列表時發生錯誤：', error)
    return NextResponse.json({ error: '獲取店鋪列表失敗' }, { status: 500 })
  }
}
