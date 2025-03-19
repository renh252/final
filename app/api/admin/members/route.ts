import { NextRequest, NextResponse } from 'next/server'
import { db } from '../_lib/db'
import { guard } from '../_lib/guard'
import { PERMISSIONS } from '../_lib/permissions'

// 獲取會員列表
export const GET = guard.api(async (req: NextRequest, auth) => {
  const url = new URL(req.url)
  const search = url.searchParams.get('search') || ''
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '10')
  const offset = (page - 1) * limit

  try {
    // 查詢會員總數
    const [countResult] = await db.query<{ total: number }[]>(
      'SELECT COUNT(*) as total FROM users WHERE user_name LIKE ? OR user_email LIKE ?',
      [`%${search}%`, `%${search}%`]
    )
    const total = countResult[0].total

    // 查詢會員列表
    const [members] = await db.query(
      `SELECT 
        user_id, user_name, user_email, user_number, 
        user_level, user_status, user_address, user_birthday, profile_picture 
      FROM users 
      WHERE user_name LIKE ? OR user_email LIKE ? 
      ORDER BY user_id DESC 
      LIMIT ? OFFSET ?`,
      [`%${search}%`, `%${search}%`, limit, offset]
    )

    return NextResponse.json({
      success: true,
      members,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('獲取會員列表失敗:', error)
    return NextResponse.json({
      success: false,
      message: '獲取會員列表失敗',
    })
  }
}, PERMISSIONS.MEMBERS.READ)

// 新增會員
export const POST = guard.api(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const { user_name, user_email, user_number, user_level } = body

    // 檢查 email 是否已存在
    const [existing] = await db.query(
      'SELECT user_id FROM users WHERE user_email = ?',
      [user_email]
    )
    if (existing.length > 0) {
      return NextResponse.json({
        success: false,
        message: '此 Email 已被使用',
      })
    }

    // 新增會員
    const [result] = await db.query(
      `INSERT INTO users (
        user_name, user_email, user_number, 
        user_level, user_status, user_password
      ) VALUES (?, ?, ?, ?, '正常', ?)`,
      [user_name, user_email, user_number, user_level, body.password || '']
    )

    return NextResponse.json({
      success: true,
      data: {
        user_id: result.insertId,
      },
      message: '新增會員成功',
    })
  } catch (error) {
    console.error('新增會員失敗:', error)
    return NextResponse.json({
      success: false,
      message: '新增會員失敗',
    })
  }
}, PERMISSIONS.MEMBERS.WRITE)
