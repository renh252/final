// TODO: 待確認API串接是否正確。需要確認論壇管理相關工具的實現方式。

import { NextRequest, NextResponse } from 'next/server'
import { guard } from '@/app/api/admin/_lib/guard'
import { PERMISSIONS } from '@/app/api/admin/_lib/permissions'
import { db } from '@/app/api/admin/_lib/db'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

// 定義介面
interface Post extends RowDataPacket {
  post_id: number
  title: string
  content: string
  status: string
  user_id: number
  created_at: Date
  updated_at: Date
  author_name: string
  comments_count: number
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

// 獲取論壇文章列表
export const GET = guard.api(
  guard.perm(PERMISSIONS.FORUM.READ)(async (req: NextRequest, auth) => {
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
        whereClause += ' AND (p.title LIKE ? OR p.content LIKE ?)'
        params.push(`%${search}%`, `%${search}%`)
      }

      if (status) {
        whereClause += ' AND p.status = ?'
        params.push(status)
      }

      // 查詢文章總數
      const [countResult] = await db.query<CountResult[]>(
        `SELECT COUNT(*) as total FROM posts p ${whereClause}`,
        params
      )
      const total = countResult[0].total

      // 查詢文章列表
      const [posts] = await db.query<Post[]>(
        `SELECT 
          p.*,
          u.user_name as author_name,
          COUNT(DISTINCT c.comment_id) as comments_count,
          COUNT(DISTINCT pl.user_id) as likes_count
        FROM posts p
        LEFT JOIN users u ON p.user_id = u.user_id
        LEFT JOIN comments c ON p.post_id = c.post_id
        LEFT JOIN posts_likes pl ON p.post_id = pl.post_id
        ${whereClause}
        GROUP BY p.post_id
        ORDER BY p.created_at DESC 
        LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      )

      return NextResponse.json({
        success: true,
        data: posts,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      } as ApiResponse<Post[]>)
    } catch (error) {
      console.error('獲取文章列表失敗:', error)
      return NextResponse.json(
        { success: false, message: '獲取文章列表失敗' },
        { status: 500 }
      )
    }
  })
)

// 更新文章狀態
export const PUT = guard.api(
  guard.perm(PERMISSIONS.FORUM.WRITE)(async (req: NextRequest, auth) => {
    try {
      const body = await req.json()

      const [result] = await db.query<ResultSetHeader>(
        `UPDATE posts 
         SET status = ?, 
             updated_at = NOW() 
         WHERE post_id = ?`,
        [body.status, body.post_id]
      )

      if (result.affectedRows > 0) {
        return NextResponse.json({
          success: true,
          message: '文章狀態更新成功',
        } as ApiResponse<null>)
      } else {
        throw new Error('文章狀態更新失敗')
      }
    } catch (error) {
      console.error('更新文章狀態失敗:', error)
      return NextResponse.json(
        { success: false, message: '更新文章狀態失敗' },
        { status: 500 }
      )
    }
  })
)
