import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/api/_lib/db'
import { auth } from '@/app/api/_lib/auth'
import { verifyToken } from '@/app/api/_lib/jwt'

// 取消預約
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = params.id

    if (!appointmentId) {
      return NextResponse.json(
        { success: false, message: '缺少預約ID' },
        { status: 400 }
      )
    }

    // 獲取授權資訊
    const authHeader = request.headers.get('Authorization')
    const token =
      authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : null

    if (!token) {
      return NextResponse.json(
        { success: false, message: '請先登入' },
        { status: 401 }
      )
    }

    try {
      // 驗證token
      const payload = await verifyToken(token)

      if (!payload) {
        return NextResponse.json(
          { success: false, message: '無效的授權信息' },
          { status: 401 }
        )
      }

      const userId = payload.userId || payload.user_id || payload.id

      if (!userId) {
        return NextResponse.json(
          { success: false, message: '無效的用戶信息' },
          { status: 401 }
        )
      }

      // 先檢查預約是否存在且屬於該用戶
      const [appointments, queryError] = await db.query(
        `SELECT pa.*, p.name as pet_name
         FROM pet_appointment pa
         JOIN pets p ON pa.pet_id = p.id
         WHERE pa.id = ? AND pa.user_id = ?`,
        [appointmentId, userId]
      )

      if (queryError) {
        console.error('查詢預約失敗:', queryError)
        return NextResponse.json(
          { success: false, message: '查詢預約失敗' },
          { status: 500 }
        )
      }

      if (!appointments || (appointments as any[]).length === 0) {
        return NextResponse.json(
          { success: false, message: '找不到該預約或您無權取消此預約' },
          { status: 404 }
        )
      }

      const appointment = (appointments as any[])[0]

      // 檢查是否可以取消
      if (appointment.status !== 'pending') {
        return NextResponse.json(
          { success: false, message: '只能取消待審核的預約' },
          { status: 400 }
        )
      }

      // 更新預約狀態為已取消
      const [updateResult, updateError] = await db.query(
        `UPDATE pet_appointment SET status = 'cancelled', updated_at = NOW() WHERE id = ?`,
        [appointmentId]
      )

      if (updateError) {
        console.error('取消預約失敗:', updateError)
        return NextResponse.json(
          { success: false, message: '取消預約失敗' },
          { status: 500 }
        )
      }

      // 使用通用通知API發送通知
      try {
        const notificationData = {
          user_id: userId,
          type: 'pet',
          title: '預約已取消',
          message: `您已成功取消「${appointment.pet_name}」的領養預約。`,
          link: `/member/appointments`,
        }

        // 調用通知API
        const notificationResponse = await fetch(
          `${
            process.env.API_BASE_URL ||
            process.env.NEXT_PUBLIC_API_BASE_URL ||
            ''
          }/api/notifications/add`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(notificationData),
          }
        )

        const notificationResult = await notificationResponse.json()

        if (!notificationResult.success) {
          console.error('新增通知失敗:', notificationResult.message)
        } else {
          console.log(
            '通知已成功發送，通知ID:',
            notificationResult.notification_id
          )
        }
      } catch (notifyErr) {
        console.error('發送通知時發生錯誤:', notifyErr)
      }

      return NextResponse.json({
        success: true,
        message: '預約已成功取消',
      })
    } catch (tokenError) {
      console.error('token驗證時發生錯誤:', tokenError)
      return NextResponse.json(
        { success: false, message: '登入信息已過期，請重新登入' },
        { status: 401 }
      )
    }
  } catch (err) {
    console.error('取消預約時發生錯誤:', err)
    return NextResponse.json(
      { success: false, message: '取消預約時發生錯誤' },
      { status: 500 }
    )
  }
}
