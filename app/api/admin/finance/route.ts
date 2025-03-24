// TODO: 待確認API串接是否正確。需要確認金流管理相關工具的實現方式。

import { NextRequest, NextResponse } from 'next/server'
import { guard } from '@/app/api/admin/_lib/guard'
import { PERMISSIONS } from '@/app/api/admin/_lib/permissions'
import { db } from '@/app/api/admin/_lib/db'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

// 定義介面
interface Transaction extends RowDataPacket {
  transaction_id: string
  user_id: number
  transaction_type: string
  order_id: number | null
  donation_id: number | null
  created_at: Date
  updated_at: Date
  user_name: string
  amount: number
  source_type: 'order' | 'donation' | 'other'
}

interface CountResult extends RowDataPacket {
  total: number
}

interface TotalAmount extends RowDataPacket {
  total_amount: number
}

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

// 獲取金流交易列表
export const GET = guard.api(
  guard.perm(PERMISSIONS.FINANCE.READ)(async (req: NextRequest, auth) => {
    const url = new URL(req.url)
    const search = url.searchParams.get('search') || ''
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const offset = (page - 1) * limit
    const type = url.searchParams.get('type') || ''
    const startDate = url.searchParams.get('startDate') || ''
    const endDate = url.searchParams.get('endDate') || ''

    try {
      let whereClause = 'WHERE 1=1'
      const params: any[] = []

      if (search) {
        whereClause += ' AND (t.transaction_id LIKE ? OR u.user_name LIKE ?)'
        params.push(`%${search}%`, `%${search}%`)
      }

      if (type) {
        whereClause += ' AND t.transaction_type = ?'
        params.push(type)
      }

      if (startDate) {
        whereClause += ' AND DATE(t.created_at) >= ?'
        params.push(startDate)
      }

      if (endDate) {
        whereClause += ' AND DATE(t.created_at) <= ?'
        params.push(endDate)
      }

      // 查詢交易總數
      const [countResult] = await db.query<CountResult[]>(
        `SELECT COUNT(*) as total 
         FROM transactions t 
         LEFT JOIN users u ON t.user_id = u.user_id 
         ${whereClause}`,
        params
      )
      const total = countResult[0].total

      // 查詢交易列表
      const [transactions] = await db.query<Transaction[]>(
        `SELECT 
          t.*,
          u.user_name,
          CASE 
            WHEN t.order_id IS NOT NULL THEN o.total_price
            WHEN t.donation_id IS NOT NULL THEN d.amount
            ELSE NULL
          END as amount,
          CASE 
            WHEN t.order_id IS NOT NULL THEN 'order'
            WHEN t.donation_id IS NOT NULL THEN 'donation'
            ELSE 'other'
          END as source_type
        FROM transactions t
        LEFT JOIN users u ON t.user_id = u.user_id
        LEFT JOIN orders o ON t.order_id = o.order_id
        LEFT JOIN donations d ON t.donation_id = d.donation_id
        ${whereClause}
        ORDER BY t.created_at DESC 
        LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      )

      // 計算總金額
      const [totalAmount] = await db.query<TotalAmount[]>(
        `SELECT 
          SUM(CASE 
            WHEN t.order_id IS NOT NULL THEN o.total_price
            WHEN t.donation_id IS NOT NULL THEN d.amount
            ELSE 0
          END) as total_amount
        FROM transactions t
        LEFT JOIN orders o ON t.order_id = o.order_id
        LEFT JOIN donations d ON t.donation_id = d.donation_id
        ${whereClause}`,
        params
      )

      return NextResponse.json({
        success: true,
        data: transactions,
        total_amount: totalAmount[0].total_amount || 0,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      } as ApiResponse<Transaction[]>)
    } catch (error) {
      console.error('獲取交易列表失敗:', error)
      return NextResponse.json(
        { success: false, message: '獲取交易列表失敗' },
        { status: 500 }
      )
    }
  })
)
