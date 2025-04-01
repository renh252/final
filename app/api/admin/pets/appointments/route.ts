import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/api/admin/_lib/db'
import { auth } from '@/app/api/admin/_lib/auth'
import { guard } from '@/app/api/admin/_lib/guard'
import { ResultSetHeader } from 'mysql2'

// 獲取預約列表
export const GET = guard.api(async (request: NextRequest, authData) => {
  // 檢查權限
  if (!auth.can(authData, 'pets:appointments:read')) {
    return NextResponse.json(
      { success: false, message: '權限不足' },
      { status: 403 }
    )
  }

  try {
    // 查詢預約資料，包含寵物和會員資訊
    const [appointments, error] = await db.query(`
      SELECT 
        pa.*, 
        p.name as pet_name, 
        (SELECT pp.photo_url FROM pet_photos pp WHERE pp.pet_id = p.id AND pp.is_main = 1 LIMIT 1) as pet_image,
        u.user_name,
        u.user_email
      FROM pet_appointment pa
      LEFT JOIN pets p ON pa.pet_id = p.id
      LEFT JOIN users u ON pa.user_id = u.user_id
      ORDER BY pa.created_at DESC
    `)

    if (error) {
      console.error('查詢預約資料失敗:', error)
      return NextResponse.json(
        { success: false, message: '查詢預約資料失敗' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: appointments })
  } catch (err) {
    console.error('獲取預約列表時發生錯誤:', err)
    return NextResponse.json(
      { success: false, message: '獲取預約列表時發生錯誤' },
      { status: 500 }
    )
  }
})

// 新增預約 (僅供參考，實際應在前台實現)
export const POST = guard.api(async (request: NextRequest, authData) => {
  // 檢查權限
  if (!auth.can(authData, 'pets:appointments:write')) {
    return NextResponse.json(
      { success: false, message: '權限不足' },
      { status: 403 }
    )
  }

  try {
    const data = await request.json()

    // 驗證必要欄位
    if (!data.pet_id || !data.user_id || !data.appointment_date) {
      return NextResponse.json(
        { success: false, message: '缺少必要欄位' },
        { status: 400 }
      )
    }

    // 插入預約資料
    const [result, error] = await db.query(
      `INSERT INTO pet_appointment (
        pet_id, 
        user_id, 
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        data.pet_id,
        data.user_id,
        data.appointment_date,
        data.appointment_time,
        data.status || 'pending',
        data.house_type,
        data.adult_number,
        data.child_number,
        data.adopted_experience,
        data.other_pets,
        data.note,
      ]
    )

    if (error) {
      console.error('新增預約失敗:', error)
      return NextResponse.json(
        { success: false, message: '新增預約失敗' },
        { status: 500 }
      )
    }

    const insertId = (result as unknown as ResultSetHeader).insertId

    return NextResponse.json({
      success: true,
      message: '預約已成功建立',
      data: { id: insertId },
    })
  } catch (err) {
    console.error('新增預約時發生錯誤:', err)
    return NextResponse.json(
      { success: false, message: '新增預約時發生錯誤' },
      { status: 500 }
    )
  }
})
