import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/api/_lib/db'
import { auth } from '@/app/api/_lib/auth'
import { ResultSetHeader } from 'mysql2'

// 獲取單個預約詳情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 驗證用戶是否登入
    const authResult = await auth.fromRequest(request)
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: '請先登入' },
        { status: 401 }
      )
    }

    const userId = authResult.user.user_id
    const id = params.id

    // 查詢預約資料
    const [appointments, error] = await db.query(
      `
      SELECT 
        pa.*, 
        p.name as pet_name, 
        p.main_image as pet_image,
        p.type as pet_type,
        p.breed as pet_breed,
        p.gender as pet_gender,
        p.age_year as pet_age_year,
        p.age_month as pet_age_month,
        ps.name as store_name,
        ps.address as store_address,
        ps.phone as store_phone
      FROM pet_appointment pa
      LEFT JOIN pets p ON pa.pet_id = p.id
      LEFT JOIN pet_store ps ON p.store_id = ps.id
      WHERE pa.id = ? AND pa.user_id = ?
    `,
      [id, userId]
    )

    if (error) {
      console.error('查詢預約資料失敗:', error)
      return NextResponse.json(
        { success: false, message: '查詢預約資料失敗' },
        { status: 500 }
      )
    }

    if (!appointments || (appointments as any[]).length === 0) {
      return NextResponse.json(
        { success: false, message: '找不到該預約或您無權查看' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: (appointments as any[])[0],
    })
  } catch (err) {
    console.error('獲取預約詳情時發生錯誤:', err)
    return NextResponse.json(
      { success: false, message: '獲取預約詳情時發生錯誤' },
      { status: 500 }
    )
  }
}

// 取消預約
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 驗證用戶是否登入
    const authResult = await auth.fromRequest(request)
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: '請先登入' },
        { status: 401 }
      )
    }

    const userId = authResult.user.user_id
    const id = params.id

    // 先查詢預約資料，確認是否為待審核狀態
    const [appointments, queryError] = await db.query(
      `
      SELECT id, pet_id, status FROM pet_appointment 
      WHERE id = ? AND user_id = ?
    `,
      [id, userId]
    )

    if (queryError) {
      console.error('查詢預約資料失敗:', queryError)
      return NextResponse.json(
        { success: false, message: '查詢預約資料失敗' },
        { status: 500 }
      )
    }

    if (!appointments || (appointments as any[]).length === 0) {
      return NextResponse.json(
        { success: false, message: '找不到該預約或您無權取消' },
        { status: 404 }
      )
    }

    const appointment = (appointments as any[])[0]

    // 只有待審核或已核准的預約可以取消
    if (appointment.status !== 'pending' && appointment.status !== 'approved') {
      return NextResponse.json(
        { success: false, message: '只有待審核或已核准的預約可以取消' },
        { status: 400 }
      )
    }

    // 更新預約狀態為已取消
    const [result, error] = await db.query(
      `UPDATE pet_appointment SET status = 'cancelled', updated_at = NOW() WHERE id = ? AND user_id = ?`,
      [id, userId]
    )

    if (error) {
      console.error('取消預約失敗:', error)
      return NextResponse.json(
        { success: false, message: '取消預約失敗' },
        { status: 500 }
      )
    }

    const affectedRows = (result as unknown as ResultSetHeader).affectedRows

    if (affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: '取消預約失敗，請稍後再試' },
        { status: 500 }
      )
    }

    // 檢查該寵物是否還有其他待審核或已核准的預約
    const [otherAppointments, otherError] = await db.query(
      `
      SELECT id FROM pet_appointment 
      WHERE pet_id = ? AND status IN ('pending', 'approved') AND id != ?
    `,
      [appointment.pet_id, id]
    )

    // 如果沒有其他預約，將寵物狀態改回可領養
    if (
      !otherError &&
      (!otherAppointments || (otherAppointments as any[]).length === 0)
    ) {
      await db.query(
        `UPDATE pets SET adopt_status = 'available', updated_at = NOW() WHERE id = ?`,
        [appointment.pet_id]
      )
    }

    return NextResponse.json({
      success: true,
      message: '預約已成功取消',
    })
  } catch (err) {
    console.error('取消預約時發生錯誤:', err)
    return NextResponse.json(
      { success: false, message: '取消預約時發生錯誤' },
      { status: 500 }
    )
  }
}
