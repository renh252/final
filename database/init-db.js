const fs = require('fs');
const path = require('path');
const { executeQuery } = require('../lib/db');

async function initDatabase() {
  try {
    console.log('開始初始化論壇資料表...');
    
    // 讀取 SQL 文件
    const sqlFile = fs.readFileSync(path.join(__dirname, 'forum_tables.sql'), 'utf-8');
    
    // 關閉外鍵檢查
    await executeQuery('SET FOREIGN_KEY_CHECKS = 0;');
    
    // 分割 SQL 語句，排除註解
    const statements = sqlFile
      .replace(/--.*$/gm, '') // 移除單行註解
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    // 依序執行每個 SQL 語句
    for (const statement of statements) {
      try {
        await executeQuery(statement);
        console.log('成功執行 SQL 語句');
      } catch (error) {
        console.error('執行 SQL 語句時發生錯誤:', error);
        throw error;
      }
    }
    
    // 重新啟用外鍵檢查
    await executeQuery('SET FOREIGN_KEY_CHECKS = 1;');
    
    console.log('論壇資料表初始化完成！');
  } catch (error) {
    console.error('資料庫初始化失敗:', error);
    process.exit(1);
  }
}

// 執行初始化
initDatabase();
