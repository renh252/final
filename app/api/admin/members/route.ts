import { NextResponse } from 'next/server'
import { verifyToken } from '@/app/api/admin/_lib/jwt'
import {
  getAllMembers,
  createMember,
  Member,
  getMemberById,
} from '@/app/api/admin/_lib/member-database'

// 獲取會員列表
export async function GET(request: Request) {
  try {
    // 驗證管理員權限
    const token = request.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ error: '未授權訪問' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: '沒有權限訪問此資源' }, { status: 403 })
    }

    // 獲取會員列表
    const members = await getAllMembers()

    return NextResponse.json(
      {
        members,
      },
      {
        headers: {
          'Cache-Control':
            'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    )
  } catch (error) {
    console.error('獲取會員列表時發生錯誤：', error)
    return NextResponse.json(
      { error: '獲取會員列表時發生錯誤' },
      { status: 500 }
    )
  }
}

// 新增會員
export async function POST(request: Request) {
  try {
    // 驗證管理員權限
    const token = request.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ error: '未授權訪問' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: '沒有權限訪問此資源' }, { status: 403 })
    }

    // 解析請求體
    const body = await request.json()

    // 驗證必填欄位
    if (!body.full_name || !body.email || !body.phone) {
      return NextResponse.json(
        { error: '缺少必要欄位：full_name, email, phone' },
        { status: 400 }
      )
    }

    // 確保 status 欄位存在
    if (!body.status) {
      body.status = 'active' // 預設為正常狀態
    }

    // 創建會員
    const memberId = await createMember(body as Member)

    // 獲取完整的會員數據
    const member = await getMemberById(memberId)

    return NextResponse.json({
      success: true,
      message: '會員新增成功',
      member_id: memberId,
      member: member,
    })
  } catch (error) {
    console.error('新增會員時發生錯誤：', error)
    return NextResponse.json({ error: '新增會員時發生錯誤' }, { status: 500 })
  }
}
