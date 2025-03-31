import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/api/_lib/db'
import { auth } from '@/app/api/_lib/auth'
import { ResultSetHeader } from 'mysql2'

// 獲取用戶的預約列表
export async function GET(request: NextRequest) {
  try {
    // 驗證用戶是否登入
    console.log('開始驗證用戶登入狀態...')
    const authResult = await auth.fromRequest(request)
    console.log('auth.fromRequest 結果:', authResult)

    if (!authResult) {
      console.log('用戶未登入，返回 401')
      return NextResponse.json(
        { success: false, message: '請先登入' },
        { status: 401 }
      )
    }

    const userId = authResult.id
    console.log('用戶ID:', userId)

    // 查詢用戶的預約資料
    console.log('開始查詢預約資料...')
    const [appointments, error] = await db.query(
      `
      SELECT 
        pa.*, 
        p.name as pet_name, 
        p.main_image as pet_image,
        p.type as pet_type,
        p.breed as pet_breed
      FROM pet_appointment pa
      LEFT JOIN pets p ON pa.pet_id = p.id
      WHERE pa.user_id = ?
      ORDER BY pa.created_at DESC
    `,
      [userId]
    )

    if (error) {
      console.error('查詢預約資料失敗:', error)
      return NextResponse.json(
        { success: false, message: '查詢預約資料失敗' },
        { status: 500 }
      )
    }

    console.log('成功獲取預約資料，數量:', (appointments as any[]).length)
    return NextResponse.json({ success: true, data: appointments })
  } catch (err) {
    console.error('獲取預約列表時發生錯誤:', err)
    return NextResponse.json(
      { success: false, message: '獲取預約列表時發生錯誤' },
      { status: 500 }
    )
  }
}

// 提交預約申請
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // 驗證必要欄位
    if (
      !data.pet_id ||
      !data.user_id ||
      !data.appointment_date ||
      !data.appointment_time ||
      !data.house_type
    ) {
      return NextResponse.json(
        { success: false, message: '缺少必要欄位' },
        { status: 400 }
      )
    }

    // 檢查寵物是否存在且可領養
    const [pets, petError] = await db.query(
      `
      SELECT id, is_adopted FROM pets WHERE id = ? AND is_adopted = 0
    `,
      [data.pet_id]
    )

    if (petError || !pets || (pets as any[]).length === 0) {
      return NextResponse.json(
        { success: false, message: '該寵物不存在或已不可領養' },
        { status: 400 }
      )
    }

    // 檢查是否已有相同的預約
    const [existingAppointments, existingError] = await db.query(
      `
      SELECT id FROM pet_appointment 
      WHERE pet_id = ? AND user_id = ? AND status IN ('pending', 'approved')
    `,
      [data.pet_id, data.user_id]
    )

    if (
      !existingError &&
      existingAppointments &&
      (existingAppointments as any[]).length > 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: '您已經預約過這隻寵物，請等待審核或查看您的預約列表',
        },
        { status: 400 }
      )
    }

    // 插入預約資料
    const [result, error] = await db.query(
      `INSERT INTO pet_appointment (
        pet_id, 
        user_id, 
        store_id,
        appointment_date, 
        appointment_time, 
        status, 
        house_type, 
        adult_number, 
        child_number, 
        adopted_experience, 
        other_pets, 
        note,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        data.pet_id,
        data.user_id,
        data.store_id,
        data.appointment_date,
        data.appointment_time,
        data.house_type,
        data.adult_number || 1,
        data.child_number || 0,
        data.adopted_experience ? 1 : 0,
        data.other_pets || '',
        data.note || '',
      ]
    )

    if (error) {
      console.error('新增預約失敗:', error)
      return NextResponse.json(
        { success: false, message: '新增預約失敗' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '預約申請已成功提交，請等待審核',
      data: { id: (result as any).insertId },
    })
  } catch (err) {
    console.error('提交預約申請時發生錯誤:', err)
    return NextResponse.json(
      { success: false, message: '提交預約申請時發生錯誤' },
      { status: 500 }
    )
  }
}
