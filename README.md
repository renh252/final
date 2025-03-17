# Pet Project - 寵物領養與社區平台

Pet Project 是一個綜合性的寵物領養和社區平台，旨在為寵物愛好者提供一個完整的生態系統，包括寵物領養、社群討論、寵物用品購買和公益捐款等功能。

## 功能特點

- **寵物領養**: 瀏覽和搜尋可領養的寵物，提交領養申請，預約看寵物
- **社群討論區**: 創建和回覆貼文，點讚和收藏貼文，上傳圖片
- **寵物用品商城**: 商品分類和搜尋，購物車功能，結帳流程，訂單追蹤
- **捐款和公益活動**: 捐款功能，公益活動展示，資金使用透明度報告
- **會員管理系統**: 會員註冊和登入，會員資料管理，收藏和訂單管理
- **管理後台**: 寵物資訊管理，會員管理，商城管理，論壇管理，金流管理

## 技術棧

- **前端**: Next.js 14 (App Router), TypeScript, React Bootstrap
- **後端**: Next.js API Routes, TypeScript, MySQL
- **認證**: JWT (JSON Web Token)
- **部署**: 計劃部署到 Vercel 或 AWS

## 快速開始

### 前置需求

- Node.js 18.0.0 或更高版本
- MySQL 8.0 或更高版本
- npm 或 yarn

### 安裝步驟

1. 克隆專案

```bash
git clone https://github.com/renh252/final.git
cd final
```

2. 安裝依賴

```bash
npm install
# 或
yarn install
```

3. 設置環境變數

複製 `.env.example` 文件為 `.env.local`，並填入相應的配置：

```bash
cp .env.example .env.local
```

4. 設置資料庫(此處略過)

SQL 檔案存放於 final/database

5. 啟動開發伺服器

```bash
npm run dev
# 或
yarn dev
```

6. 訪問應用

打開瀏覽器，訪問 [http://localhost:3000](http://localhost:3000)

## 專案結構

```
pet_proj/
├── app/                    # Next.js App Router 結構
│   ├── api/                # API 路由
│   ├── admin/              # 管理後台頁面
│   ├── pets/               # 前台寵物頁面
│   ├── shop/               # 商店頁面
│   ├── forum/              # 論壇頁面
│   ├── member/             # 會員頁面
│   ├── donate/             # 捐款頁面
│   ├── _components/        # 共用元件
│   ├── _contexts/          # 全局狀態管理
│   ├── global.css          # 全局樣式
│   └── _lib/               # 工具函數和資料庫連接
├── public/                 # 靜態資源
├── scripts/                # 腳本工具
├── docs/                   # 文檔資料
└── ...
```

## 前台路由架構

### 會員中心路由

```
/member                         # 會員中心儀表板，提供整體概覽
├── /member/register            # 註冊
├── /member/login               # 登入
├── /member/logout              # 登出（直接用popup提示已登出，並刷新頁面）
├── /member/forget              # 忘記密碼
├── /member/profile             # 個人資料管理，提供詳細資料編輯
├── /member/orders              # 訂單詳情
├── /member/discounts           # 折扣活動總覽
└── /member/favorites           # 收藏管理
    ├── /member/favorites/pets        # 寵物收藏
    ├── /member/favorites/products    # 商品收藏
    └── /member/favorites/articles    # 文章收藏
```

### 商城路由

```
/shop                           # 商城主頁
├── /shop/cart                  # 購物車
├── /shop/checkout              # 付款資訊
│   ├── /shop/checkout/review   # 確認訂單資訊
│   └── /shop/checkout/summary  # 訂單明細
├── /shop/category              # 商品分類
│   └── /shop/category/[cid]    # 特定商品分類（動態路由）
└── /shop/[pid]                 # 特定商品頁面（動態路由）
```

### 寵物領養路由

```
/pets                           # 寵物領養主頁
├── /pets/category              # 寵物分類
│   └── /pets/category/[cid]    # 特定寵物分類（動態路由）
└── /pets/[pid]                 # 特定寵物頁面（動態路由）
    └── /pets/[pid]/appointment # 預約表單
```

### 論壇路由

```
/forum                          # 論壇主頁
├── /forum/list                 # 文章列表
├── /forum/publish              # 新建文章
├── /forum/[aid]                # 特定文章頁面（動態路由）
│   ├── /forum/[aid]?edit=true  # 編輯文章
│   └── /forum/[aid]/report     # 檢舉文章
├── /forum/category             # 文章分類管理
└── /forum/notifications        # 通知系統
```

### 捐款路由

```
/donation                       # 捐款功能介紹
└── /donation/flow              # 捐款流程
```

## 開發狀態說明

以下是當前功能的開發狀態：

### 核心功能

- **寵物領養系統**: ✅ 基本功能已完成
- **社群討論區**: ✅ 基本功能已完成
- **寵物用品商城**: ✅ 基本功能已完成
- **會員管理系統**: ✅ 基本功能已完成
- **管理後台**: ✅ 基本功能已完成

### 支付系統

- **綠界金流 (ECPay)**: 🔄 正在由協作人員開發中
- **LINE Pay**: 📝 待開發項目

### 捐款系統

- **基本捐款流程**: ✅ 已完成
- **捐款活動管理**: ❌ 不在當前開發範圍內
- **捐款報表**: ✅ 已完成

### 注意事項

- 文檔中可能存在與實際實現不符的描述，正在持續更新中
- 優先開發必要的核心功能，其他功能將按照優先級陸續實現

## 文檔

詳細的文檔可以在 `docs` 目錄中找到：

- [專案概述](./docs/project-overview.md)
- [資料庫結構](./docs/database-structure.md)
- [後台管理系統結構](./docs/admin-structure.md)
- [前端元件結構](./docs/frontend-components.md)
- [API 結構](./docs/api-structure.md)
- [當前狀態與計劃](./docs/current-status.md)

## 開發指南

### 分支管理

- `main`: 主分支，用於生產環境
- `develop`: 開發分支，用於開發環境
- `feature/*`: 功能分支，用於開發新功能
- `bugfix/*`: 修復分支，用於修復 bug

### 提交規範

提交信息應遵循以下格式：

```
<type>(<scope>): <subject>

<body>

<footer>
```

類型（type）可以是：

- `feat`: 新功能
- `fix`: 修復 bug
- `docs`: 文檔更新
- `style`: 代碼風格變更（不影響功能）
- `refactor`: 代碼重構
- `perf`: 性能優化
- `test`: 測試相關
- `chore`: 構建過程或輔助工具的變動

### 代碼風格

- 使用 ESLint 和 Prettier 進行代碼格式化
- 遵循 TypeScript 的類型檢查
- 使用 CSS Modules 和 Bootstrap 進行樣式管理

## 測試

### 運行測試

```bash
npm run test
# 或
yarn test
```

### 測試覆蓋率

```bash
npm run test:coverage
# 或
yarn test:coverage
```

## 部署

### 生產環境構建

```bash
npm run build
# 或
yarn build
```

### 啟動生產伺服器

```bash
npm run start
# 或
yarn start
```

## 聯繫我們

如有任何問題或建議，請聯繫我們：
