import mysql from 'mysql2/promise'

// 創建後台專用數據庫連接池
const adminPool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'pet_proj',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// 處理數據庫連接錯誤
adminPool.on('error', (err) => {
  console.error('後台數據庫連接錯誤:', err)
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
    const connection = await adminPool.getConnection()
    const [rows] = await connection.query('SELECT 1 as connection_test')
    connection.release()
    console.log('後台數據庫連接成功:', rows)
    return true
  } catch (error) {
    console.error('後台數據庫連接測試失敗:', error)
    return false
  }
}

// 提供查詢輔助函數
export async function executeQuery(sql: string, params: any[] = []) {
  let connection
  try {
    connection = await adminPool.getConnection()
    const [results] = await connection.execute(sql, params)
    return results
  } catch (error) {
    console.error('SQL查詢錯誤:', error)
    throw error
  } finally {
    if (connection) connection.release()
  }
}

export default adminPool
