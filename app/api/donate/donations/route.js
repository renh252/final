import { NextResponse } from 'next/server'
import db from '@/app/lib/db'

export async function GET(request) {
  try {
    let responseData = {}
    const { searchParams } = new URL(request.url)
    const connection = await db.getConnection()
    const user_id = searchParams.get('user_id')
    console.log('user id: ', user_id)

    if (!user_id) {
      return NextResponse.json({ error: '缺少使用者 ID' }, { status: 400 })
    }

    // 獲取資料
    const [donations] = await connection.execute(
      `
      SELECT * FROM donations 
      WHERE user_id = ?
      AND trade_no NOT IN (
      SELECT retry_trade_no FROM donations WHERE retry_trade_no IS NOT NULL
      )
      ORDER BY create_datetime DESC

      `,
      [user_id]
    )
    responseData.donations = donations

    // 獲取定期定額資料
    const [recurringDonations] = await connection.execute(
      `
      SELECT * FROM donations
      WHERE user_id = ? 
        AND donation_mode = '定期定額' 
        AND transaction_status IN ('已付款', '未付款')
      ORDER BY create_datetime DESC
`,
      [user_id]
    )
    responseData.recurringDonations = recurringDonations

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
