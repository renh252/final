import { NextRequest, NextResponse } from 'next/server'
import { guard } from '@/app/api/admin/_lib/guard'
import { PERMISSIONS } from '@/app/api/admin/_lib/permissions'
import { db } from '@/app/api/admin/_lib/db'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

// 定義介面
interface Pet extends RowDataPacket {
  pet_id: number
  pet_name: string
  pet_description: string
  pet_status: string
  created_at: Date
  updated_at: Date
  traits: string
  likes_count: number
}

interface CountResult extends RowDataPacket {
  total: number
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// 獲取寵物列表
export const GET = guard.api(
  guard.perm(PERMISSIONS.PETS.READ)(async (req: NextRequest, auth) => {
    const url = new URL(req.url)
    const search = url.searchParams.get('search') || ''
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const offset = (page - 1) * limit
    const status = url.searchParams.get('status') || ''

    try {
      let whereClause = 'WHERE 1=1'
      const params: any[] = []

      if (search) {
        whereClause += ' AND (pet_name LIKE ? OR pet_description LIKE ?)'
        params.push(`%${search}%`, `%${search}%`)
      }

      if (status) {
        whereClause += ' AND pet_status = ?'
        params.push(status)
      }

      // 查詢寵物總數
      const [countResult] = await db.query<CountResult[]>(
        `SELECT COUNT(*) as total FROM pets ${whereClause}`,
        params
      )
      const total = countResult[0].total

      // 查詢寵物列表
      const [pets] = await db.query<Pet[]>(
        `SELECT 
          p.*,
          GROUP_CONCAT(DISTINCT ptl.trait_tag) as traits,
          COUNT(DISTINCT pl.user_id) as likes_count
        FROM pets p
        LEFT JOIN pet_trait pt ON p.id = pt.pet_id
        LEFT JOIN pet_trait_list ptl ON pt.trait_id = ptl.id
        LEFT JOIN pets_like pl ON p.id = pl.pet_id
        ${whereClause}
        GROUP BY p.id
        ORDER BY p.created_at DESC 
        LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      )

      return NextResponse.json({
        success: true,
        data: pets,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      } as ApiResponse<Pet[]>)
    } catch (error) {
      console.error('獲取寵物列表失敗:', error)
      return NextResponse.json(
        { success: false, message: '獲取寵物列表失敗' },
        { status: 500 }
      )
    }
  })
)

// 新增寵物
export const POST = guard.api(
  guard.perm(PERMISSIONS.PETS.WRITE)(async (req: NextRequest, auth) => {
    try {
      const body = await req.json()

      const [result] = await db.query<ResultSetHeader>(
        `INSERT INTO pets (
          pet_name,
          pet_description,
          pet_status,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, NOW(), NOW())`,
        [body.pet_name, body.pet_description, body.pet_status]
      )

      if (result.affectedRows > 0) {
        return NextResponse.json({
          success: true,
          message: '寵物新增成功',
          data: { pet_id: result.insertId },
        } as ApiResponse<{ pet_id: number }>)
      } else {
        throw new Error('寵物新增失敗')
      }
    } catch (error) {
      console.error('新增寵物失敗:', error)
      return NextResponse.json(
        { success: false, message: '新增寵物失敗' },
        { status: 500 }
      )
    }
  })
)
