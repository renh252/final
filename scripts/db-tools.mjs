/**
 * 資料庫結構摘要生成工具 (ESM版本)
 *
 * 使用方法:
 * node scripts/db-tools.mjs
 *
 * 將輸出資料庫結構的摘要，方便在AI對話開始時提供資料庫結構的快速概覽
 */

import { createConnection } from 'mysql2/promise'
import { writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// 獲取當前文件的目錄
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 嘗試從.env文件加載環境變量的簡單方法
async function loadEnv() {
  try {
    const fs = await import('fs')
    const envPath = join(process.cwd(), '.env')
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8')
      const envLines = envContent.split('\n')
      for (const line of envLines) {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
        if (match) {
          const key = match[1]
          let value = match[2] || ''
          // 去除引號
          value = value.replace(/^(['"])(.*)(['"])$/, '$2')
          process.env[key] = value
        }
      }
    }
  } catch (error) {
    console.error('無法加載環境變量:', error)
  }
}

// 資料庫配置
function getDbConfig() {
  return {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'pet_proj',
    port: Number(process.env.DB_PORT) || 3306,
  }
}

// 簡單的顏色函數
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
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
    // 加載環境變量
    await loadEnv()

    const dbConfig = getDbConfig()
    console.log(
      `${colors.bright}正在連接到資料庫 ${colors.green}${dbConfig.database}${colors.reset}...`
    )

    // 連接資料庫
    connection = await createConnection(dbConfig)

    // 獲取資料庫名稱
    const dbName = dbConfig.database

    // 獲取所有表格及其詳細資訊
    const tablesQuery = `
      SELECT 
        t.TABLE_NAME as table_name,
        (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = t.TABLE_NAME) as column_count,
        (
          SELECT COUNT(DISTINCT INDEX_NAME)
          FROM information_schema.STATISTICS 
          WHERE TABLE_SCHEMA = ? 
          AND TABLE_NAME = t.TABLE_NAME
          AND INDEX_NAME != 'PRIMARY'
        ) as index_count,
        (
          SELECT COUNT(*)
          FROM information_schema.KEY_COLUMN_USAGE
          WHERE TABLE_SCHEMA = ?
          AND TABLE_NAME = t.TABLE_NAME
          AND REFERENCED_TABLE_NAME IS NOT NULL
        ) as foreign_key_count,
        (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = t.TABLE_NAME AND INDEX_NAME = 'PRIMARY') as has_primary
      FROM information_schema.TABLES t
      WHERE t.TABLE_SCHEMA = ?
      AND t.TABLE_TYPE = 'BASE TABLE'
      ORDER BY t.TABLE_NAME
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
      const values = [
        table.name,
        table.columns,
        table.indexes,
        table.foreignKeys,
        table.hasPrimaryKey ? '✓' : '✗',
      ]

      let formattedLine = tableFormat
      values.forEach((value, index) => {
        formattedLine = formattedLine.replace(/%(-?\d+)s/, (match, size) => {
          const pad = parseInt(size, 10)
          const str = String(value)
          return pad > 0
            ? str.padEnd(Math.abs(pad))
            : str.padStart(Math.abs(pad))
        })
      })

      console.log(formattedLine)
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

    // 生成Markdown摘要
    let mdSummary = `# 資料庫結構摘要\n\n`
    mdSummary += `資料庫名稱: ${dbName}\n`
    mdSummary += `表格總數: ${totalTables}\n`
    mdSummary += `索引總數: ${totalIndexes}\n`
    mdSummary += `外鍵總數: ${totalForeignKeys}\n\n`

    if (tablesWithoutPK.length > 0) {
      mdSummary += `⚠️ 警告: ${
        tablesWithoutPK.length
      } 個表格沒有主鍵: ${tablesWithoutPK.join(', ')}\n\n`
    }

    mdSummary += `## 表格詳情\n\n`
    mdSummary += `| 表格名稱 | 欄位數 | 索引數 | 外鍵數 | 主鍵 |\n`
    mdSummary += `| -------- | ------ | ------ | ------ | ---- |\n`

    tablesList.forEach((table) => {
      mdSummary += `| ${table.name} | ${table.columns} | ${table.indexes} | ${
        table.foreignKeys
      } | ${table.hasPrimaryKey ? '✓' : '✗'} |\n`
    })

    mdSummary += `\n資料獲取時間: ${new Date().toLocaleString()}`

    // 輸出JSON摘要到檔案
    const outputDir = join(__dirname, '../temp')
    try {
      await mkdir(outputDir, { recursive: true })

      const outputJsonFile = join(outputDir, 'db-summary.json')
      await writeFile(outputJsonFile, JSON.stringify(summary, null, 2))

      const outputMdFile = join(outputDir, 'db-summary.md')
      await writeFile(outputMdFile, mdSummary)

      console.log(
        `\n${colors.green}JSON摘要已儲存到: ${outputJsonFile}${colors.reset}`
      )
      console.log(
        `${colors.green}Markdown摘要已儲存到: ${outputMdFile}${colors.reset}`
      )
    } catch (error) {
      console.error(`${colors.red}儲存檔案時發生錯誤:${colors.reset}`, error)
    }

    // 將MD摘要複製到剪貼板 (僅支持Node.js 18+)
    try {
      if (process.platform === 'win32') {
        const { execSync } = await import('child_process')
        execSync(`echo ${mdSummary.replace(/\n/g, '\r\n')} | clip`)
        console.log(`${colors.cyan}Markdown摘要已複製到剪貼板${colors.reset}`)
      } else if (process.platform === 'darwin') {
        const { execSync } = await import('child_process')
        execSync(`echo "${mdSummary}" | pbcopy`)
        console.log(`${colors.cyan}Markdown摘要已複製到剪貼板${colors.reset}`)
      } else {
        console.log(
          `${colors.yellow}無法自動複製到剪貼板，請手動複製${colors.reset}`
        )
      }
    } catch (error) {
      console.error(`${colors.yellow}複製到剪貼板失敗:${colors.reset}`, error)
    }

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
