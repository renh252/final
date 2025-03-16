import { createPool, createQueryHelper } from '@/app/lib/db'
import { RowDataPacket } from 'mysql2/promise'

// 創建前台專用連接池
export const apiPool = createPool(false) // false 表示這是前台連接池

// 創建前台專用查詢輔助對象
export const db = createQueryHelper(apiPool)

// 資料庫工具（保持與後台類似的介面，方便遷移和維護）
export const database = {
  // 測試連接
  testConnection: async (): Promise<boolean> => {
    try {
      const [result] = await apiPool.query('SELECT 1 as connection_test')
      return Array.isArray(result) && result.length > 0
    } catch (error) {
      console.error('資料庫連接測試失敗:', error)
      return false
    }
  },

  // 執行安全查詢
  executeSecureQuery: async <T extends RowDataPacket[]>(
    sql: string,
    params: any[] = []
  ): Promise<[T | null, Error | null]> => {
    try {
      const [results] = await apiPool.query<T>(sql, params)
      return [results, null]
    } catch (error) {
      console.error('SQL查詢錯誤:', error)
      return [null, error as Error]
    }
  },

  // 執行一般查詢
  execute: async <T extends RowDataPacket[]>(
    sql: string,
    params: any[] = []
  ): Promise<[T | null, Error | null]> => {
    try {
      const [results] = await apiPool.execute<T>(sql, params)
      return [results, null]
    } catch (error) {
      console.error('SQL執行錯誤:', error)
      return [null, error as Error]
    }
  },

  // 查詢使用者資訊
  findUserById: async (id: number): Promise<any> => {
    const [results] = await apiPool.query(
      'SELECT user_id, email, name, role FROM users WHERE user_id = ? AND is_active = 1 LIMIT 1',
      [id]
    )
    return Array.isArray(results) && results.length > 0 ? results[0] : null
  },
}

// 為了保持向後兼容，也提供預設導出
export default apiPool 