import { NextResponse } from 'next/server'
import { verifyToken } from '@/app/api/admin/_lib/jwt'
import {
  getMemberById,
  updateMember,
  deleteMember,
  Member,
} from '@/app/api/admin/_lib/member-database'

// 獲取單個會員
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: '無效的會員 ID' }, { status: 400 })
    }

    // 獲取會員詳情
    const member = await getMemberById(id)
    if (!member) {
      return NextResponse.json({ error: '找不到此會員' }, { status: 404 })
    }

    return NextResponse.json(
      {
        member,
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
    console.error(`獲取會員 ID: ${params.id} 時發生錯誤：`, error)
    return NextResponse.json(
      { error: '獲取會員詳情時發生錯誤' },
      { status: 500 }
    )
  }
}

// 更新會員
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`收到更新會員請求，ID: ${params.id}`)

    // 驗證管理員權限
    const token = request.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      console.log(`更新會員失敗：未授權訪問，ID: ${params.id}`)
      return NextResponse.json({ error: '未授權訪問' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded || decoded.role !== 'admin') {
      console.log(
        `更新會員失敗：沒有權限，ID: ${params.id}，角色: ${decoded?.role}`
      )
      return NextResponse.json({ error: '沒有權限訪問此資源' }, { status: 403 })
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      console.log(`更新會員失敗：無效的 ID: ${params.id}`)
      return NextResponse.json({ error: '無效的會員 ID' }, { status: 400 })
    }

    // 解析請求體
    const body = await request.json()
    console.log(`更新會員請求體，ID: ${id}，數據:`, body)

    // 檢查會員是否存在
    const existingMember = await getMemberById(id)
    if (!existingMember) {
      console.log(`更新會員失敗：找不到會員，ID: ${id}`)
      return NextResponse.json({ error: '找不到此會員' }, { status: 404 })
    }

    // 更新會員
    const result = await updateMember(id, body as Partial<Member>)
    console.log(`更新會員成功，ID: ${id}，影響行數: ${result.affectedRows}`)

    return NextResponse.json({
      success: true,
      message: '會員更新成功',
      affected_rows: result.affectedRows,
    })
  } catch (error) {
    console.error(`更新會員 ID: ${params.id} 時發生錯誤：`, error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '更新會員時發生錯誤' },
      { status: 500 }
    )
  }
}

// 刪除會員
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: '無效的會員 ID' }, { status: 400 })
    }

    // 檢查會員是否存在
    const existingMember = await getMemberById(id)
    if (!existingMember) {
      return NextResponse.json({ error: '找不到此會員' }, { status: 404 })
    }

    // 刪除會員
    const result = await deleteMember(id)

    return NextResponse.json({
      success: true,
      message: '會員刪除成功',
      affected_rows: result.affectedRows,
    })
  } catch (error) {
    console.error(`刪除會員 ID: ${params.id} 時發生錯誤：`, error)
    return NextResponse.json({ error: '刪除會員時發生錯誤' }, { status: 500 })
  }
}
