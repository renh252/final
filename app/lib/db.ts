import mysql from 'mysql2/promise'
import {
  PoolOptions,
  Pool,
  RowDataPacket,
  ResultSetHeader,
  OkPacket,
} from 'mysql2/promise'

// 資料庫連接配置
const poolConfig: PoolOptions = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'pet_proj',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

// 創建連接池
export const pool: Pool = mysql.createPool(poolConfig)

// 處理數據庫連接錯誤
pool.on('error', (err: NodeJS.ErrnoException) => {
  console.error('數據庫連接錯誤:', err)
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('數據庫連接被關閉')
  } else if (err.code === 'ER_CON_COUNT_ERROR') {
    console.error('數據庫有太多連接')
  } else if (err.code === 'ECONNREFUSED') {
    console.error('數據庫連接被拒絕')
  }
})

// 定義查詢結果類型
export type QueryResult =
  | RowDataPacket[]
  | RowDataPacket[][]
  | OkPacket
  | OkPacket[]
  | ResultSetHeader

// 測試資料庫連接
export async function testConnection(): Promise<boolean> {
  try {
    const [rows] = await pool.query('SELECT 1 as connection_test')
    console.log('數據庫連接成功:', rows)
    return true
  } catch (error) {
    console.error('數據庫連接測試失敗:', error)
    return false
  }
}

// 執行 SQL 查詢並返回結果
export async function query<T = QueryResult>(
  sql: string,
  params: any[] = []
): Promise<T> {
  try {
    const [results] = await pool.query(sql, params)
    return results as T
  } catch (error) {
    console.error('SQL查詢錯誤:', error)
    throw error
  }
}

// 為了保持向後兼容，也提供預設導出
export default pool

// 創建 db 對象，確保與 query 函數行為一致
export const db = {
  query: async <T = QueryResult>(
    sql: string,
    params: any[] = []
  ): Promise<[T | null, Error | null]> => {
    try {
      const [results] = await pool.query(sql, params)
      return [results as T, null]
    } catch (error) {
      console.error('SQL查詢錯誤:', error)
      return [null, error as Error]
    }
  },
}
