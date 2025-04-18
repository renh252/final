import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/api/admin/_lib/db'
import { auth } from '@/app/api/admin/_lib/auth'
import { guard } from '@/app/api/admin/_lib/guard'
import { ResultSetHeader } from 'mysql2'

// 獲取單個預約詳情
export const GET = guard.api(async (request: NextRequest, authData) => {
  // 檢查權限
  if (!auth.can(authData, 'pets:appointments:read')) {
    return NextResponse.json(
      { success: false, message: '權限不足' },
      { status: 403 }
    )
  }

  // 從 URL 中獲取 ID
  const url = new URL(request.url)
  const pathParts = url.pathname.split('/')
  const id = pathParts[pathParts.length - 1]

  try {
    // 查詢預約資料，包含寵物和會員資訊
    const [appointments, error] = await db.query(
      `
      SELECT 
        pa.*, 
        p.name as pet_name, 
        (SELECT pp.photo_url FROM pet_photos pp WHERE pp.pet_id = p.id AND pp.is_main = 1 LIMIT 1) as pet_image,
        p.species as pet_type,
        p.variety as pet_breed,
        p.gender as pet_gender,
        p.birthday as pet_birthday,
        p.weight as pet_weight,
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
})

// 更新預約狀態
export const PUT = guard.api(async (request: NextRequest, authData) => {
  // 檢查權限
  if (!auth.can(authData, 'pets:appointments:write')) {
    return NextResponse.json(
      { success: false, message: '權限不足' },
      { status: 403 }
    )
  }

  // 從 URL 中獲取 ID
  const url = new URL(request.url)
  const pathParts = url.pathname.split('/')
  const id = pathParts[pathParts.length - 1]

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

    // 先獲取預約資料，以便後續發送通知
    const [appointmentData, appointmentError] = await db.query(
      `
      SELECT 
        pa.*, 
        p.name as pet_name,
        p.id as pet_id,
        pa.user_id
      FROM pet_appointment pa
      LEFT JOIN pets p ON pa.pet_id = p.id
      WHERE pa.id = ?
      `,
      [id]
    )

    if (appointmentError || (appointmentData as any[]).length === 0) {
      return NextResponse.json(
        { success: false, message: '找不到該預約' },
        { status: 404 }
      )
    }

    const appointment = (appointmentData as any[])[0]

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

    // 如果狀態更新為已批准，發送通知給用戶
    if (data.status === 'approved') {
      try {
        console.log('預約已批准，準備發送通知給用戶:', appointment.user_id)
        console.log('管理員ID:', authData.id)

        // 檢查user_id是否有效
        if (!appointment.user_id) {
          console.error('無法發送通知: 用戶ID為空')
        } else {
          // 使用通用通知API
          const notificationData = {
            user_id: appointment.user_id,
            admin_id: authData.id,
            type: 'pet',
            title: '寵物預約申請已通過',
            message: `您申請的寵物「${appointment.pet_name}」預約已通過審核，請按照預約時間前往領養中心。`,
            link: `/member/appointments`,
          }

          console.log('準備發送通知，數據:', JSON.stringify(notificationData))

          // 直接插入通知到資料庫，避免使用fetch API造成的問題
          const [notificationResult, notificationError] = await db.query(
            `INSERT INTO notifications (user_id, type, title, message, link, created_at) VALUES (?, ?, ?, ?, ?, NOW())`,
            [
              notificationData.user_id,
              notificationData.type,
              notificationData.title,
              notificationData.message,
              notificationData.link,
            ]
          )

          if (notificationError) {
            console.error('新增用戶通知失敗:', notificationError)
          } else {
            console.log(
              '通知已成功發送，通知ID:',
              (notificationResult as any).insertId
            )
          }
        }
      } catch (notifyErr) {
        console.error('發送通知時發生錯誤:', notifyErr)
      }
    }

    // 如果狀態更新為已領養，同時更新寵物狀態
    if (data.status === 'completed') {
      // 更新寵物狀態為已領養
      await db.query(`UPDATE pets SET is_adopted = 1 WHERE id = ?`, [
        appointment.pet_id,
      ])

      // 發送領養成功通知
      try {
        // 檢查user_id是否有效
        if (!appointment.user_id) {
          console.error('無法發送領養完成通知: 用戶ID為空')
        } else {
          // 領養完成通知內容
          const notificationData = {
            user_id: appointment.user_id,
            admin_id: authData.id,
            type: 'pet',
            title: '恭喜您成功領養寵物',
            message: `您已成功領養「${appointment.pet_name}」，感謝您給予這個小生命一個溫暖的家。`,
            link: `/member/appointments`,
          }

          console.log(
            '準備發送領養完成通知，數據:',
            JSON.stringify(notificationData)
          )

          // 直接插入通知到資料庫
          const [notificationResult, notificationError] = await db.query(
            `INSERT INTO notifications (user_id, type, title, message, link, created_at) VALUES (?, ?, ?, ?, ?, NOW())`,
            [
              notificationData.user_id,
              notificationData.type,
              notificationData.title,
              notificationData.message,
              notificationData.link,
            ]
          )

          if (notificationError) {
            console.error('新增領養完成通知失敗:', notificationError)
          } else {
            console.log(
              '領養完成通知已成功發送，通知ID:',
              (notificationResult as any).insertId
            )
          }
        }
      } catch (notifyErr) {
        console.error('發送領養成功通知時發生錯誤:', notifyErr)
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
})

// 刪除預約
export const DELETE = guard.api(async (request: NextRequest, authData) => {
  // 檢查權限
  if (!auth.can(authData, 'pets:appointments:delete')) {
    return NextResponse.json(
      { success: false, message: '權限不足' },
      { status: 403 }
    )
  }

  // 從 URL 中獲取 ID
  const url = new URL(request.url)
  const pathParts = url.pathname.split('/')
  const id = pathParts[pathParts.length - 1]

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
})
