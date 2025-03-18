# 毛孩之家 - 寵物領養與社區平台

毛孩之家是一個綜合性的寵物領養和社區平台，為寵物愛好者提供一個完整的生態系統，包括寵物領養、社群討論、寵物用品購買和公益捐款等功能。

## 功能特點

- **寵物領養**: 瀏覽和搜尋可領養的寵物，提交領養申請，預約看寵物
- **社群討論區**: 創建和回覆貼文，點讚和收藏貼文，上傳圖片
- **寵物用品商城**: 商品分類和搜尋，購物車功能，結帳流程，訂單追蹤
- **捐款和公益活動**: 捐款功能，公益活動展示，資金使用透明度報告
- **會員管理系統**: 會員註冊和登入，會員資料管理，收藏和訂單管理
- **管理後台**: 寵物資訊管理，會員管理，商城管理，論壇管理，金流管理

## 技術棧

- **前端**: Next.js 14 (App Router), TypeScript, React Bootstrap, CSS Modules
- **後端**: Next.js API Routes, TypeScript
- **資料庫**: MySQL (mysql2)
- **認證**: JWT (JSON Web Token), next-auth
- **其他關鍵庫**: js-cookie, axios, react-hook-form, sharp, lucide-react

## 開發狀態

### 核心功能

- **寵物領養系統**: ✅ 基本功能已完成
- **社群討論區**: ✅ 基本功能已完成
- **寵物用品商城**: ✅ 基本功能已完成
- **會員管理系統**: ✅ 基本功能已完成
- **後台管理系統**: ✅ 基本功能已完成

### 支付系統

- **綠界金流 (ECPay)**: 🔄 開發中
- **LINE Pay**: 📝 待開發

### 捐款系統

- **基本捐款流程**: ✅ 已完成
- **捐款活動管理**: ❌ 不在當前開發範圍內
- **捐款報表**: ✅ 已完成

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

4. 設置資料庫

SQL 檔案存放於 `final/database` 目錄

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

## 文檔架構

為便於理解專案並提高開發效率，我們優化了文檔結構：

### 核心文檔

- **[docs/pet-project-guide.md](./docs/pet-project-guide.md)** - 包含所有關鍵資訊的綜合指南文檔

### 專業領域文檔（按需參考）

- **[docs/database-structure.md](./docs/database-structure.md)** - 詳細資料庫結構
- **[docs/api-structure.md](./docs/api-structure.md)** - API 設計與實現細節
- **[docs/admin-structure.md](./docs/admin-structure.md)** - 後台管理系統架構
- **[docs/frontend-components.md](./docs/frontend-components.md)** - 前端組件設計
- **[docs/auth-implementation-guide.md](./docs/auth-implementation-guide.md)** - 身份驗證實現細節
- **[docs/db-structure-usage.md](./docs/db-structure-usage.md)** - 資料庫使用指南

## 開發規範

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

