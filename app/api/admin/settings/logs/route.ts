import { NextRequest } from 'next/server'
import { adminDatabase } from '../../_lib/database'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filter = searchParams.get('filter') || 'all'

    let sql = `
      SELECT 
        l.id,
        l.admin_id,
        m.manager_account as admin_name,
        l.action_type as action,
        l.details,
        l.ip_address,
        l.created_at
      FROM admin_operation_logs l
      JOIN manager m ON m.id = l.admin_id
    `

    // 根據過濾條件添加 WHERE 子句
    if (filter === 'login') {
      sql += " WHERE l.action_type IN ('LOGIN', 'LOGOUT')"
    } else if (filter === 'system') {
      sql += " WHERE l.module = 'SYSTEM'"
    } else if (filter === 'data') {
      sql += " WHERE l.action_type IN ('CREATE', 'UPDATE', 'DELETE')"
    }

    // 添加排序和限制
    sql += ' ORDER BY l.created_at DESC LIMIT 100'

    const [logs] = await adminDatabase.execute(sql)

    return Response.json({ logs })
  } catch (error) {
    console.error('獲取日誌錯誤:', error)
    return Response.json({ error: '獲取日誌時發生錯誤' }, { status: 500 })
  }
}
