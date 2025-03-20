const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'P@ssw0rd',
  database: process.env.DB_DATABASE || 'pet_proj',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function executeQuery(query, params = []) {
  try {
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

module.exports = { executeQuery };
