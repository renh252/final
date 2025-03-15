import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/api/admin/_lib/db'
import { auth } from '@/app/api/admin/_lib/auth'
import { guard } from '@/app/api/admin/_lib/guard'
import { ResultSetHeader } from 'mysql2'

// 獲取單個預約詳情
export const GET = guard.api(
  async (
    request: NextRequest,
    authData,
    { params }: { params: { id: string } }
  ) => {
    // 檢查權限
    if (!auth.can(authData, 'pets:appointments:read')) {
      return NextResponse.json(
        { success: false, message: '權限不足' },
        { status: 403 }
      )
    }

    const id = params.id

    try {
      // 查詢預約資料，包含寵物和會員資訊
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
        u.user_name,
        u.user_email,
        u.user_number as user_phone
      FROM pet_appointment pa
      LEFT JOIN pets p ON pa.pet_id = p.id
      LEFT JOIN users u ON pa.user_id = u.user_id
      WHERE pa.id = ?
    `,
        [id]
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
          { success: false, message: '找不到該預約' },
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
)

// 更新預約狀態
export const PUT = guard.api(
  async (
    request: NextRequest,
    authData,
    { params }: { params: { id: string } }
  ) => {
    // 檢查權限
    if (!auth.can(authData, 'pets:appointments:write')) {
      return NextResponse.json(
        { success: false, message: '權限不足' },
        { status: 403 }
      )
    }

    const id = params.id

    try {
      const data = await request.json()

      // 驗證必要欄位
      if (!data.status) {
        return NextResponse.json(
          { success: false, message: '缺少狀態欄位' },
          { status: 400 }
        )
      }

      // 檢查狀態值是否有效
      const validStatuses = ['pending', 'approved', 'completed', 'cancelled']
      if (!validStatuses.includes(data.status)) {
        return NextResponse.json(
          { success: false, message: '無效的狀態值' },
          { status: 400 }
        )
      }

      // 更新預約狀態
      const [result, error] = await db.query(
        `UPDATE pet_appointment SET status = ?, updated_at = NOW() WHERE id = ?`,
        [data.status, id]
      )

      if (error) {
        console.error('更新預約狀態失敗:', error)
        return NextResponse.json(
          { success: false, message: '更新預約狀態失敗' },
          { status: 500 }
        )
      }

      const affectedRows = (result as unknown as ResultSetHeader).affectedRows

      if (affectedRows === 0) {
        return NextResponse.json(
          { success: false, message: '找不到該預約或狀態未變更' },
          { status: 404 }
        )
      }

      // 如果狀態更新為已領養，同時更新寵物狀態
      if (data.status === 'completed') {
        // 先獲取預約的寵物ID
        const [appointments, appointmentError] = await db.query(
          `SELECT pet_id FROM pet_appointment WHERE id = ?`,
          [id]
        )

        if (
          !appointmentError &&
          appointments &&
          (appointments as any[]).length > 0
        ) {
          const petId = (appointments as any[])[0].pet_id

          // 更新寵物狀態為已領養
          await db.query(
            `UPDATE pets SET adopt_status = 'adopted', updated_at = NOW() WHERE id = ?`,
            [petId]
          )
        }
      }

      return NextResponse.json({
        success: true,
        message: '預約狀態已更新',
        data: { id, status: data.status },
      })
    } catch (err) {
      console.error('更新預約狀態時發生錯誤:', err)
      return NextResponse.json(
        { success: false, message: '更新預約狀態時發生錯誤' },
        { status: 500 }
      )
    }
  }
)

// 刪除預約
export const DELETE = guard.api(
  async (
    request: NextRequest,
    authData,
    { params }: { params: { id: string } }
  ) => {
    // 檢查權限
    if (!auth.can(authData, 'pets:appointments:delete')) {
      return NextResponse.json(
        { success: false, message: '權限不足' },
        { status: 403 }
      )
    }

    const id = params.id

    try {
      // 刪除預約
      const [result, error] = await db.query(
        `DELETE FROM pet_appointment WHERE id = ?`,
        [id]
      )

      if (error) {
        console.error('刪除預約失敗:', error)
        return NextResponse.json(
          { success: false, message: '刪除預約失敗' },
          { status: 500 }
        )
      }

      const affectedRows = (result as unknown as ResultSetHeader).affectedRows

      if (affectedRows === 0) {
        return NextResponse.json(
          { success: false, message: '找不到該預約' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        message: '預約已成功刪除',
      })
    } catch (err) {
      console.error('刪除預約時發生錯誤:', err)
      return NextResponse.json(
        { success: false, message: '刪除預約時發生錯誤' },
        { status: 500 }
      )
    }
  }
)
