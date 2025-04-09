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
}

// 定義API響應介面
interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  total_amount?: number
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// GET - 獲取捐款列表
export const GET = guard.api(
  guard.perm(PERMISSIONS.FINANCE.READ)(async (req: NextRequest) => {
    try {
      const searchParams = req.nextUrl.searchParams
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '10')
      const search = searchParams.get('search') || ''
      const type = searchParams.get('type') || 'all'
      const purpose = searchParams.get('purpose') || 'all'
      const dateFrom = searchParams.get('dateFrom') || ''
      const dateTo = searchParams.get('dateTo') || ''
      const status = searchParams.get('status') || 'all'
      
      const offset = (page - 1) * limit
      let whereClause: string[] = []
      let params: any[] = []

      // 處理搜尋條件
      if (search) {
        whereClause.push('(d.donor_name LIKE ? OR d.donor_phone LIKE ? OR d.donor_email LIKE ?)')
        params.push(`%${search}%`, `%${search}%`, `%${search}%`)
      }

      // 處理捐款類型過濾
      if (type !== 'all') {
        let donationMode = type
        
        // 映射前端傳入的類型到資料庫欄位值
        if (type === 'one_time') {
          donationMode = '一次性捐款'
        } else if (type === 'monthly') {
          donationMode = '定期定額'
        }
        
        whereClause.push('d.donation_mode = ?')
        params.push(donationMode)
      }

      // 處理捐款用途過濾
      if (purpose !== 'all') {
        whereClause.push('d.donation_type = ?')
        params.push(purpose)
      }

      // 處理日期範圍
      if (dateFrom) {
        whereClause.push('DATE(d.create_datetime) >= ?')
        params.push(dateFrom)
      }
      
      if (dateTo) {
        whereClause.push('DATE(d.create_datetime) <= ?')
        params.push(dateTo)
      }

      // 處理狀態過濾
      if (status !== 'all') {
        whereClause.push('d.transaction_status = ?')
        params.push(status)
      }

      // 處理重複交易號碼過濾 (排除被替代的失敗訂單)
      whereClause.push('d.trade_no NOT IN (SELECT retry_trade_no FROM donations WHERE retry_trade_no IS NOT NULL)')
      
      // 構建最終 WHERE 子句
      const where = whereClause.length > 0 
        ? `WHERE ${whereClause.join(' AND ')}` 
        : ''

      // 計算總筆數
      const [countRows] = await db.query<{total: number}[]>(
        `SELECT COUNT(*) as total FROM donations d ${where}`,
        params
      )
      
      // 檢查是否成功獲取計數
      if (!countRows || !Array.isArray(countRows) || countRows.length === 0) {
        return NextResponse.json(
          { success: false, message: '無法獲取捐款總數' },
          { status: 500 }
        )
      }
      
      const total = countRows[0].total

      // 計算總金額
      const [totalAmountResult] = await db.query<{total_amount: number}[]>(
        `SELECT SUM(amount) as total_amount FROM donations d ${where}`,
        params
      )
      
      const totalAmount = totalAmountResult[0]?.total_amount || 0

      // 獲取捐款列表
      const [donations] = await db.query<Donation[]>(
        `SELECT 
          d.id,
          d.donation_type,
          d.pet_id,
          d.amount,
          d.donation_mode,
          d.payment_method,
          d.transaction_status,
          d.create_datetime,
          d.user_id,
          d.donor_name,
          d.donor_phone,
          d.donor_email,
          d.trade_no,
          d.retry_trade_no,
          p.name as pet_name
        FROM 
          donations d
        LEFT JOIN 
          pets p ON d.pet_id = p.id
        ${where}
        ORDER BY d.create_datetime DESC
        LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      )

      // 返回結果
      return NextResponse.json({
        success: true,
        data: donations,
        total_amount: totalAmount,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      } as ApiResponse<Donation[]>)
    } catch (error) {
      console.error('獲取捐款列表失敗:', error)
      return NextResponse.json(
        { success: false, message: '獲取捐款列表失敗' },
        { status: 500 }
      )
    }
  })
) 