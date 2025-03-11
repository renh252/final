#!/usr/bin/env node

/**
 * 資料庫結構摘要生成工具
 *
 * 使用方法:
 * node scripts/db-summary.js
 *
 * 將輸出資料庫結構的摘要，方便在AI對話開始時提供資料庫結構的快速概覽
 */

// 載入環境變量
require('dotenv').config()

const mysql = require('mysql2/promise')
const fs = require('fs')
const path = require('path')

// 資料庫配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'pet_proj',
  port: Number(process.env.DB_PORT) || 3306,
}

// 輸出顏色函數
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
}

// 主函數
async function generateDbSummary() {
  let connection
  try {
    console.log(
      `${colors.bright}正在連接到資料庫 ${colors.green}${dbConfig.database}${colors.reset}...`
    )

    // 連接資料庫
    connection = await mysql.createConnection(dbConfig)

    // 獲取資料庫名稱
    const dbName = dbConfig.database

    // 獲取所有表格及其詳細資訊
    const tablesQuery = `
      SELECT 
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = ? AND table_name = t.table_name) as column_count,
        (
          SELECT COUNT(DISTINCT index_name)
          FROM information_schema.statistics 
          WHERE table_schema = ? 
          AND table_name = t.table_name
          AND index_name != 'PRIMARY'
        ) as index_count,
        (
          SELECT COUNT(*)
          FROM information_schema.key_column_usage
          WHERE table_schema = ?
          AND table_name = t.table_name
          AND referenced_table_name IS NOT NULL
        ) as foreign_key_count,
        (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = ? AND table_name = t.table_name AND index_name = 'PRIMARY') as has_primary
      FROM information_schema.tables t
      WHERE t.table_schema = ?
      ORDER BY table_name
    `

    const [tables] = await connection.query(tablesQuery, [
      dbName,
      dbName,
      dbName,
      dbName,
      dbName,
    ])

    if (!tables || tables.length === 0) {
      console.log(`${colors.red}無法獲取資料表資訊或資料庫為空${colors.reset}`)
      return
    }

    // 計算資料表數量和索引數
    let totalTables = 0
    let totalIndexes = 0
    let totalForeignKeys = 0
    let tablesWithoutPK = []

    const tablesList = tables.map((table) => {
      totalTables++
      const indexCount = table.index_count || 0
      const foreignKeyCount = table.foreign_key_count || 0

      totalIndexes += indexCount
      totalForeignKeys += foreignKeyCount

      if (!table.has_primary) {
        tablesWithoutPK.push(table.table_name)
      }

      return {
        name: table.table_name,
        columns: table.column_count,
        indexes: indexCount,
        foreignKeys: foreignKeyCount,
        hasPrimaryKey: !!table.has_primary,
      }
    })

    // 輸出摘要資訊
    console.log(
      `\n${colors.bright}${colors.blue}===== 資料庫結構摘要 =====${colors.reset}`
    )
    console.log(
      `${colors.bright}資料庫:${colors.reset} ${colors.green}${dbName}${colors.reset}`
    )
    console.log(`${colors.bright}總表格數:${colors.reset} ${totalTables}`)
    console.log(`${colors.bright}總索引數:${colors.reset} ${totalIndexes}`)
    console.log(`${colors.bright}總外鍵數:${colors.reset} ${totalForeignKeys}`)

    if (tablesWithoutPK.length > 0) {
      console.log(
        `\n${colors.yellow}警告: ${tablesWithoutPK.length} 個表格沒有主鍵${colors.reset}`
      )
      console.log(tablesWithoutPK.join(', '))
    }

    // 輸出表格資訊
    console.log(
      `\n${colors.bright}${colors.blue}===== 表格詳情 =====${colors.reset}`
    )

    // 使用表格格式輸出
    const tableFormat = '%-30s %-10s %-10s %-10s %-15s'
    console.log(tableFormat, '表格名稱', '欄位數', '索引數', '外鍵數', '主鍵')
    console.log('-'.repeat(80))

    tablesList.forEach((table) => {
      console.log(
        tableFormat,
        table.name,
        table.columns,
        table.indexes,
        table.foreignKeys,
        table.hasPrimaryKey ? '✓' : '✗'
      )
    })

    // 生成JSON摘要
    const summary = {
      database: dbName,
      totalTables,
      totalIndexes,
      totalForeignKeys,
      tablesWithoutPK: tablesWithoutPK.length > 0 ? tablesWithoutPK : null,
      tables: tablesList,
    }

    // 輸出JSON摘要到檔案
    const outputDir = path.join(__dirname, '../temp')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const outputFile = path.join(outputDir, 'db-summary.json')
    fs.writeFileSync(outputFile, JSON.stringify(summary, null, 2))

    console.log(`\n${colors.green}摘要已儲存到: ${outputFile}${colors.reset}`)

    // 輸出提示
    console.log(
      `\n${colors.cyan}您可以將此摘要複製到新對話中，以快速了解資料庫結構。${colors.reset}`
    )
  } catch (error) {
    console.error(
      `${colors.red}生成資料庫摘要時發生錯誤：${colors.reset}`,
      error
    )
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// 執行主函數
generateDbSummary()
