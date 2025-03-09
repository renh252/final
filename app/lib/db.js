import mysql from 'mysql2/promise'

// 資料庫連接配置
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'pet_proj',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// 處理數據庫連接錯誤
pool.on('error', (err) => {
  console.error('數據庫連接錯誤:', err)
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('數據庫連接被關閉')
  } else if (err.code === 'ER_CON_COUNT_ERROR') {
    console.error('數據庫有太多連接')
  } else if (err.code === 'ECONNREFUSED') {
    console.error('數據庫連接被拒絕')
  }
})

// 測試資料庫連接
export async function testConnection() {
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
export async function query(sql, params = []) {
  try {
    const [results] = await pool.query(sql, params)
    return results
  } catch (error) {
    console.error('SQL查詢錯誤:', error)
    throw error
  }
}

// 為了保持向後兼容，也提供預設導出
export default pool

// 提供與 db.ts 相同的 db 導出，方便使用
export const db = pool
