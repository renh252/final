# Pet Project - 專案架構和設計細節

本文檔提供專案的整體架構和關鍵設計細節，方便開發過程中參考，也可在與 AI 對話時提供，以確保更準確的回覆和建議。

## 專案概述

Pet Project 是一個綜合性的寵物領養和社區平台，包含以下主要功能：

1. 寵物領養資訊展示和篩選
2. 社群討論區（論壇）
3. 寵物用品電子商務功能
4. 捐款和公益活動
5. 會員管理系統
6. 管理後台

## 技術棧

### 前端

- **框架**: Next.js 14 (App Router)
- **語言**: TypeScript、JavaScript
- **樣式**: React-Bootstrap、CSS Modules
- **狀態管理**: React Context API、React Query
- **路由**: Next.js App Router
- **其他庫**:
  - js-cookie: 處理 Cookie
  - axios: API 請求
  - react-hook-form: 表單處理
  - next-auth: 身份驗證
  - sharp: 圖片處理

### 後端

- **框架**: Next.js API Routes
- **語言**: TypeScript、JavaScript
- **數據庫**: MySQL (使用 mysql2 連接)
- **API 類型**: RESTful API
- **身份驗證**: JWT (jsonwebtoken)
- **文件存儲**: 本地文件系統 (計劃遷移到雲存儲)
- **其他庫**:
  - bcrypt: 密碼加密
  - multer: 文件上傳處理

### 部署

- **環境**: 開發、測試、生產
- **伺服器**: 計劃部署到 Vercel 或 AWS
- **CI/CD**: 準備導入 GitHub Actions

## 專案結構

```
pet_proj/
├── app/                    # Next.js App Router 結構
│   ├── api/                # API 路由
│   │   ├── admin/          # 管理後台 API
│   │   ├── auth/           # 身份驗證 API
│   │   ├── pets/           # 寵物相關 API
│   │   ├── shop/           # 商店相關 API
│   │   └── users/          # 用戶相關 API
│   ├── admin/              # 管理後台頁面
│   │   ├── _components/    # 管理後台專用元件
│   │   ├── pets/           # 寵物管理頁面
│   │   ├── members/        # 會員管理頁面
│   │   ├── orders/         # 訂單管理頁面
│   │   ├── forum/          # 論壇管理頁面
│   │   └── ...
│   ├── pets/               # 前台寵物頁面
│   ├── shop/               # 商店頁面
│   ├── forum/              # 論壇頁面
│   ├── member/             # 會員頁面
│   ├── donate/             # 捐款頁面
│   ├── _components/        # 共用元件
│   ├── lib/                # 工具函數和資料庫連接
│   └── ...
├── public/                 # 靜態資源
│   ├── images/             # 圖片資源
│   └── ...
├── scripts/                # 腳本工具
├── docs/                   # 文檔資料
└── ...
```

## 主要功能模塊

### 1. 寵物領養模塊

**主要功能**:

- 瀏覽和搜尋可領養的寵物
- 寵物詳細資訊頁面
- 收藏感興趣的寵物
- 提交領養申請
- 寵物篩選功能 (種類、品種、年齡等)

**相關表格**:

- pets
- pet_store
- pet_trait
- pet_trait_list
- pets_like
- pet_appointment

**相關 API 端點**:

- `GET /api/pets`: 獲取寵物列表
- `GET /api/pets/{id}`: 獲取單一寵物詳細資訊
- `POST /api/pets/like`: 收藏寵物
- `POST /api/pets/appointment`: 預約看寵物

### 2. 社群討論區模塊

**主要功能**:

- 討論區分類
- 創建和回覆貼文
- 點讚和收藏貼文
- 上傳圖片
- 熱門貼文推薦

**相關表格**:

- posts
- comments
- posts_likes
- categories
- bookmarks

**相關 API 端點**:

- `GET /api/forum/posts`: 獲取貼文列表
- `GET /api/forum/posts/{id}`: 獲取貼文詳情
- `POST /api/forum/posts`: 創建新貼文
- `POST /api/forum/comments`: 添加評論
- `POST /api/forum/posts/like`: 點讚貼文

### 3. 寵物用品商城模塊

**主要功能**:

- 商品分類和搜尋
- 商品詳情頁
- 購物車功能
- 結帳流程
- 訂單追蹤
- 商品評價

**相關表格**:

- products
- product_variants
- product_reviews
- orders
- order_items
- promotions

**相關 API 端點**:

- `GET /api/shop/products`: 獲取商品列表
- `GET /api/shop/products/{id}`: 獲取商品詳情
- `POST /api/shop/cart`: 更新購物車
- `POST /api/shop/orders`: 創建訂單
- `POST /api/shop/reviews`: 提交商品評價

### 4. 捐款和公益模塊

**主要功能**:

- 捐款功能
- 公益活動展示
- 資金使用透明度報告
- 捐款者排行榜

**相關表格**:

- donations
- bank_transfer_details
- expenses

**相關 API 端點**:

- `GET /api/donate/campaigns`: 獲取捐款活動
- `POST /api/donate/donations`: 提交捐款
- `GET /api/donate/transactions`: 獲取資金使用記錄

### 5. 會員系統模塊

**主要功能**:

- 會員註冊和登入
- 會員資料管理
- 我的收藏
- 我的訂單
- 我的捐款記錄
- 我的貼文和評論

**相關表格**:

- users
- user_sessions
- follows

**相關 API 端點**:

- `POST /api/auth/login`: 會員登入
- `POST /api/auth/register`: 會員註冊
- `GET /api/users/profile`: 獲取會員資料
- `PUT /api/users/profile`: 更新會員資料
- `GET /api/users/orders`: 獲取會員訂單

### 6. 管理後台模塊

**主要功能**:

- 寵物資訊管理
- 會員管理
- 訂單管理
- 貼文和評論管理
- 商品管理
- 捐款和支出管理
- 數據統計和報表

**相關表格**:

- manager
- bans
- reports

**相關 API 端點**:

- `POST /api/admin/auth/login`: 管理員登入
- `GET /api/admin/dashboard`: 獲取儀表板數據
- `GET /api/admin/members`: 獲取會員列表
- `PUT /api/admin/pets/{id}`: 更新寵物資訊
- `DELETE /api/admin/posts/{id}`: 刪除貼文

## 資料庫設計特點

- 使用外鍵確保資料完整性
- 使用 JSON 類型存儲複雜數據 (如 preferences, images)
- 所有表格包含 created_at 和 updated_at 時間戳
- 使用 enum 類型限制特定欄位的值範圍
- 大多數刪除操作使用軟刪除標記而非實際刪除

## 身份驗證和授權

1. **前台用戶**:

   - 使用 JWT + Cookies 進行身份驗證
   - Token 有效期為 7 天
   - 支持記住我功能

2. **管理後台**:
   - 獨立的登入系統
   - 更短的 Token 有效期 (24 小時)
   - 基於角色的權限控制 (admin, editor, viewer)

## API 設計原則

1. **RESTful 設計**:

   - 使用適當的 HTTP 方法 (GET, POST, PUT, DELETE)
   - 資源路徑遵循 RESTful 慣例

2. **返回格式**:

   ```json
   {
     "success": true|false,
     "data": {...} | null,
     "message": "操作成功/失敗信息",
     "error": null | "錯誤詳情"
   }
   ```

3. **錯誤處理**:

   - 使用適當的 HTTP 狀態碼
   - 返回詳細的錯誤信息
   - 記錄錯誤到日誌

4. **分頁**:
   - 支持基於頁碼的分頁 (page, pageSize)
   - 返回總記錄數和總頁數
   - 默認每頁 10 條記錄

## 前端元件結構

1. **通用元件**:

   - Layout 元件 (Header, Footer, Sidebar)
   - Form 元件 (Input, Button, Checkbox)
   - UI 元件 (Card, Alert, Modal)
   - 分頁元件
   - 加載指示器

2. **業務元件**:
   - PetCard: 寵物卡片展示
   - FilterPanel: 篩選面板
   - CommentList: 評論列表
   - ProductGrid: 商品網格
   - OrderSummary: 訂單摘要

## 文件和圖片處理

1. **圖片處理**:

   - 使用 sharp 進行圖片處理
   - 生成多種尺寸 (原始、中、小、縮略圖)
   - 保存 WEBP 和原始格式

2. **文件存儲**:
   - 當前: 本地文件系統
   - 計劃: 遷移到雲存儲 (S3 或類似服務)

## 性能優化

1. **前端優化**:

   - 圖片懶加載
   - 元件代碼分割
   - 使用 Next.js 的 ISR 和 SSG 功能
   - 實現客戶端狀態緩存

2. **後端優化**:
   - 數據庫查詢優化
   - 實現適當的索引
   - API 返回數據的最小化

## 已知問題和限制

1. 圖片上傳功能在某些瀏覽器上可能不穩定
2. 移動端響應式設計需要進一步優化
3. 同時支持許多並發用戶可能需要額外的伺服器資源
4. MySQL 連接池配置需要根據實際負載調整

## 未來計劃

1. 添加電子郵件通知功能
2. 實現消息推送系統
3. 添加更多支付方式
4. 增加數據分析功能
5. 優化移動端體驗
6. 實現多語言支持

## 環境變量

關鍵環境變量：

```
# 資料庫
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=pet_proj

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# 管理員 JWT
ADMIN_JWT_SECRET=your_admin_jwt_secret
ADMIN_JWT_EXPIRES_IN=24h

# 應用
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```
