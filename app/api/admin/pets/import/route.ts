import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/app/api/admin/_lib/data-export'
import {
  processFileUpload,
  validateImportData,
} from '@/app/api/admin/_lib/data-import'
import { createPet, Pet } from '@/app/api/admin/_lib/pet-database'

export async function POST(request: NextRequest) {
  // 驗證管理員權限
  const authResult = await verifyAdmin(request)
  if (!authResult.success) {
    return authResult.response
  }

  try {
    // 獲取上傳的文件
    const formData = await request.formData()
    const result = await processFileUpload(formData)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    // 驗證數據
    const requiredFields = ['name', 'gender', 'species', 'variety']
    const validateField = (field: string, value: any): string | null => {
      if (field === 'gender' && !['公', '母'].includes(value)) {
        return '性別必須是 "公" 或 "母"'
      }
      return null
    }

    const validation = validateImportData(
      result.data!,
      requiredFields,
      validateField
    )

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: '數據驗證失敗',
          details: validation.errors,
        },
        { status: 400 }
      )
    }

    // 導入數據
    const importResults = []
    const errors = []

    for (const item of result.data!) {
      try {
        // 轉換數據格式
        const pet: Pet = {
          name: item.name,
          gender: item.gender,
          species: item.species,
          variety: item.variety,
          birthday: item.birthday || null,
          weight: item.weight ? Number(item.weight) : null,
          chip_number: item.chip_number || null,
          fixed: item.fixed ? Number(item.fixed) : 0,
          story: item.story || null,
          store_id: item.store_id ? Number(item.store_id) : null,
          is_adopted: item.is_adopted ? Number(item.is_adopted) : 0,
          main_photo: item.main_photo || '/images/default_no_pet.jpg',
        }

        // 創建寵物
        const petId = await createPet(pet)
        importResults.push({ success: true, id: petId, name: pet.name })
      } catch (error) {
        console.error('導入寵物時發生錯誤：', error)
        errors.push({
          name: item.name,
          error: error instanceof Error ? error.message : '未知錯誤',
        })
        importResults.push({
          success: false,
          name: item.name,
          error: error instanceof Error ? error.message : '未知錯誤',
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `成功導入 ${
        importResults.filter((r) => r.success).length
      } 條記錄，失敗 ${errors.length} 條`,
      results: importResults,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('導入寵物數據時發生錯誤：', error)
    return NextResponse.json(
      { error: '導入寵物數據時發生錯誤' },
      { status: 500 }
    )
  }
}
