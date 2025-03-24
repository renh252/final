import { NextResponse } from 'next/server'
import db from '@/app/lib/db'

export async function GET(request, { params }) {
  try {
    const { cancelId } = params

    // 確保 donationId 存在
    if (!cancelId) {
      return NextResponse.json({ error: '缺少捐款編號' }, { status: 400 })
    }

    const connection = await db.getConnection()

    // 查詢單筆捐款資料
    const [donation] = await connection.execute(
      'UPDATE donations SET transaction_status = ? WHERE id = ?',
      ['訂單取消', cancelId]
    )

    // 釋放連接
    connection.release()

    if (donation.length === 0) {
      return NextResponse.json({ error: '找不到該筆捐款' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: '訂單已取消' })
  } catch (error) {
    console.error('取消訂單失敗:', error)
    return NextResponse.json({ message: '取消訂單時發生錯誤' }, { status: 500 })
  }
}
