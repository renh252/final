import { createPool, createQueryHelper } from '@/app/lib/db'
import { RowDataPacket } from 'mysql2/promise'

// 創建管理員專用連接池
export const adminPool = createPool(true)

// 創建管理員專用查詢輔助對象
export const adminDb = createQueryHelper(adminPool)

// 創建管理員資料庫操作對象
export const adminDatabase = {
  // 測試連接
  testConnection: async (): Promise<boolean> => {
    try {
      const [result] = await adminPool.query('SELECT 1 as connection_test')
      return Array.isArray(result) && result.length > 0
    } catch (error) {
      console.error('資料庫連接測試失敗:', error)
      return false
    }
  },

  // 執行安全查詢（需要管理員驗證）
  executeSecureQuery: async <T extends RowDataPacket[]>(
    sql: string,
    params: any[] = []
  ): Promise<[T | null, Error | null]> => {
    try {
      // 執行查詢
      const [results] = await adminPool.query<T>(sql, params)
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
      const [results] = await adminPool.execute<T>(sql, params)
      return [results, null]
    } catch (error) {
      console.error('SQL執行錯誤:', error)
      return [null, error as Error]
    }
  },

  // 查詢管理員資訊
  findAdminById: async (id: number): Promise<any> => {
    const [results] = await adminPool.query(
      'SELECT id, manager_account, manager_privileges FROM manager WHERE id = ? LIMIT 1',
      [id]
    )
    return Array.isArray(results) && results.length > 0 ? results[0] : null
  },
}

// 為了保持向後兼容，提供預設導出
export default adminPool
