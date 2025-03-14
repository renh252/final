import mysql from 'mysql2/promise'
import {
  PoolOptions,
  Pool,
  RowDataPacket,
  ResultSetHeader,
} from 'mysql2/promise'

// 資料庫連接配置
const createPoolConfig = (isAdmin: boolean = false): PoolOptions => ({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'pet_proj',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: isAdmin ? 5 : 10, // 管理員連接池使用較小的連接數
  queueLimit: 0,
})

// 定義查詢結果類型
export type QueryResult =
  | RowDataPacket[]
  | RowDataPacket[][]
  | ResultSetHeader
  | ResultSetHeader[]

// 創建連接池函數
export function createPool(isAdmin: boolean = false): Pool {
  const pool = mysql.createPool(createPoolConfig(isAdmin))
  setupErrorHandling(pool, isAdmin)
  return pool
}

// 設置錯誤處理
function setupErrorHandling(pool: Pool, isAdmin: boolean) {
  const prefix = isAdmin ? '管理員' : '一般'
  ;(pool as any).on('error', (err: any) => {
    console.error(`${prefix}數據庫連接錯誤:`, err)
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('數據庫連接被關閉')
    } else if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('數據庫有太多連接')
    } else if (err.code === 'ECONNREFUSED') {
      console.error('數據庫連接被拒絕')
    }
  })
}

// 創建查詢輔助函數的工廠函數
export function createQueryHelper(pool: Pool) {
  return {
    // 測試連接
    testConnection: async (): Promise<boolean> => {
      try {
        const [rows] = await pool.query('SELECT 1 as connection_test')
        console.log('數據庫連接成功:', rows)
        return true
      } catch (error) {
        console.error('數據庫連接測試失敗:', error)
        return false
      }
    },

    // 執行查詢
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

    // 執行預處理語句
    execute: async <T = QueryResult>(
      sql: string,
      params: any[] = []
    ): Promise<[T | null, Error | null]> => {
      try {
        const [results] = await pool.execute(sql, params)
        return [results as T, null]
      } catch (error) {
        console.error('SQL執行錯誤:', error)
        return [null, error as Error]
      }
    },
  }
}

// 創建默認連接池
export const pool = createPool()

// 創建默認查詢輔助對象
export const db = createQueryHelper(pool)

// 為了保持向後兼容，也提供預設導出
export default pool
