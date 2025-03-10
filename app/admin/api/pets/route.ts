import { NextResponse } from 'next/server'
import { verifyToken } from '@/app/admin/api/_lib/jwt'
import {
  getAllPets,
  createPet,
  getAllPetStores,
  Pet,
  getPetById,
} from '@/app/admin/api/_lib/pet-database'

// 獲取寵物列表
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

    // 獲取寵物列表
    const pets = await getAllPets()

    // 獲取店鋪列表（用於前端表單選項）
    const stores = await getAllPetStores()

    return NextResponse.json(
      {
        pets,
        stores,
      },
      {
        headers: {
          'Cache-Control':
            'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    )
  } catch (error) {
    console.error('獲取寵物列表時發生錯誤：', error)
    return NextResponse.json(
      { error: '獲取寵物列表時發生錯誤' },
      { status: 500 }
    )
  }
}

// 新增寵物
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
    if (!body.name || !body.gender || !body.species || !body.variety) {
      return NextResponse.json(
        { error: '缺少必要欄位：name, gender, species, variety' },
        { status: 400 }
      )
    }

    // 確保 is_adopted 欄位存在
    if (body.is_adopted === undefined) {
      body.is_adopted = 0 // 預設為未領養
    }

    // 創建寵物
    const petId = await createPet(body as Pet)

    // 獲取完整的寵物數據
    const pet = await getPetById(petId)

    return NextResponse.json({
      success: true,
      message: '寵物新增成功',
      pet_id: petId,
      pet: pet,
    })
  } catch (error) {
    console.error('新增寵物時發生錯誤：', error)
    return NextResponse.json({ error: '新增寵物時發生錯誤' }, { status: 500 })
  }
}
