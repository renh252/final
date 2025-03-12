import { NextResponse } from 'next/server'
import { query } from '@/app/lib/db'
import { RowDataPacket } from 'mysql2/promise'
import { verifyToken } from '@/app/api/admin/_lib/jwt'

// 獲取資料庫摘要資訊 - 需要管理員權限
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

    // 資料庫名稱
    const dbName = process.env.DB_DATABASE || 'pet_proj'

    // 優化查詢：使用單一查詢獲取所有資訊，只查詢實際的資料表
    const tablesQuery = `
      SELECT 
        t.TABLE_NAME as table_name,
        (
          SELECT COUNT(*) 
          FROM information_schema.columns 
          WHERE table_schema = ? AND table_name = t.TABLE_NAME
        ) as column_count,
        (
          SELECT COUNT(DISTINCT index_name)
          FROM information_schema.statistics 
          WHERE table_schema = ? 
          AND table_name = t.TABLE_NAME
          AND index_name != 'PRIMARY'
        ) as index_count,
        (
          SELECT COUNT(*)
          FROM information_schema.key_column_usage
          WHERE table_schema = ?
          AND table_name = t.TABLE_NAME
          AND referenced_table_name IS NOT NULL
        ) as foreign_key_count,
        (
          SELECT COUNT(*) 
          FROM information_schema.statistics 
          WHERE table_schema = ? 
          AND table_name = t.TABLE_NAME 
          AND index_name = 'PRIMARY'
        ) as has_primary
      FROM information_schema.tables t
      WHERE t.TABLE_SCHEMA = ?
      AND t.TABLE_TYPE = 'BASE TABLE'
      ORDER BY t.TABLE_NAME
    `

    const tables = await query<RowDataPacket[]>(tablesQuery, [
      dbName,
      dbName,
      dbName,
      dbName,
      dbName,
    ])

    if (!Array.isArray(tables) || tables.length === 0) {
      return NextResponse.json({
        success: false,
        message: '無法獲取資料表資訊或資料庫為空',
      })
    }

    // 計算統計資訊
    const summary = tables.reduce(
      (acc, table) => {
        acc.totalTables++
        acc.totalIndexes += Number(table.index_count) || 0
        acc.totalForeignKeys += Number(table.foreign_key_count) || 0
        if (!table.has_primary) {
          acc.tablesWithoutPK.push(table.table_name)
        }
        acc.tables.push({
          name: table.table_name,
          columns: Number(table.column_count) || 0,
          indexes: Number(table.index_count) || 0,
          foreignKeys: Number(table.foreign_key_count) || 0,
          hasPrimaryKey: Boolean(table.has_primary),
        })
        return acc
      },
      {
        database: dbName,
        totalTables: 0,
        totalIndexes: 0,
        totalForeignKeys: 0,
        tablesWithoutPK: [] as string[],
        tables: [] as any[],
      }
    )

    // 添加除錯資訊
    console.log('資料庫摘要:', {
      dbName,
      tableCount: tables.length,
      firstTable: tables[0],
      summary: summary,
    })

    return NextResponse.json({
      success: true,
      summary,
    })
  } catch (error) {
    console.error('獲取資料庫摘要時發生錯誤：', error)
    return NextResponse.json(
      { success: false, error: '獲取資料庫摘要時發生錯誤' },
      { status: 500 }
    )
  }
}
