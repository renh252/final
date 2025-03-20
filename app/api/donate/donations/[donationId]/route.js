import { NextResponse } from 'next/server'
import db from '@/app/lib/db'

export async function GET(request, { params }) {
  try {
    const { donationId } = params

    // 確保 donationId 存在
    if (!donationId) {
      return NextResponse.json({ error: '缺少捐款編號' }, { status: 400 })
    }

    const connection = await db.getConnection()

    // 查詢單筆捐款資料
    const [donation] = await connection.execute(
      `
      SELECT * FROM donations 
      WHERE trade_no = ?
      `,
      [donationId]
    )

    // 釋放連接
    connection.release()

    if (donation.length === 0) {
      return NextResponse.json({ error: '找不到該筆捐款' }, { status: 404 })
    }

    return NextResponse.json({ donation: donation[0] })
  } catch (error) {
    console.error('獲取捐款詳情時發生錯誤：', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}
