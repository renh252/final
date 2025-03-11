import { NextResponse } from 'next/server'
import { verifyToken } from '@/app/api/admin/_lib/jwt'
import {
  updatePetPhoto,
  deletePetPhoto,
  PetPhoto,
} from '@/app/api/admin/_lib/pet-database'

// 更新寵物照片
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 驗證管理員權限
    const token = request.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ error: '未授權訪問' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: '沒有權限訪問此資源' }, { status: 403 })
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: '無效的照片 ID' }, { status: 400 })
    }

    // 解析請求體
    const body = await request.json()

    try {
      // 更新寵物照片
      const result = await updatePetPhoto(id, body as Partial<PetPhoto>)

      return NextResponse.json({
        success: true,
        message: '照片更新成功',
        affected_rows: result.affectedRows,
      })
    } catch (err) {
      if (err instanceof Error && err.message === '找不到此照片') {
        return NextResponse.json({ error: '找不到此照片' }, { status: 404 })
      }
      throw err
    }
  } catch (error) {
    console.error(`更新寵物照片 ID: ${params.id} 時發生錯誤：`, error)
    return NextResponse.json(
      { error: '更新寵物照片時發生錯誤' },
      { status: 500 }
    )
  }
}

// 刪除寵物照片
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 驗證管理員權限
    const token = request.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ error: '未授權訪問' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: '沒有權限訪問此資源' }, { status: 403 })
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: '無效的照片 ID' }, { status: 400 })
    }

    try {
      // 刪除寵物照片
      const result = await deletePetPhoto(id)

      return NextResponse.json({
        success: true,
        message: '照片刪除成功',
        affected_rows: result.affectedRows,
      })
    } catch (err) {
      if (err instanceof Error && err.message === '找不到此照片') {
        return NextResponse.json({ error: '找不到此照片' }, { status: 404 })
      }
      throw err
    }
  } catch (error) {
    console.error(`刪除寵物照片 ID: ${params.id} 時發生錯誤：`, error)
    return NextResponse.json(
      { error: '刪除寵物照片時發生錯誤' },
      { status: 500 }
    )
  }
}
