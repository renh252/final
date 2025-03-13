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
- **樣式**: React-Bootstrap、Tailwind CSS(待修正:目前已棄用，因為會和 bootstrap 衝突)、CSS Modules
- **狀態管理**: React Context API、React Query
- **路由**: Next.js App Router
- **其他庫**:
  - js-cookie: 處理 Cookie
  - axios: API 請求
  - react-hook-form: 表單處理
  - next-auth: 身份驗證
  - sharp: 圖片處理
  - lucide-react: 圖標庫
  - xlsx: Excel 文件處理
  - papaparse: CSV 文件處理

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
  - formidable: 表單處理
  - sharp: 圖片處理

### 部署

- **環境**: 開發、測試、生產
- **伺服器**: 計劃部署到 Vercel 或 AWS
- **CI/CD**: 準備導入 GitHub Actions

## 專案結構

```
pet_proj/
├── app/                    # Next.js App Router 結構
│   ├── api/                # API 路由
│   │   ├── admin/          # 後台 API
│   │   │   ├── auth/       # 認證 API
│   │   │   ├── members/    # 會員管理 API
│   │   │   ├── pets/       # 寵物管理 API
│   │   │   ├── shop/       # 商城管理 API
│   │   │   ├── forum/      # 論壇管理 API
│   │   │   ├── finance/    # 金流管理 API
│   │   │   ├── settings/   # 系統設定 API
│   │   │   └── _lib/       # 後台 API 共用函數
│   │   ├── auth/           # 前台認證 API
│   │   ├── members/        # 會員 API
│   │   ├── pets/           # 寵物 API
│   │   ├── shop/           # 商城 API
│   │   ├── forum/          # 論壇 API
│   │   ├── donations/      # 捐款 API
│   │   ├── payments/       # 支付 API
│   │   └── _lib/           # API 共用函數
│   ├── admin/              # 管理後台頁面
│   │   ├── _components/    # 後台共用元件
│   │   ├── pets/           # 寵物管理頁面
│   │   ├── members/        # 會員管理頁面
│   │   ├── shop/           # 商店管理頁面
│   │   │   ├── products/   # 商品管理頁面
│   │   │   ├── orders/     # 訂單管理頁面
│   │   │   ├── categories/ # 商品分類管理頁面
│   │   │   └── coupons/    # 優惠券管理頁面
│   │   ├── forum/          # 論壇管理頁面
│   │   ├── finance/        # 金流管理頁面
│   │   └── settings/       # 系統設定頁面
│   ├── pets/               # 前台寵物頁面
│   ├── shop/               # 商店頁面
│   ├── forum/              # 論壇頁面
│   ├── member/             # 會員頁面
│   ├── donate/             # 捐款頁面
│   ├── _components/        # 共用元件
│   ├── _contexts/          # 全局狀態管理
│   ├── global.css          # 全局樣式
│   ├── _lib/               # 工具函數和資料庫連接
│   └── ...
├── public/                 # 靜態資源
│   ├── images/             # 圖片資源
│   ├── uploads/            # 上傳文件
│   └── ...
├── scripts/                # 腳本工具
├── docs/                   # 文檔資料
│   ├── project-overview.md # 專案概述
│   ├── database-structure.md # 資料庫結構
│   ├── admin-structure.md  # 後台管理系統結構
│   ├── frontend-components.md # 前端元件結構
│   ├── api-structure.md    # API 結構
│   └── ...
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
- 預約看寵物
- 寵物資料導入/導出

**相關表格**:

- pets
- pet_categories
- pet_images
- pet_traits
- pet_likes
- pet_appointments
- pet_adoptions

**相關 API 端點**:

- `GET /api/pets`: 獲取寵物列表
- `GET /api/pets/{id}`: 獲取單一寵物詳細資訊
- `POST /api/pets/like`: 收藏寵物
- `POST /api/pets/appointment`: 預約看寵物
- `POST /api/pets/adoption`: 申請領養

### 2. 社群討論區模塊

**主要功能**:

- 討論區分類
- 創建和回覆貼文
- 點讚和收藏貼文
- 上傳圖片
- 熱門貼文推薦
- 文章檢舉功能

**相關表格**:

- forum_articles
- forum_comments
- forum_likes
- forum_categories
- forum_bookmarks
- forum_reports

**相關 API 端點**:

- `GET /api/forum/articles`: 獲取文章列表
- `GET /api/forum/articles/{id}`: 獲取文章詳情
- `POST /api/forum/articles`: 創建新文章
- `POST /api/forum/comments`: 添加評論
- `POST /api/forum/articles/like`: 點讚文章
- `POST /api/forum/reports`: 檢舉文章或評論

### 3. 寵物用品商城模塊

**主要功能**:

- 商品分類和搜尋
- 商品詳情頁
- 購物車功能
- 結帳流程
- 訂單追蹤
- 商品評價
- 優惠券功能
- 商品資料導入/導出

**相關表格**:

- shop_products
- shop_product_images
- shop_product_variants
- shop_product_reviews
- shop_categories
- shop_orders
- shop_order_items
- shop_coupons
- shop_cart_items

**相關 API 端點**:

- `GET /api/shop/products`: 獲取商品列表
- `GET /api/shop/products/{id}`: 獲取商品詳情
- `POST /api/shop/cart`: 更新購物車
- `POST /api/shop/orders`: 創建訂單
- `POST /api/shop/reviews`: 提交商品評價
- `GET /api/shop/coupons`: 獲取優惠券列表
- `POST /api/shop/coupons/validate`: 驗證優惠券

### 4. 捐款和公益模塊

**主要功能**:

- 捐款功能
- 公益活動展示
- 資金使用透明度報告
- 捐款者排行榜

**相關表格**:

- donation_campaigns
- donations
- donation_expenses
- donation_rankings

**相關 API 端點**:

- `GET /api/donations/campaigns`: 獲取捐款活動
- `POST /api/donations`: 提交捐款
- `GET /api/donations/expenses`: 獲取資金使用記錄
- `GET /api/donations/rankings`: 獲取捐款者排行榜

### 5. 會員系統模塊

**主要功能**:

- 會員註冊和登入
- 會員資料管理
- 我的收藏
- 我的訂單
- 我的捐款記錄
- 我的貼文和評論
- 會員資料導入/導出

**相關表格**:

- members
- member_sessions
- member_follows
- member_notifications
- member_messages

**相關 API 端點**:

- `POST /api/auth/login`: 會員登入
- `POST /api/auth/register`: 會員註冊
- `GET /api/members/profile`: 獲取會員資料
- `PUT /api/members/profile`: 更新會員資料
- `GET /api/members/orders`: 獲取會員訂單
- `GET /api/members/donations`: 獲取會員捐款記錄
- `GET /api/members/notifications`: 獲取會員通知

### 6. 管理後台模塊

**主要功能**:

- 寵物資訊管理
- 會員管理
- 商城管理（商品、訂單、分類、優惠券）
- 論壇管理（文章、評論、分類、檢舉）
- 金流管理（交易紀錄、支付方式、退款、報表）
- 系統設定（角色權限、系統參數、系統日誌）
- 數據統計和報表
- 批量操作功能
- 資料導入/導出功能

**相關表格**:

- admins
- admin_roles
- admin_permissions
- admin_logs
- system_settings

**相關 API 端點**:

- `POST /api/admin/auth/login`: 管理員登入
- `GET /api/admin/dashboard`: 獲取儀表板數據
- `GET /api/admin/members`: 獲取會員列表
- `PUT /api/admin/pets/{id}`: 更新寵物資訊
- `DELETE /api/admin/forum/articles/{id}`: 刪除文章
- `GET /api/admin/shop/orders`: 獲取訂單列表
- `GET /api/admin/finance/reports/revenue`: 獲取營收報表

## 資料庫設計特點

- 使用外鍵確保資料完整性
- 使用 JSON 類型存儲複雜數據 (如 preferences, images)
- 所有表格包含 created_at 和 updated_at 時間戳
- 使用 enum 類型限制特定欄位的值範圍
- 大多數刪除操作使用軟刪除標記而非實際刪除
- 詳細的資料庫結構請參考 `docs/database-structure.md`

## 身份驗證和授權

1. **前台用戶**:

   - 使用 JWT + Cookies 進行身份驗證
   - Token 有效期為 7 天
   - 支持記住我功能
   - 支持社群登入（Google、Facebook、LINE）

2. **管理後台**:
   - 獨立的登入系統
   - 更短的 Token 有效期 (24 小時)
   - 基於角色的權限控制 (admin, editor, viewer)
   - 詳細的操作日誌記錄

## API 設計原則

1. **RESTful 設計**:

   - 使用適當的 HTTP 方法 (GET, POST, PUT, DELETE)
   - 資源路徑遵循 RESTful 慣例
   - 詳細的 API 結構請參考 `docs/api-structure.md`

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
   - 詳細的前端元件結構請參考 `docs/frontend-components.md`

2. **業務元件**:
   - PetCard: 寵物卡片展示
   - FilterPanel: 篩選面板
   - CommentList: 評論列表
   - ProductGrid: 商品網格
   - OrderSummary: 訂單摘要
   - DataTable: 數據表格
   - ModalForm: 模態表單

## 後台管理系統結構

1. **管理區首頁**:

   - 儀表板
   - 關鍵統計數據
   - 快速入口

2. **主要模塊**:
   - 會員管理
   - 商城管理（商品、訂單、分類、優惠券）
   - 寵物管理
   - 論壇管理
   - 金流管理
   - 系統設定
   - 詳細的後台管理系統結構請參考 `docs/admin-structure.md`

## 文件和圖片處理

1. **圖片處理**:

   - 使用 sharp 進行圖片處理
   - 生成多種尺寸 (原始、中、小、縮略圖)
   - 保存 WEBP 和原始格式

2. **文件存儲**:

   - 當前: 本地文件系統
   - 計劃: 遷移到雲存儲 (S3 或類似服務)

3. **文件上傳**:
   - 支持拖放上傳
   - 支持多文件上傳
   - 支持文件類型和大小限制
   - 支持圖片預覽

## 數據導入/導出功能

1. **支持格式**:

   - CSV
   - Excel (XLSX)
   - JSON

2. **導入功能**:

   - 文件上傳
   - 數據驗證
   - 錯誤處理
   - 導入結果報告

3. **導出功能**:
   - 選擇導出格式
   - 選擇導出字段
   - 支持篩選條件
   - 支持排序

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
   - 使用連接池管理數據庫連接

## 已知問題和限制

1. 圖片上傳功能在某些瀏覽器上可能不穩定
2. 移動端響應式設計需要進一步優化
3. 同時支持許多並發用戶可能需要額外的伺服器資源
4. MySQL 連接池配置需要根據實際負載調整
5. 部分後台功能仍在使用模擬數據，需要連接真實 API

## 未來計劃

1. 添加電子郵件通知功能
2. 實現消息推送系統
3. 添加更多支付方式
4. 增加數據分析功能
5. 優化移動端體驗
6. 實現多語言支持
7. 完成所有後台功能的真實 API 連接
8. 添加更多批量操作功能
9. 優化資料導入/導出功能
10. 實現更完善的權限控制系統

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

# 第三方 API
ECPAY_MERCHANT_ID=your_ecpay_merchant_id
ECPAY_HASH_KEY=your_ecpay_hash_key
ECPAY_HASH_IV=your_ecpay_hash_iv

LINEPAY_CHANNEL_ID=your_linepay_channel_id
LINEPAY_CHANNEL_SECRET=your_linepay_channel_secret

NEWEBPAY_MERCHANT_ID=your_newebpay_merchant_id
NEWEBPAY_HASH_KEY=your_newebpay_hash_key
NEWEBPAY_HASH_IV=your_newebpay_hash_iv

# 社群登入
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

LINE_CLIENT_ID=your_line_client_id
LINE_CLIENT_SECRET=your_line_client_secret
```
