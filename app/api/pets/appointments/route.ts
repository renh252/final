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
          COALESCE(pp.photo_url, '') as pet_image,
          p.species as pet_type,
          p.variety as pet_breed,
          ps.name as store_name
        FROM pet_appointment pa
        LEFT JOIN pets p ON pa.pet_id = p.id
        LEFT JOIN pet_store ps ON pa.store_id = ps.id
        LEFT JOIN pet_photos pp ON p.id = pp.pet_id AND pp.is_main = 1
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
    console.log('接收到預約請求')
    const data = await request.json()
    console.log('請求數據:', data)

    // 驗證必要欄位
    if (
      !data.pet_id ||
      !data.user_id ||
      !data.appointment_date ||
      !data.appointment_time ||
      !data.house_type
    ) {
      console.log('缺少必要欄位:', data)
      return NextResponse.json(
        { success: false, message: '缺少必要欄位' },
        { status: 400 }
      )
    }

    // 檢查寵物是否存在且可領養
    try {
      const [pets, petError] = await db.query(
        `
        SELECT id, name, is_adopted FROM pets WHERE id = ? AND is_adopted = 0
      `,
        [data.pet_id]
      )

      if (petError) {
        console.error('查詢寵物信息失敗:', petError)
        return NextResponse.json(
          { success: false, message: '查詢寵物信息失敗' },
          { status: 500 }
        )
      }

      if (!pets || (pets as any[]).length === 0) {
        console.log('寵物不存在或已被領養:', data.pet_id)
        return NextResponse.json(
          { success: false, message: '該寵物不存在或已不可領養' },
          { status: 400 }
        )
      }

      const pet = (pets as any[])[0]
      console.log('找到寵物:', pet)

      // 檢查是否已有相同的預約
      const [existingAppointments, existingError] = await db.query(
        `
        SELECT id FROM pet_appointment 
        WHERE pet_id = ? AND user_id = ? AND status IN ('pending', 'approved')
      `,
        [data.pet_id, data.user_id]
      )

      if (existingError) {
        console.error('查詢已有預約失敗:', existingError)
        return NextResponse.json(
          { success: false, message: '查詢預約記錄失敗' },
          { status: 500 }
        )
      }

      if (existingAppointments && (existingAppointments as any[]).length > 0) {
        console.log('用戶已預約該寵物:', data.user_id, data.pet_id)
        return NextResponse.json(
          {
            success: false,
            message: '您已經預約過這隻寵物，請等待審核或查看您的預約列表',
          },
          { status: 400 }
        )
      }

      // 確保有 store_id，如果沒有提供則嘗試從寵物信息獲取
      if (!data.store_id) {
        // 嘗試查詢寵物所在的商店
        const [petStores, storeError] = await db.query(
          `SELECT store_id FROM pets WHERE id = ?`,
          [data.pet_id]
        )

        if (!storeError && petStores && (petStores as any[]).length > 0) {
          data.store_id = (petStores as any[])[0].store_id
        } else {
          // 如果找不到商店ID，使用默認值
          data.store_id = 1 // 假設1是默認商店ID
        }
      }

      console.log('準備插入預約數據:', {
        pet_id: data.pet_id,
        user_id: data.user_id,
        store_id: data.store_id,
        date: data.appointment_date,
        time: data.appointment_time,
      })

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
          data.store_id || null,
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
          { success: false, message: '新增預約失敗', error: error.message },
          { status: 500 }
        )
      }

      const appointmentId = (result as any).insertId
      console.log('預約建立成功，ID:', appointmentId)

      // 使用通用通知API向用戶發送通知
      try {
        const petName = pet.name
        // 發送通知給用戶
        const notificationData = {
          user_id: data.user_id,
          type: 'pet',
          title: '寵物預約申請已提交',
          message: `您已成功提交「${petName}」的預約申請，我們將盡快處理您的申請。`,
          link: `/member/appointments`,
        }

        // 直接插入通知到資料庫
        const [userNotificationResult, userNotificationError] = await db.query(
          `INSERT INTO notifications (user_id, type, title, message, link, created_at) VALUES (?, ?, ?, ?, ?, NOW())`,
          [
            notificationData.user_id,
            notificationData.type,
            notificationData.title,
            notificationData.message,
            notificationData.link,
          ]
        )

        if (userNotificationError) {
          console.error('新增用戶通知失敗:', userNotificationError)
        } else {
          console.log(
            '用戶通知創建成功，ID:',
            (userNotificationResult as any).insertId
          )
        }

        // 發送通知給管理員
        const adminNotificationData = {
          admin_id: 6, // 超級管理員
          type: 'pet',
          title: '收到新的領養申請',
          message: `收到用戶 ${data.user_id} 對「${petName}」的領養申請，請盡快審核。`,
          link: `/admin/pets/appointments`,
        }

        // 直接插入管理員通知到資料庫
        const [adminNotificationResult, adminNotificationError] =
          await db.query(
            `INSERT INTO notifications (admin_id, type, title, message, link, created_at) VALUES (?, ?, ?, ?, ?, NOW())`,
            [
              adminNotificationData.admin_id,
              adminNotificationData.type,
              adminNotificationData.title,
              adminNotificationData.message,
              adminNotificationData.link,
            ]
          )

        if (adminNotificationError) {
          console.error('新增管理員通知失敗:', adminNotificationError)
        } else {
          console.log(
            '管理員通知創建成功，ID:',
            (adminNotificationResult as any).insertId
          )
        }
      } catch (notifyErr) {
        console.error('發送通知時發生錯誤:', notifyErr)
        // 不影響主流程，僅記錄錯誤
      }

      return NextResponse.json({
        success: true,
        message: '預約申請已成功提交，請等待審核',
        data: { id: appointmentId },
      })
    } catch (queryError) {
      console.error('資料庫查詢過程中發生錯誤:', queryError)
      return NextResponse.json(
        {
          success: false,
          message: '處理預約時發生資料庫錯誤',
          error: queryError.message,
        },
        { status: 500 }
      )
    }
  } catch (err) {
    console.error('提交預約申請時發生錯誤:', err)
    return NextResponse.json(
      { success: false, message: '提交預約申請時發生錯誤', error: err.message },
      { status: 500 }
    )
  }
}
