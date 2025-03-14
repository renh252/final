# 專案文檔指南

此目錄包含用於提高專案開發效率和 AI 對話質量的文檔。通過提供這些文檔給 AI，可以大幅減少幻覺情況，讓 AI 更準確地了解專案結構和設計細節。

## 按需求快速索引

### 尋找特定功能的文檔

| 如果您需要了解...    | 請參考這些文檔                                                                                                   |
| -------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 專案整體架構和技術棧 | [project-overview.md](./project-overview.md)                                                                     |
| 資料庫結構和關係     | [database-structure.md](./database-structure.md), [db-structure-usage.md](./db-structure-usage.md)               |
| API 路由和使用方式   | [api-structure.md](./api-structure.md)                                                                           |
| 後台管理系統         | [admin-structure.md](./admin-structure.md), [admin-implementation-plan.md](./admin-implementation-plan.md)       |
| 前端元件和 UI        | [frontend-components.md](./frontend-components.md), [datatable-best-practices.md](./datatable-best-practices.md) |
| 認證和授權機制       | [admin-structure.md](./admin-structure.md)（授權邏輯部分）, [api-structure.md](./api-structure.md)（認證部分）   |
| 目錄結構和代碼組織   | [directory-structure.md](./directory-structure.md)                                                               |
| 目前進度和未來計劃   | [current-status.md](./current-status.md)                                                                         |
| 工具函數使用指南     | [utils-guide.md](./utils-guide.md)                                                                               |

### 常見問題索引

| 問題類型               | 相關文檔                                                     |
| ---------------------- | ------------------------------------------------------------ |
| 認證問題（Token 相關） | [admin-structure.md](./admin-structure.md)（授權功能邏輯）   |
| API 請求失敗           | [api-structure.md](./api-structure.md)（錯誤處理部分）       |
| DataTable 渲染問題     | [datatable-best-practices.md](./datatable-best-practices.md) |
| 資料庫查詢問題         | [db-structure-usage.md](./db-structure-usage.md)             |
| 項目進度和已知問題     | [current-status.md](./current-status.md)                     |

## 文檔列表及功能

### 1. README.md

- 作為文檔指南的入口文件
- 說明如何在 AI 對話中使用這些文檔
- 提供文檔更新指南和最佳實踐
- 說明認證機制和避免 AI 幻覺的方法

### 2. project-overview.md

- 提供專案的整體架構和設計細節
- 詳細說明技術棧（前端、後端、部署等）
- 列出專案的主要功能模塊
- 說明資料庫設計特點和身份驗證機制
- 提供環境變量配置說明

### 3. admin-structure.md

- 描述後台管理系統的結構和功能
- 詳細說明路由結構和各個管理模塊
- 提供認證與授權的實現細節
- 說明共用元件的使用方式
- 提供 API 路由和資料庫交互的說明

### 4. admin-implementation-plan.md

- 提供後台管理系統的實施計劃
- 列出當前完成狀態和待完成功能
- 提供技術實施方案和時程規劃
- 說明測試策略和性能優化考量

### 5. api-structure.md

- 描述 API 的結構和命名規範
- 提供 API 使用方法和重要說明
- 列出前台和後台的 API 路由
- 說明錯誤處理機制

### 6. current-status.md

- 記錄專案當前的開發狀態
- 列出已完成、進行中和待開發的功能
- 記錄已知問題和解決方案
- 提供短期、中期和長期的開發計劃

### 7. datatable-best-practices.md

- 提供 DataTable 組件的最佳實踐指南
- 說明如何避免循環渲染問題
- 提供狀態管理和效能優化建議
- 列出常見問題和解決方案

### 8. db-structure-usage.md

- 提供資料庫結構的快速檢視指南
- 說明如何獲取資料庫結構資訊
- 提供常用查詢範例和錯誤處理方式
- 說明資料庫連接管理和安全性考量

### 9. directory-structure.md

- 說明專案目錄結構的用途
- 解釋主要目錄的功能和使用原則
- 提供代碼依賴和安全性原則
- 列出目錄內容和檔案說明

### 10. utils-guide.md

- 說明工具函數的使用方法
- 提供 cn（Class Name Utility）函數的使用指南
- 列出使用場景建議和重構建議
- 提供未來擴展方向

### 11. database-structure.md

- 詳細說明所有資料庫表格結構
- 提供表格間關係和外鍵說明
- 說明各欄位的資料類型和約束條件
- 包含資料庫索引和優化策略

### 12. frontend-components.md

- 說明前端組件的結構和使用方式
- 提供組件 props 和狀態管理說明
- 說明重要 UI 元件的樣式和布局設計
- 提供組件之間的交互和資料流說明

## 文檔目錄結構

```
docs/
├── README.md                   # 您正在閱讀的文檔指南
├── project-overview.md         # 專案整體架構和技術棧
├── database-structure.md       # 資料庫表格結構和關聯
├── db-structure-usage.md       # 資料庫使用指南
├── admin-structure.md          # 後台系統結構
├── admin-implementation-plan.md # 後台系統實施計劃
├── frontend-components.md      # 前端元件說明
├── api-structure.md            # API 結構和使用方法
├── current-status.md           # 當前進度和計劃
├── datatable-best-practices.md # DataTable 使用最佳實踐
├── directory-structure.md      # 專案目錄結構說明
├── utils-guide.md              # 工具函數使用指南
└── templates/                  # 模板文件目錄
```

## 如何在 AI 對話中使用這些文檔

### 方法一：在對話開始時提供文檔內容

在啟動新對話時，將相關文檔的內容複製到對話中，如：

```
我正在開發一個寵物平台專案，以下是我們專案的資料庫結構和架構設計：

[此處粘貼 database-structure.md 和/或 project-overview.md 的內容]

基於以上資訊，我想請教...
```

### 方法二：根據需要提供特定部分

如果只針對特定功能或模塊進行討論，可僅提供相關部分：

```
我正在處理專案的寵物領養模塊，以下是相關資料庫表格和API:

[僅粘貼 database-structure.md 中寵物相關表格的定義]
[僅粘貼 project-overview.md 中寵物領養模塊的描述]

我遇到的問題是...
```

### 方法三：請 AI 參考已上傳的文檔

如果您使用的 AI 平台支持上傳文件功能，可將文檔直接上傳：

```
我已上傳我們專案的資料庫結構和架構設計文檔。請參考這些文檔，幫我...
```

## 文檔更新指南

為確保文檔的有效性，請在以下情況下更新文檔：

1. 資料庫結構發生變化時
2. 添加新的功能模塊時
3. 技術棧或架構有重大調整時
4. 發現 AI 在某些專案細節上出現頻繁幻覺時

## 貢獻

歡迎團隊成員對文檔進行改進和擴充。如果發現文檔中有不準確或過時的內容，請提交更新。

## 文檔格式指南

- 使用 Markdown 格式編寫
- 資料庫結構使用 SQL 代碼塊
- 提供清晰的標題和小標題
- 使用表格組織相關信息
- 代碼示例使用適當的語法高亮

## 注意事項

- **敏感信息**: 請確保文檔中不包含任何敏感信息，如真實的資料庫密碼、API 密鑰等
- **最新性**: 定期檢查文檔以確保內容是最新的
- **完整性**: 嘗試包含 AI 可能需要了解的所有重要上下文

## 認證機制說明

### Token 管理

- 使用 JWT (JSON Web Token) 進行認證
- Token 存儲在 Cookie 中（名稱：`admin_token`）
- Token 包含以下資訊：
  - `id`: 管理員 ID
  - `account`: 管理員帳號
  - `privileges`: 權限代碼
  - `role`: 角色（預設為 'admin'）

### 權限驗證流程

1. 登入時生成 JWT，包含完整的管理員資訊
2. API 請求時需在 Header 中攜帶 Token：
   ```typescript
   headers: {
     'Authorization': `Bearer ${token}`,
     'Content-Type': 'application/json'
   }
   ```
3. 後端驗證 Token 的有效性和權限

### 常見問題與解決方案

1. 401 未授權錯誤：

   - 檢查 Cookie 中是否存在 `admin_token`
   - 確認 Token 格式是否正確
   - 驗證 Token 是否過期

2. 403 權限不足：

   - 確認管理員權限設置
   - 檢查 Token 中的 role 和 privileges

3. Token 獲取失敗：
   - 使用 `js-cookie` 庫獲取 Token：
     ```typescript
     const token = Cookies.get('admin_token')
     ```
   - 不要使用 localStorage 存儲 Token

## 避免 AI 幻覺的最佳實踐

### 資料庫結構

1. 明確定義表結構和欄位名稱
2. 保持文檔與實際資料庫結構同步
3. 記錄特殊的欄位命名規則

### API 請求

1. 明確記錄 API 的請求和響應格式
2. 標註必要的請求頭和認證要求
3. 提供完整的錯誤處理範例

### 前端組件

1. 明確定義 Props 和 State 的類型
2. 記錄組件間的資料流動
3. 提供完整的錯誤處理機制

### 認證流程

1. 清楚說明 Token 的生成和存儲方式
2. 記錄權限驗證的具體邏輯
3. 提供常見錯誤的處理方法

## 開發注意事項

1. 始終使用類型檢查（TypeScript）
2. 保持錯誤處理的一致性
3. 遵循統一的代碼風格
4. 及時更新文檔

## 測試指南

1. 提供完整的測試案例
2. 包含認證相關的測試
3. 記錄常見的測試場景

## 已知問題和限制

請參考 [當前狀態與計劃](./current-status.md) 文檔中的「已知問題」部分。

## 下一步計劃

請參考 [當前狀態與計劃](./current-status.md) 文檔中的「下一步計劃」部分。
