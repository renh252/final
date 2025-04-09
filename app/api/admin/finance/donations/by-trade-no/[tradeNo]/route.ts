import { NextRequest, NextResponse } from 'next/server'
import { guard } from '@/app/api/admin/_lib/guard'
import { PERMISSIONS } from '@/app/api/admin/_lib/permissions'
import { db } from '@/app/api/admin/_lib/db'
import { RowDataPacket } from 'mysql2'

// 定義捐款資料介面
interface Donation extends RowDataPacket {
  id: number
  donation_type: string
  pet_id: number | null
  amount: number
  donation_mode: string
  payment_method: string
  transaction_status: string
  create_datetime: Date
  user_id: number | null
  donor_name: string
  donor_phone: string
  donor_email: string
  trade_no: string
  retry_trade_no: string | null
  pet_name?: string
  is_receipt_needed?: number
  is_anonymous?: number
  regular_payment_date?: Date | null
}

// 定義API響應介面
interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

// GET - 通過交易編號獲取捐款詳情
export const GET = guard.api(
  guard.perm(PERMISSIONS.FINANCE.READ)(async (req: NextRequest, auth) => {
    try {
      // 從請求路徑中獲取交易編號
      const tradeNo = req.nextUrl.pathname.split('/').pop()

      // 檢查交易編號
      if (!tradeNo) {
        return NextResponse.json(
          { success: false, message: '缺少交易編號' },
          { status: 400 }
        )
      }

      console.log(`正在通過交易編號查詢捐款: ${tradeNo}`)

      // 獲取捐款詳情
      const [donation] = await db.query<Donation[]>(
        `SELECT 
          d.*,
          p.name as pet_name,
          u.user_name,
          u.email as user_email
        FROM 
          donations d
        LEFT JOIN 
          pets p ON d.pet_id = p.id
        LEFT JOIN 
          users u ON d.user_id = u.user_id
        WHERE 
          d.trade_no = ?`,
        [tradeNo]
      )

      // 檢查是否找到捐款
      if (!donation || !Array.isArray(donation) || donation.length === 0) {
        console.log(`找不到交易編號為 ${tradeNo} 的捐款`)
        return NextResponse.json(
          { success: false, message: '找不到該筆捐款' },
          { status: 404 }
        )
      }

      console.log(`成功找到交易編號為 ${tradeNo} 的捐款`)

      // 返回結果
      return NextResponse.json({
        success: true,
        data: donation[0],
      } as ApiResponse<Donation>)
    } catch (error) {
      console.error('通過交易編號獲取捐款詳情失敗:', error)
      return NextResponse.json(
        { success: false, message: '獲取捐款詳情失敗' },
        { status: 500 }
      )
    }
  })
) 