import { NextResponse } from 'next/server'
import { verifyToken } from '@/app/admin/api/_lib/jwt'
import {
  getPetById,
  updatePet,
  deletePet,
  getPetPhotos,
  Pet,
} from '@/app/admin/api/_lib/pet-database'

// 獲取單個寵物
export async function GET(
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
      return NextResponse.json({ error: '無效的寵物 ID' }, { status: 400 })
    }

    // 獲取寵物詳情
    const pet = await getPetById(id)
    if (!pet) {
      return NextResponse.json({ error: '找不到此寵物' }, { status: 404 })
    }

    // 獲取寵物照片
    const photos = await getPetPhotos(id)

    return NextResponse.json(
      {
        pet,
        photos,
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
    console.error(`獲取寵物 ID: ${params.id} 時發生錯誤：`, error)
    return NextResponse.json(
      { error: '獲取寵物詳情時發生錯誤' },
      { status: 500 }
    )
  }
}

// 更新寵物
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`收到更新寵物請求，ID: ${params.id}`)

    // 驗證管理員權限
    const token = request.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      console.log(`更新寵物失敗：未授權訪問，ID: ${params.id}`)
      return NextResponse.json({ error: '未授權訪問' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded || decoded.role !== 'admin') {
      console.log(
        `更新寵物失敗：沒有權限，ID: ${params.id}，角色: ${decoded?.role}`
      )
      return NextResponse.json({ error: '沒有權限訪問此資源' }, { status: 403 })
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      console.log(`更新寵物失敗：無效的 ID: ${params.id}`)
      return NextResponse.json({ error: '無效的寵物 ID' }, { status: 400 })
    }

    // 解析請求體
    const body = await request.json()
    console.log(`更新寵物請求體，ID: ${id}，數據:`, body)

    // 檢查寵物是否存在
    const existingPet = await getPetById(id)
    if (!existingPet) {
      console.log(`更新寵物失敗：找不到寵物，ID: ${id}`)
      return NextResponse.json({ error: '找不到此寵物' }, { status: 404 })
    }

    // 處理照片欄位
    if (body.main_photo === '') {
      body.main_photo = '/images/default_no_pet.jpg' // 如果清空照片，設為預設值
      console.log(`寵物照片為空，設置為預設值，ID: ${id}`)
    }

    // 更新寵物
    const result = await updatePet(id, body as Partial<Pet>)
    console.log(`更新寵物成功，ID: ${id}，影響行數: ${result.affectedRows}`)

    return NextResponse.json({
      success: true,
      message: '寵物更新成功',
      affected_rows: result.affectedRows,
    })
  } catch (error) {
    console.error(`更新寵物 ID: ${params.id} 時發生錯誤：`, error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '更新寵物時發生錯誤' },
      { status: 500 }
    )
  }
}

// 刪除寵物
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
      return NextResponse.json({ error: '無效的寵物 ID' }, { status: 400 })
    }

    // 檢查寵物是否存在
    const existingPet = await getPetById(id)
    if (!existingPet) {
      return NextResponse.json({ error: '找不到此寵物' }, { status: 404 })
    }

    // 刪除寵物
    const result = await deletePet(id)

    return NextResponse.json({
      success: true,
      message: '寵物刪除成功',
      affected_rows: result.affectedRows,
    })
  } catch (error) {
    console.error(`刪除寵物 ID: ${params.id} 時發生錯誤：`, error)
    return NextResponse.json({ error: '刪除寵物時發生錯誤' }, { status: 500 })
  }
}
