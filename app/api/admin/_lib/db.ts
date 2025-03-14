import { createPool } from '@/app/lib/db'
import { RowDataPacket } from 'mysql2/promise'

// 創建管理員專用連接池
const adminPool = createPool(true)

// 資料庫工具
export const db = {
  // 安全查詢
  query: async <T extends RowDataPacket[]>(
    sql: string,
    params: any[] = []
  ): Promise<[T, Error | null]> => {
    try {
      const [results] = await adminPool.query<T>(sql, params)
      return [results, null]
    } catch (error) {
      console.error('查詢錯誤:', error)
      return [[] as unknown as T, error as Error]
    }
  },

  // 執行操作
  exec: async (
    sql: string,
    params: any[] = []
  ): Promise<[boolean, Error | null]> => {
    try {
      await adminPool.execute(sql, params)
      return [true, null]
    } catch (error) {
      console.error('執行錯誤:', error)
      return [false, error as Error]
    }
  },

  // 測試連接
  test: async (): Promise<boolean> => {
    try {
      const [result] = await adminPool.query('SELECT 1')
      return Array.isArray(result)
    } catch (error) {
      console.error('連接測試錯誤:', error)
      return false
    }
  },
}

// 為了向後兼容
export default adminPool
