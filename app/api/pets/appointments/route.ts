import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/api/_lib/db'
import { auth } from '@/app/api/_lib/auth'
import { verifyToken } from '@/app/api/_lib/jwt'
import { ResultSetHeader } from 'mysql2'

// 獲取用戶的預約列表
export async function GET(request: NextRequest) {
  try {
    // 直接從請求頭獲取token
    console.log('開始檢查請求頭...')
    const authHeader = request.headers.get('Authorization')
    console.log('Authorization頭部:', authHeader ? '存在' : '不存在')

    const token =
      authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : null

    console.log('提取的token:', token ? '存在' : '不存在')

    if (!token) {
      console.log('無法獲取token，返回401')
      return NextResponse.json(
        { success: false, message: '請先登入' },
        { status: 401 }
      )
    }

    try {
      // 直接驗證token
      const payload = await verifyToken(token)

      if (!payload) {
        console.log('token驗證失敗，無效的payload')
        return NextResponse.json(
          { success: false, message: '無效的授權信息' },
          { status: 401 }
        )
      }

      console.log('驗證token成功，payload:', payload)

      // 使用正確的userId屬性名稱
      const userId = payload.userId || payload.user_id || payload.id

      if (!userId) {
        console.log('無法從token獲取用戶ID，payload:', JSON.stringify(payload))
        return NextResponse.json(
          { success: false, message: '無效的用戶信息' },
          { status: 401 }
        )
      }

      console.log('從token中獲取的用戶ID:', userId)

      // 查詢用戶的預約資料
      console.log('開始查詢預約資料...')
      const [appointments, error] = await db.query(
        `
        SELECT 
          pa.*, 
          p.name as pet_name, 
          p.main_photo as pet_image,
          p.species as pet_type,
          p.variety as pet_breed,
          ps.name as store_name
        FROM pet_appointment pa
        LEFT JOIN pets p ON pa.pet_id = p.id
        LEFT JOIN pet_store ps ON pa.store_id = ps.id
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
    } catch (tokenError) {
      console.error('token驗證時發生錯誤:', tokenError)
      return NextResponse.json(
        { success: false, message: '登入信息已過期，請重新登入' },
        { status: 401 }
      )
    }
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
