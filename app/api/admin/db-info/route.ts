import { NextResponse } from 'next/server'
import { verifyToken } from '@/app/api/admin/_lib/jwt'
import { query } from '@/app/lib/db'
import { RowDataPacket } from 'mysql2/promise'

// 定義表格和列的介面
interface TableRow extends RowDataPacket {
  table_name: string
}

interface ColumnRow extends RowDataPacket {
  column_name: string
  column_type: string
  is_nullable: string
  column_key: string
  column_default: string | null
  extra: string
}

interface IndexRow extends RowDataPacket {
  index_name: string
  column_name: string
  non_unique: number
  seq_in_index: number
}

interface ForeignKeyRow extends RowDataPacket {
  constraint_name: string
  column_name: string
  referenced_table_name: string
  referenced_column_name: string
}

// 獲取資料庫結構信息
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
    console.log('使用資料庫:', dbName)

    // 預先定義 pet_proj 資料庫的所有表格
    const expectedTables = [
      'bank_transfer_details',
      'bans',
      'bookmarks',
      'categories',
      'comments',
      'donations',
      'expenses',
      'follows',
      'manager',
      'orders',
      'order_items',
      'pets',
      'pets_like',
      'pets_recent_activities',
      'pet_appointment',
      'pet_store',
      'pet_trait',
      'pet_trait_list',
      'posts',
      'posts_likes',
      'products',
      'product_reviews',
      'product_variants',
      'promotions',
      'promotion_products',
      'receipts',
      'refunds',
      'reports',
      'return_order',
      'users',
      'user_sessions',
    ]

    // 直接查詢資料庫中的表格
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = ?
      ORDER BY table_name
    `

    const tables = await query<TableRow[]>(tablesQuery, [dbName])

    // 如果沒有找到表格，嘗試使用預定義的表格列表
    const tableNames = (tables as TableRow[])
      .map((t) => t.table_name)
      .filter((name) => name !== null && name !== undefined)

    const finalTableNames = tableNames.length > 0 ? tableNames : expectedTables
    console.log(
      '找到的表格數量:',
      tableNames.length,
      '使用預定義表格:',
      tableNames.length === 0
    )

    // 獲取每個表格的結構
    const tableStructures: Record<string, ColumnRow[]> = {}
    const tableIndexes: Record<string, IndexRow[]> = {}
    const tableForeignKeys: Record<string, ForeignKeyRow[]> = {}
    const tableRowCounts: Record<string, number> = {}

    for (const tableName of finalTableNames) {
      if (!tableName) continue

      try {
        // 檢查表格是否存在
        const checkTableQuery = `
          SELECT 1 
          FROM information_schema.tables 
          WHERE table_schema = ? 
          AND table_name = ?
        `
        const tableExists = await query(checkTableQuery, [dbName, tableName])
        const exists = Array.isArray(tableExists) && tableExists.length > 0

        if (!exists) {
          console.log(`表格 ${tableName} 不存在，跳過`)
          continue
        }

        // 獲取表格的列信息
        const columnsQuery = `
          SELECT 
            column_name, 
            column_type, 
            is_nullable, 
            column_key, 
            column_default, 
            extra
          FROM information_schema.columns 
          WHERE table_schema = ? 
          AND table_name = ?
          ORDER BY ordinal_position
        `
        const columns = await query<ColumnRow[]>(columnsQuery, [
          dbName,
          tableName,
        ])
        tableStructures[tableName] = columns as ColumnRow[]

        // 獲取表格的索引信息
        const indexesQuery = `
          SELECT 
            index_name,
            column_name,
            non_unique,
            seq_in_index
          FROM information_schema.statistics
          WHERE table_schema = ?
          AND table_name = ?
          ORDER BY index_name, seq_in_index
        `
        const indexes = await query<IndexRow[]>(indexesQuery, [
          dbName,
          tableName,
        ])
        tableIndexes[tableName] = indexes as IndexRow[]

        // 獲取表格的外鍵信息
        const foreignKeysQuery = `
          SELECT 
            constraint_name,
            column_name,
            referenced_table_name,
            referenced_column_name
          FROM information_schema.key_column_usage
          WHERE table_schema = ?
          AND table_name = ?
          AND referenced_table_name IS NOT NULL
          ORDER BY constraint_name
        `
        const foreignKeys = await query<ForeignKeyRow[]>(foreignKeysQuery, [
          dbName,
          tableName,
        ])
        tableForeignKeys[tableName] = foreignKeys as ForeignKeyRow[]

        // 獲取表格的行數
        try {
          const rowCountQuery = `SELECT COUNT(*) as row_count FROM \`${tableName}\``
          const rowCountResult = await query<RowDataPacket[]>(rowCountQuery)
          const rowCount =
            Array.isArray(rowCountResult) && rowCountResult.length > 0
              ? (rowCountResult[0] as any).row_count
              : 0
          tableRowCounts[tableName] = rowCount
        } catch (err) {
          console.error(`獲取表格 ${tableName} 行數時出錯:`, err)
          tableRowCounts[tableName] = -1 // 表示獲取失敗
        }
      } catch (err) {
        console.error(`處理表格 ${tableName} 時出錯:`, err)
      }
    }

    return NextResponse.json({
      tables: finalTableNames,
      tableStructures,
      tableIndexes,
      tableForeignKeys,
      tableRowCounts,
      totalTables: finalTableNames.length,
    })
  } catch (error) {
    console.error('獲取資料庫結構時發生錯誤：', error)
    return NextResponse.json(
      { error: '獲取資料庫結構時發生錯誤' },
      { status: 500 }
    )
  }
}
