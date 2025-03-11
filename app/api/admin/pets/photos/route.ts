import { NextResponse } from 'next/server'
import { verifyToken } from '@/app/api/admin/_lib/jwt'
import {
  getPetPhotos,
  createPetPhoto,
  PetPhoto,
} from '@/app/api/admin/_lib/pet-database'

// 獲取寵物照片
export async function GET(request: Request) {
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

    // 獲取寵物 ID
    const { searchParams } = new URL(request.url)
    const petId = searchParams.get('pet_id')

    if (!petId || isNaN(parseInt(petId))) {
      return NextResponse.json(
        { error: '缺少必要參數 pet_id 或參數無效' },
        { status: 400 }
      )
    }

    // 獲取寵物照片
    const photos = await getPetPhotos(parseInt(petId))

    return NextResponse.json({ photos })
  } catch (error) {
    console.error('獲取寵物照片時發生錯誤：', error)
    return NextResponse.json(
      { error: '獲取寵物照片時發生錯誤' },
      { status: 500 }
    )
  }
}

// 新增寵物照片
export async function POST(request: Request) {
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

    // 解析請求體
    const body = await request.json()

    // 驗證必填欄位
    if (!body.pet_id || !body.photo_url) {
      return NextResponse.json(
        { error: '缺少必要欄位：pet_id, photo_url' },
        { status: 400 }
      )
    }

    // 確保 is_main 欄位存在
    if (body.is_main === undefined) {
      body.is_main = 0 // 預設為非主照片
    }

    // 創建寵物照片
    const photoId = await createPetPhoto(body as PetPhoto)

    return NextResponse.json({
      success: true,
      message: '照片新增成功',
      photo_id: photoId,
    })
  } catch (error) {
    console.error('新增寵物照片時發生錯誤：', error)
    return NextResponse.json(
      { error: '新增寵物照片時發生錯誤' },
      { status: 500 }
    )
  }
}
