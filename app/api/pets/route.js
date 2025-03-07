import { NextResponse } from 'next/server'
import pool from '@/app/lib/db'

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.birthday,
        p.gender,
        p.variety,
        p.store_id,
        ps.address as location
      FROM pets p
      LEFT JOIN pet_store ps ON p.store_id = ps.id
      ORDER BY p.id DESC
      LIMIT 10
    `)

    // 計算年齡並處理地址顯示
    const petsWithAge = rows.map((pet) => {
      const birthDate = new Date(pet.birthday)
      const today = new Date()

      // 計算年份差異
      let years = today.getFullYear() - birthDate.getFullYear()

      // 計算月份差異
      let months = today.getMonth() - birthDate.getMonth()

      // 如果當月日期小於出生日期，減去一個月
      if (today.getDate() < birthDate.getDate()) {
        months--
      }

      // 調整年份和月份
      if (months < 0) {
        years--
        months += 12
      }

      // 計算總月份（用於不足一歲的情況）
      const totalMonths = years * 12 + months

      // 根據年齡決定顯示方式
      const ageDisplay = years > 0 ? `${years}歲` : `${totalMonths}個月`

      // 處理地址顯示
      const locationDisplay = pet.location
        ? pet.location.substring(0, 3) // 只取前三個字
        : '待前往店家'

      return {
        ...pet,
        age: ageDisplay,
        gender: pet.gender === 'M' ? '男生' : '女生',
        location: locationDisplay,
      }
    })

    return NextResponse.json({ pets: petsWithAge })
  } catch (error) {
    console.error('Error fetching pets:', error)
    return NextResponse.json({ error: 'Failed to fetch pets' }, { status: 500 })
  }
}
