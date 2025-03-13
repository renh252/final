import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/app/api/admin/_lib/data-export'
import {
  processFileUpload,
  validateImportData,
} from '@/app/api/admin/_lib/data-import'
import { createMember } from '@/app/api/admin/_lib/member-database'

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
    const requiredFields = [
      'user_email',
      'user_name',
      'user_number',
      'user_address',
    ]
    const validateField = (field: string, value: any): string | null => {
      if (field === 'user_email' && !value.includes('@')) {
        return '電子郵件格式無效'
      }
      if (
        field === 'user_status' &&
        value &&
        !['正常', '禁言'].includes(value)
      ) {
        return '狀態必須是 "正常" 或 "禁言"'
      }
      if (
        field === 'user_level' &&
        value &&
        !['愛心小天使', '乾爹乾媽'].includes(value)
      ) {
        return '等級必須是 "愛心小天使" 或 "乾爹乾媽"'
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
        const member = {
          user_email: item.user_email,
          user_name: item.user_name,
          user_number: item.user_number,
          user_address: item.user_address,
          user_birthday: item.user_birthday || null,
          user_level: item.user_level || '愛心小天使',
          profile_picture: item.profile_picture || null,
          user_status: item.user_status || '正常',
          // 設置一個臨時密碼，實際應用中應該發送郵件讓用戶重設密碼
          user_password: 'temp_' + Math.random().toString(36).substring(2, 10),
        }

        // 創建會員
        const memberId = await createMember(member)
        importResults.push({
          success: true,
          id: memberId,
          email: member.user_email,
        })
      } catch (error) {
        console.error('導入會員時發生錯誤：', error)
        errors.push({
          email: item.user_email,
          error: error instanceof Error ? error.message : '未知錯誤',
        })
        importResults.push({
          success: false,
          email: item.user_email,
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
    console.error('導入會員數據時發生錯誤：', error)
    return NextResponse.json(
      { error: '導入會員數據時發生錯誤' },
      { status: 500 }
    )
  }
}
