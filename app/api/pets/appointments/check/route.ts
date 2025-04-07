import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/api/_lib/db'

export async function GET(request: NextRequest) {
  try {
    // 獲取查詢參數
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const petId = searchParams.get('petId')

    // 驗證參數存在
    if (!userId || !petId) {
      return NextResponse.json(
        { success: false, message: '缺少必要參數' },
        { status: 400 }
      )
    }

    // 查詢該用戶是否已經有待處理或已批准的預約
    const [appointments, error] = await db.query(
      `
      SELECT id FROM pet_appointment 
      WHERE pet_id = ? AND user_id = ? AND status IN ('pending', 'approved')
      `,
      [petId, userId]
    )

    if (error) {
      console.error('查詢預約資料失敗:', error)
      return NextResponse.json(
        { success: false, message: '查詢預約記錄失敗' },
        { status: 500 }
      )
    }

    // 檢查是否存在預約
    const hasAppointment = appointments && (appointments as any[]).length > 0

    return NextResponse.json({
      success: true,
      hasAppointment,
      count: (appointments as any[]).length,
    })
  } catch (err) {
    console.error('檢查預約記錄時發生錯誤:', err)
    return NextResponse.json(
      { success: false, message: '檢查預約記錄時發生錯誤' },
      { status: 500 }
    )
  }
}
