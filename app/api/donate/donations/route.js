import { NextResponse } from 'next/server'
import db from '@/app/lib/db'

export async function GET(request) {
  try {
    let responseData = {}
    const connection = await db.getConnection()

    const user_id = 1

    // 獲取活動商品資料
    const [donations] = await connection.execute(
      `
      SELECT * FROM donations 
      WHERE user_id = ? AND transaction_status = '已付款'
      ORDER BY create_datetime DESC
      `,
      [user_id]
    )
    responseData.donations = donations

    // 計算訂單總數
    const [totalResult] = await connection.execute(
      `
      SELECT COUNT(*) as totalDonations
      FROM donations
      WHERE user_id =? AND transaction_status = '已付款'
    `,
      [user_id]
    )
    responseData.totalDonations = totalResult[0].totalDonations

    // 釋放連接
    connection.release()

    // 返回數據
    return NextResponse.json(responseData)
  } catch (error) {
    console.error('獲取資料時發生錯誤：', error)
    return NextResponse.json({ error: '獲取資料時發生錯誤' }, { status: 500 })
  }
}
