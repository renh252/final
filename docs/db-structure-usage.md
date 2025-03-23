# 資料庫結構快速檢視指南

此文檔說明如何使用各種方法獲取資料庫結構資訊，方便在開始新對話時提供給 AI 以快速了解資料庫結構。

## 方法一：使用資料庫結構快照頁面

這是最簡單且直觀的方法，適合所有用戶：

1. 訪問管理後台的資料庫結構快照頁面：`/admin/db-snapshot`
2. 點擊「複製摘要到剪貼板」按鈕
3. 在新對話中貼上摘要資訊
4. 開始與 AI 討論您的資料庫相關問題

這個方法會生成一個包含表格、欄位數量、索引和外鍵資訊的 Markdown 格式摘要，非常適合在對話開始時提供給 AI。

## 方法二：使用 API 端點

如果您正在開發自定義工具或腳本，可以使用以下 API 端點獲取資料庫結構摘要：

```
GET /api/admin/db-summary
```

這個 API 會返回 JSON 格式的資料庫結構摘要，包括：

- 資料庫名稱
- 表格總數
- 索引總數
- 外鍵總數
- 沒有主鍵的表格列表
- 每個表格的詳細資訊（欄位數、索引數、外鍵數、是否有主鍵）

範例程式碼（JavaScript）：

```javascript
async function getDbSummary() {
  const response = await fetch('/api/admin/db-summary', {
    headers: {
      'Cache-Control': 'no-cache',
    },
  })

  if (!response.ok) {
    throw new Error('獲取資料庫摘要失敗')
  }

  const data = await response.json()
  return data.summary
}
```

## 方法三：使用 Node.js 腳本

如果您需要離線獲取資料庫結構或自動化處理，可以使用我們提供的 Node.js 腳本：

1. 確保已安裝必要的依賴：

   ```
   npm install dotenv mysql2
   ```

2. 執行腳本：
   ```
   node scripts/db-summary.js
   ```

腳本會輸出資料庫結構摘要到控制台，並將 JSON 格式的摘要保存到 `temp/db-summary.json` 檔案中。

### 腳本輸出範例

```
===== 資料庫結構摘要 =====
資料庫: pet_proj
總表格數: 31
總索引數: 42
總外鍵數: 28

===== 表格詳情 =====
表格名稱                        欄位數      索引數      外鍵數      主鍵
--------------------------------------------------------------------------------
bank_transfer_details          5          1          1          ✓
bans                           5          2          2          ✓
bookmarks                      4          2          2          ✓
...
```

## 方法四：使用 SQL 查詢

如果您熟悉 SQL，也可以直接在資料庫查詢工具中執行以下查詢獲取資料庫結構：

```sql
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = t.table_name) as column_count,
  (
    SELECT COUNT(DISTINCT index_name)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
    AND table_name = t.table_name
    AND index_name != 'PRIMARY'
  ) as index_count,
  (
    SELECT COUNT(*)
    FROM information_schema.key_column_usage
    WHERE table_schema = DATABASE()
    AND table_name = t.table_name
    AND referenced_table_name IS NOT NULL
  ) as foreign_key_count,
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = t.table_name AND index_name = 'PRIMARY') as has_primary
FROM information_schema.tables t
WHERE t.table_schema = DATABASE()
ORDER BY table_name;
```

## 最佳實踐

1. **定期更新摘要**：資料庫結構可能會隨時間變化，請在開始新對話前獲取最新的摘要。

2. **提供足夠的上下文**：除了資料庫結構外，還應告訴 AI 您希望討論的具體問題或任務。

3. **選擇合適的詳細程度**：對於簡單的問題，只提供相關表格的結構可能就足夠；對於複雜問題，應提供完整的資料庫結構。

## 故障排除

如果無法獲取資料庫結構摘要，請檢查：

1. 資料庫連接設置是否正確
2. 使用者是否有足夠權限查詢 information_schema
3. 確保資料庫服務正在運行
4. 網路連接是否正常

如需更多協助，請聯繫技術支援團隊。

# 資料庫使用指南

## 資料庫函數架構

### 1. 前台資料庫函數 (lib/db.js)

```typescript
// 基本查詢函數
const executeQuery = async (query: string, params: any[] = []) => {
  try {
    const [rows] = await pool.execute(query, params)
    return rows
  } catch (error) {
    console.error('Database error:', error)
    throw error
  }
}
```

特點：

- 簡單直接的查詢執行
- 使用 mysql2/promise 的連接池
- 基本的錯誤處理
- 適合一般前台操作

### 2. 後台資料庫函數 (app/api/admin/\_lib/db.ts)

```typescript
// 後台專用查詢函數
const query = async <T>(
  sql: string,
  params: any[] = []
): Promise<[T, Error | null]> => {
  try {
    const [results] = await adminPool.query<
      (T & RowDataPacket[]) | ResultSetHeader
    >(sql, params)
    return [results as T, null]
  } catch (error) {
    console.error('查詢錯誤:', error)
    return [[] as unknown as T, error as Error]
  }
}
```

特點：

- 使用 TypeScript 泛型支持更好的類型安全
- 專門的管理員連接池
- 更完善的錯誤處理
- 支持 RowDataPacket 和 ResultSetHeader
- 適合後台管理操作

## 使用建議

### 1. 前台查詢

適合用於：

- 一般用戶查詢
- 簡單的資料操作
- 不需要特殊權限的操作

```typescript
// 範例：獲取商品列表
const getProducts = async () => {
  const query = 'SELECT * FROM products WHERE status = ? LIMIT ?'
  return await executeQuery(query, ['active', 10])
}
```

### 2. 後台查詢

適合用於：

- 管理員操作
- 需要類型安全的查詢
- 複雜的資料操作
- 需要詳細錯誤處理的場景

```typescript
// 範例：更新商品狀態
const updateProductStatus = async (id: number, status: string) => {
  const [result, error] = await db.query<ResultSetHeader>(
    'UPDATE products SET status = ? WHERE id = ?',
    [status, id]
  )
  if (error) throw error
  return result.affectedRows > 0
}
```

## 常用查詢範例

### 1. 會員管理

#### 獲取會員列表

```typescript
const getAllMembers = async (): Promise<Member[]> => {
  const query = `
    SELECT 
      user_id,
      user_email,
      user_name,
      user_number,
      user_address,
      DATE_FORMAT(user_birthday, '%Y-%m-%d') as user_birthday,
      user_level,
      profile_picture,
      user_status
    FROM users
    ORDER BY user_id DESC
  `
  return await executeQuery<Member & RowDataPacket>(query)
}
```

#### 更新會員狀態

```typescript
const updateMemberStatus = async (
  id: number,
  status: string
): Promise<boolean> => {
  const query = 'UPDATE users SET user_status = ? WHERE user_id = ?'
  const [result] = await executeQuery<ResultSetHeader>(query, [status, id])
  return result.affectedRows > 0
}
```

### 2. 管理員認證

#### 驗證管理員

```typescript
const verifyAdmin = async (
  account: string,
  password: string
): Promise<Admin | null> => {
  const query = `
    SELECT id, manager_account, manager_password, manager_privileges 
    FROM manager 
    WHERE manager_account = ? AND is_active = 1
  `
  const admins = await executeQuery<Admin & RowDataPacket>(query, [account])
  if (!admins.length) return null

  const isValid = await verifyPassword(password, admins[0].manager_password)
  return isValid ? admins[0] : null
}
```

## 錯誤處理最佳實踐

### 1. 資料庫錯誤

```typescript
try {
  const results = await executeQuery(query, params)
  return results
} catch (error) {
  console.error('資料庫錯誤:', error)
  throw new Error('資料庫操作失敗')
}
```

### 2. 資料驗證

```typescript
const validateMember = (member: Partial<Member>): boolean => {
  if (!member.user_email?.includes('@')) return false
  if (!member.user_name?.trim()) return false
  if (member.user_status && !['正常', '禁言'].includes(member.user_status)) {
    return false
  }
  return true
}
```

## 資料庫連接管理

### 1. 管理後台連接池配置

```typescript
const adminPool = mysql.createPool({
  host: process.env.ADMIN_DB_HOST,
  user: process.env.ADMIN_DB_USERNAME,
  password: process.env.ADMIN_DB_PASSWORD,
  database: process.env.ADMIN_DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
})
```

特點：

- 使用 mysql2/promise 的連接池
- 專門用於管理後台操作
- 支援連接保活機制
- 自動重連功能
- 連接池管理優化

### 2. 錯誤監聽與處理

```typescript
adminPool.on('error', (err) => {
  console.error('資料庫連接錯誤:', err)
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('資料庫連接已關閉')
  } else if (err.code === 'ER_CON_COUNT_ERROR') {
    console.error('資料庫連接數已達上限')
  }
})
```

### 3. 連接池最佳實踐

- 使用環境變數配置
- 適當設置連接限制
- 啟用連接保活
- 實作錯誤重試機制
- 監控連接狀態

## 安全性考慮

### 1. SQL 注入防護

- 使用預處理語句
- 避免直接拼接 SQL
- 驗證輸入值

### 2. 密碼處理

- 使用 bcrypt 加密
- 處理 PHP 和 Node.js 的兼容性
- 不存儲明文密碼

### 3. 權限控制

- 檢查用戶權限
- 記錄操作日誌
- 限制敏感操作

## 效能優化

### 1. 查詢優化

- 使用適當的索引
- 避免 SELECT \*
- 限制返回結果數量

### 2. 連接池管理

- 適當的連接數
- 監控連接狀態
- 處理連接泄漏

## 常見問題解決

### 1. 時區問題

```sql
SET time_zone = '+08:00';
```

### 2. 字符編碼

```sql
SET NAMES utf8mb4;
```

### 3. 大數據處理

- 分頁查詢
- 流式處理
- 批量操作
