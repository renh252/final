import { createPool, createQueryHelper, type QueryResult } from '@/app/lib/db'

// 創建管理員專用連接池
export const adminPool = createPool(true)

// 創建管理員專用查詢輔助對象
export const adminDb = createQueryHelper(adminPool)

// 擴展查詢輔助對象，添加管理員特定的功能
export const adminDatabase = {
  ...adminDb,

  // 記錄管理員操作日誌
  async logAdminAction(
    adminId: number,
    action: string,
    details: string
  ): Promise<void> {
    const [result, error] = await adminDb.execute(
      'INSERT INTO admin_logs (admin_id, action, details) VALUES (?, ?, ?)',
      [adminId, action, details]
    )

    if (error) {
      console.error('記錄管理員操作失敗:', error)
      throw error
    }
  },

  // 執行帶有管理員驗證的查詢
  async executeSecureQuery<T = QueryResult>(
    adminId: number,
    sql: string,
    params: any[] = []
  ): Promise<T> {
    // 檢查管理員權限
    const [admin, error] = await adminDb.query(
      'SELECT * FROM manager WHERE id = ?',
      [adminId]
    )

    if (error || !admin || !admin[0]) {
      throw new Error('管理員驗證失敗')
    }

    // 執行查詢
    const [result, queryError] = await adminDb.execute<T>(sql, params)

    if (queryError) {
      throw queryError
    }

    // 記錄操作
    await this.logAdminAction(adminId, 'database_query', `執行查詢: ${sql}`)

    return result as T
  },
}

// 為了保持向後兼容，提供預設導出
export default adminPool
