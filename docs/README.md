# 寵物領養平台文檔

> 重要提示：所有 API 和後台系統的改动都必須參考 [API 簡化方案](admin-api-simplification.md) 中的指導原則，以確保系統的一致性和穩定性。

## 🔥 快速 AI 開發指南（立即可用）

### 💡 如何使用本文檔

1. **AI 開發助手**：AI 會閱讀本文檔以理解專案架構和開發規範
2. **開發人員工具**：使用下方模板直接與 AI 溝通，減少溝通成本
3. **文檔索引**：使用[按需求快速索引](#按需求快速索引)查找特定功能文檔
4. **開發規範**：遵循[開發流程規範](#開發流程規範)確保程式碼質量

### ⚠️ 文檔規範警告

所有開發活動必須嚴格遵循各文檔中的規範和限制：

1. **權限系統**：禁止修改超級管理員「111」權限格式和檢查邏輯（見[權限系統文檔](admin-permission-system.md)）
2. **API 實現**：禁止直接在 API 路由中編寫 SQL 語句或繞過權限驗證（見[API 結構文檔](api-structure.md)）
3. **資料庫操作**：必須使用參數化查詢和事務管理（見[資料庫結構文檔](database-structure.md)）
4. **目錄結構**：必須遵循分層架構，避免跨層級依賴（見[目錄結構文檔](directory-structure.md)）
5. **UI 開發**：保持組件接口和樣式一致性，避免內聯樣式（見[前端組件文檔](frontend-components.md)）

> 📢 **注意**: AI 在實作功能前必須閱讀並遵循相關文檔中的開發規範警告和限制條件，避免破壞現有功能。

### AI 指令模板

複製以下模板與 AI 溝通，立即降低溝通成本：

#### 新功能開發模板

```
任務：開發[功能名稱]
請先閱讀：docs/[相關文檔].md 中的[章節]
實施要求：
1. 僅修改[指定檔案]
2. 遵循[設計模式/規範]
3. 確保不影響[現有功能]
4. 實現方案必須與[文檔描述]一致
驗證方法：[如何驗證功能正常]
```

#### 功能修復模板

```
問題：[簡述問題]
相關檔案：[檔案路徑]
請先閱讀：docs/[相關文檔].md
修復要求：
1. 精確定位問題根源
2. 提出最小範圍修改
3. 不改變現有架構
4. 說明如何驗證修復成功
```

#### UI 組件修改模板

```
組件：[組件名稱]
文件位置：[文件路徑]
請閱讀：docs/frontend-components.md
修改要求：
1. 保持現有props接口不變
2. 維持目前的主題支持
3. 不影響性能
4. 提供修改前後的對比說明
```

### 開發流程規範

每次開發必須遵循的標準流程：

#### 標準四步驟流程

1. **理解階段**：AI 必須先讀取相關文檔，確認理解現有架構
2. **設計階段**：提出設計方案，包括修改範圍和實現方式
3. **實施階段**：按小步驟實施，每一步都需包含驗證方法
4. **驗證階段**：提供完整的測試步驟

### 文檔優先順序表

開發不同功能時的文檔參考優先順序：

| 開發領域   | 第一優先參考                  | 第二優先參考                    | 第三優先參考                   |
| ---------- | ----------------------------- | ------------------------------- | ------------------------------ |
| 權限系統   | 🔴 admin-permission-system.md | 🟠 admin-structure.md           | 🟡 api-structure.md            |
| 側邊欄組件 | 🔴 admin-permission-system.md | 🟠 frontend-components.md       | 🟡 admin-structure.md          |
| 資料庫查詢 | 🔴 database-structure.md      | 🟠 db-structure-usage.md        | 🟡 api-structure.md            |
| 前端 UI    | 🔴 frontend-components.md     | 🟠 project-overview.md          | 🟡 utils-guide.md              |
| API 開發   | 🔴 api-structure.md           | 🟠 database-structure.md        | 🟡 admin-api-simplification.md |
| 後台功能   | 🔴 admin-structure.md         | 🟠 admin-implementation-plan.md | 🟡 admin-permission-system.md  |

### 功能邊界圖（修改前必看）

為避免過度修改，請遵循以下功能邊界：

```
權限系統關係圖
┌────────────────────┐         ┌───────────────────┐
│  permissions.ts    │ ◄────── │    Sidebar.tsx    │
└───────┬────────────┘         └─────────┬─────────┘
        │                                │
        │         ┌───────────────────┐  │
        └────────►│   AdminContext.tsx │◄─┘
                  └────────┬──────────┘
                           │
                  ┌────────▼──────────┐
                  │  verify/route.ts  │
                  └───────────────────┘
```

修改任一組件時，必須考慮對相連組件的影響。

### 成功標準檢查清單

#### 權限系統修改檢查清單

- [ ] 是否保留超級管理員「111」權限格式支持？
- [ ] 是否維持與現有權限緩存機制兼容？
- [ ] 修改是否僅限於明確指定的檔案範圍？
- [ ] 是否提供了詳細的用戶驗證方法？
- [ ] 是否確保了向後兼容性？

#### 側邊欄組件修改檢查清單

- [ ] 是否保留了現有的主題支持？
- [ ] 是否維持與權限系統的正確整合？
- [ ] 修改是否僅影響 UI 而不影響權限邏輯？
- [ ] 是否兼容不同權限格式？

---

## 當前開發狀態

> ⚠️ **重要提示**：此部分用於標註目前系統中各功能的實際開發狀態，以避免文檔與實際實現之間的差異。

### 核心功能開發狀態

| 功能領域     | 狀態               | 說明                       |
| ------------ | ----------------- | -------------------------- |
| 寵物領養系統 | ✅ 基本功能已完成   | 包含寵物列表、詳情和領養流程 |
| 社群討論區   | ✅ 基本功能已完成   | 帖子發布、回覆、點讚等功能   |
| 寵物用品商城 | ✅ 基本功能已完成   | 商品管理、購物車、訂單系統   |
| 會員管理系統 | ✅ 基本功能已完成   | 註冊、登入、個人資料管理     |
| 後台管理系統 | ✅ 基本功能已完成   | 包含權限控制、數據管理功能   |

### 支付系統開發狀態

| 功能             | 狀態      | 說明                                 |
| ---------------- | --------- | ------------------------------------ |
| 綠界金流 (ECPay) | 🔄 開發中 | 正在由協作人員開發中，基礎結構已建立 |
| LINE Pay         | 📝 待開發 | 計劃中但尚未開始開發                 |

### 捐款系統開發狀態

| 功能         | 狀態          | 說明                           |
| ------------ | ------------- | ------------------------------ |
| 基本捐款流程 | ✅ 已完成     | 一次性捐款和定期捐款功能       |
| 捐款活動管理 | ❌ 不在計劃內 | 文檔中提及但不在當前開發範圍內 |
| 捐款報表     | ✅ 已完成     | 後台捐款數據統計和報表         |

### 文檔狀態說明

- 部分文檔可能包含計劃功能但未實際實現
- 標記為「開發中」和「待開發」的功能在文檔中有描述但實際代碼尚未完全實現
- 如發現文檔與實際功能不符，請以此狀態表為準

---

## 按需求快速索引

### 尋找特定功能的文檔

| 如果您需要了解...    | 請參考這些文檔                                                                                                                                                             |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 專案整體架構和技術棧 | [project-overview.md](./project-overview.md)                                                                                                                               |
| 資料庫結構和關係     | [database-structure.md](./database-structure.md), [db-structure-usage.md](./db-structure-usage.md)                                                                         |
| API 路由和使用方式   | [api-structure.md](./api-structure.md)                                                                                                                                     |
| 後台管理系統         | [admin-structure.md](./admin-structure.md), [admin-implementation-plan.md](./admin-implementation-plan.md)                                                                 |
| 前端元件和 UI        | [frontend-components.md](./frontend-components.md), [datatable-best-practices.md](./datatable-best-practices.md)                                                           |
| 認證和授權機制       | [admin-structure.md](./admin-structure.md)（授權邏輯部分）, [api-structure.md](./api-structure.md)（認證部分）, [admin-permission-system.md](./admin-permission-system.md) |
| 權限系統和側邊欄顯示 | [admin-permission-system.md](./admin-permission-system.md)                                                                                                                 |
| 目錄結構和代碼組織   | [directory-structure.md](./directory-structure.md)                                                                                                                         |
| 目前進度和未來計劃   | [current-status.md](./current-status.md)                                                                                                                                   |
| 工具函數使用指南     | [utils-guide.md](./utils-guide.md)                                                                                                                                         |

### 常見問題索引

| 問題類型               | 相關文檔                                                     |
| ---------------------- | ------------------------------------------------------------ |
| 認證問題（Token 相關） | [admin-structure.md](./admin-structure.md)（授權功能邏輯）   |
| 權限問題和側邊欄顯示   | [admin-permission-system.md](./admin-permission-system.md)   |
| API 請求失敗           | [api-structure.md](./api-structure.md)（錯誤處理部分）       |
| DataTable 渲染問題     | [datatable-best-practices.md](./datatable-best-practices.md) |
| 資料庫查詢問題         | [db-structure-usage.md](./db-structure-usage.md)             |
| 項目進度和已知問題     | [current-status.md](./current-status.md)                     |

## 文檔目錄概覽

```
docs/
├── README.md                     # 您正在閱讀的文檔指南
├── project-overview.md           # 專案整體架構和技術棧
├── database-structure.md         # 資料庫表格結構和關聯
├── db-structure-usage.md         # 資料庫使用指南
├── admin-structure.md            # 後台系統結構
├── admin-permission-system.md    # 後台權限系統和側邊欄
├── admin-implementation-plan.md  # 後台系統實施計劃
├── frontend-components.md        # 前端元件說明
├── api-structure.md              # API 結構和使用方法
├── current-status.md             # 當前進度和計劃
├── datatable-best-practices.md   # DataTable 使用最佳實踐
├── directory-structure.md        # 專案目錄結構說明
├── utils-guide.md                # 工具函數使用指南
└── templates/                    # 模板文件目錄
```

## 附錄：高效使用文檔

### 如何在 AI 對話中引用文檔

```
請閱讀 docs/[文檔名稱].md 中的[章節名稱]部分，
基於文檔的描述幫我[實現/修復/優化]以下功能...
```

### 文檔維護守則

1. **保持最新**：確保文檔與實際代碼保持同步
2. **避免敏感信息**：不要在文檔中包含密碼、密鑰等敏感信息
3. **清晰格式**：使用標準 Markdown 格式，保持結構清晰

### 認證機制簡要說明

- 使用 JWT 認證存儲在 Cookie 中（名稱：`admin_token`）
- 權限驗證流程詳見 [admin-permission-system.md](./admin-permission-system.md)
- 常見認證問題排查方法詳見 [admin-structure.md](./admin-structure.md)

---

詳細文檔內容請參考對應的專門文件。本 README 僅作為索引和快速指南使用。
