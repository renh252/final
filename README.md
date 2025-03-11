以下是前台的架構及提供的功能：

## 前台架構及功能

### 1. 主要頁面結構
- **首頁** (`app/page.js`) - 網站的主頁
- **布局** (`app/layout.js` 和 `app/LayoutWrapper.js`) - 提供全站的布局結構，包括菜單欄、頁腳等

### 2. 共用組件
- **菜單欄** (`app/_components/menubar.js`) - 提供網站導航
- **頁腳** (`app/_components/footer.js`) - 網站底部資訊
- **橫幅** (`app/_components/banner.js`) - 網站頂部橫幅
- **麵包屑導航** (`app/_components/breadcrumbs.js`) - 提供頁面導航路徑
- **卡片組件** (`app/_components/card.js`) - 用於顯示內容卡片

### 3. 寵物領養功能
- **寵物列表頁** (`app/pets/page.js`) - 顯示所有可領養的寵物
  - 提供搜尋和過濾功能
  - 支援地圖顯示寵物位置
  - 可按不同條件排序和篩選寵物
- **寵物詳情頁** (`app/pets/[id]/page.js`) - 顯示單一寵物的詳細資訊
  - 顯示寵物照片、基本資料、故事等
  - 提供「我想領養」按鈕
  - 顯示寵物所在位置

### 4. 商城功能
- **商城主頁** (`app/shop/page.js`) - 顯示商品列表
- **商品分類** (`app/shop/categories/`) - 按分類瀏覽商品
- **商品詳情** (`app/shop/[pid]/`) - 顯示單一商品的詳細資訊
- **商品數據** (`app/shop/_data/`) - 商品相關數據

### 5. 論壇功能
- **論壇主頁** (`app/forum/page.js`) - 顯示論壇帖子列表
- **發布帖子** (`app/forum/publish/`) - 提供發布新帖子的功能
- **分類瀏覽** (`app/forum/category/`) - 按分類瀏覽論壇帖子

### 6. 捐款功能
- **捐款頁面** (`app/donate/page.js`) - 提供捐款相關資訊和功能
- **捐款流程** (`app/donate/flow/`) - 引導用戶完成捐款流程

### 7. 會員功能
- **會員中心** (`app/member/page.js`) - 會員主頁
- **登入/登出** (`app/member/login/` 和 `app/member/logout/`) - 會員登入和登出功能
- **註冊** (`app/member/register/`) - 新會員註冊
- **忘記密碼** (`app/member/forget/`) - 密碼重設功能
- **會員設定** (`app/member/memsetting/`) - 會員資料設定
- **收藏功能**
  - 商品收藏 (`app/member/ShopLike/`)
  - 寵物收藏 (`app/member/PetLike/`)
  - 文章收藏 (`app/member/ArticleLike/`)

### 8. API 功能
- **寵物 API** (`app/api/pets/`) - 提供寵物相關的數據
  - 獲取寵物列表
  - 獲取單一寵物詳情
- **商城 API** (`app/api/shop-data/`) - 提供商品相關的數據

## 總結

前台提供了完整的寵物領養平台功能，包括：
1. 瀏覽和搜尋可領養的寵物
2. 查看寵物詳細資訊並申請領養
3. 購買寵物相關商品
4. 參與論壇討論
5. 進行捐款支持
6. 會員功能，包括收藏喜愛的寵物、商品和文章



以下是原專案的說明內容:
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
