import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../../app/lib/db'

export async function GET(request: NextRequest) {
  try {
    // 從資料庫獲取預約資料
    const [appointments, error] = await db.query(
      `SELECT 
        pa.*,
        u.user_name,
        p.name as pet_name
      FROM pet_appointment pa
      LEFT JOIN users u ON pa.user_id = u.user_id
      LEFT JOIN pets p ON pa.pet_id = p.id
      ORDER BY pa.appointment_date DESC, pa.appointment_time DESC`
    )

    if (error) {
      throw error
    }

    return NextResponse.json(appointments)
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { error: '獲取預約資料時發生錯誤' },
      { status: 500 }
    )
  }
}
