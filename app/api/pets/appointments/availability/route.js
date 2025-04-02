import { NextResponse } from 'next/server'
import { pool } from '@/app/lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const petId = searchParams.get('pet_id')

    if (!date || !petId) {
      return NextResponse.json({ error: '缺少必要參數' }, { status: 400 })
    }

    // 紀錄請求的原始日期
    const requestDate = date

    const connection = await pool.getConnection()

    try {
      // 檢查寵物是否已被領養
      const [petResult] = await connection.execute(
        'SELECT is_adopted FROM pets WHERE id = ?',
        [petId]
      )

      if (petResult.length === 0) {
        return NextResponse.json({ error: '找不到此寵物' }, { status: 404 })
      }

      if (petResult[0].is_adopted) {
        return NextResponse.json({ error: '此寵物已被領養' }, { status: 400 })
      }

      // 查詢在該日期有預約的時段
      const [appointments] = await connection.execute(
        `
        SELECT 
          TIME_FORMAT(appointment_time, '%H:%i') as booked_time,
          DATE_FORMAT(appointment_date, '%Y-%m-%d') as formatted_date
        FROM pet_appointment
        WHERE pet_id = ? 
        AND DATE_FORMAT(appointment_date, '%Y-%m-%d') = ?
        AND status != 'cancelled'
        `,
        [petId, requestDate]
      )

      // 只返回當天的預約時段
      const bookedTimes = appointments.map((app) => app.booked_time)

      return NextResponse.json({
        success: true,
        bookedTimes: bookedTimes || [],
        date: requestDate,
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('檢查時段可用性時發生錯誤：', error)
    return NextResponse.json(
      { error: '檢查時段可用性時發生錯誤' },
      { status: 500 }
    )
  }
}
