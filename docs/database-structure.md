# Pet Project 資料庫結構

本文檔提供 `pet_proj` 資料庫的完整結構，包含所有表格、欄位、索引和關係。此資訊可用於開發過程中參考，也可以在與 AI 對話時提供，以確保 AI 能準確理解資料庫設計。

## 資料表概覽

`pet_proj` 資料庫包含以下主要資料表：

| 資料表名稱               | 描述                 |
| ------------------------ | -------------------- |
| `pets`                   | 寵物基本資訊         |
| `pet_store`              | 寵物商店/收容所資訊  |
| `pet_trait`              | 寵物特徵資訊         |
| `pet_trait_list`         | 特徵類型定義         |
| `pets_like`              | 使用者喜愛的寵物記錄 |
| `pets_recent_activities` | 寵物相關的最近活動   |
| `pet_appointment`        | 與寵物相關的預約     |
| `users`                  | 使用者資訊           |
| `user_sessions`          | 使用者登入會話       |
| `posts`                  | 社區貼文             |
| `posts_likes`            | 貼文喜歡記錄         |
| `comments`               | 貼文評論             |
| `bookmarks`              | 使用者收藏           |
| `follows`                | 使用者關注關係       |
| `categories`             | 商品分類資訊         |
| `products`               | 商品資訊             |
| `product_variants`       | 商品變體             |
| `product_reviews`        | 商品評價             |
| `orders`                 | 訂單資訊             |
| `order_items`            | 訂單項目明細         |
| `promotions`             | 促銷活動             |
| `promotion_products`     | 促銷商品關聯         |
| `receipts`               | 收據資訊             |
| `donations`              | 捐款記錄             |
| `bank_transfer_details`  | 銀行轉帳詳情         |
| `expenses`               | 支出記錄             |
| `refunds`                | 退款記錄             |
| `return_order`           | 退貨訂單             |
| `reports`                | 報告/舉報            |
| `bans`                   | 封禁記錄             |
| `manager`                | 後台管理員資訊       |

## 核心資料表詳細結構

### `pets` 表 - 寵物資訊

```sql
CREATE TABLE `pets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `type` enum('dog','cat','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `variety` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `breed` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `age_year` int DEFAULT NULL,
  `age_month` int DEFAULT NULL,
  `gender` enum('M','F','U') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `size` enum('small','medium','large') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `color` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fur_length` enum('short','medium','long') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `vaccinated` tinyint(1) DEFAULT '0',
  `neutered` tinyint(1) DEFAULT '0',
  `chip_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `adopt_fee` decimal(10,0) DEFAULT NULL,
  `adopt_status` enum('available','pending','adopted') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'available',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `like_count` int DEFAULT '0',
  `medical_history` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `diet_habits` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `activity_needs` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `images` json DEFAULT NULL,
  `main_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `store_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_pets_store` (`store_id`),
  CONSTRAINT `fk_pets_store` FOREIGN KEY (`store_id`) REFERENCES `pet_store` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### `pet_store` 表 - 寵物商店/收容所

```sql
CREATE TABLE `pet_store` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `city` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `website` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `operation_hours` json DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `logo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### `users` 表 - 使用者資訊

```sql
CREATE TABLE `users` (
  `user_id` int NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `user_password` varchar(255) NOT NULL,
  `user_name` varchar(255) NOT NULL,
  `user_number` varchar(255) NOT NULL,
  `user_address` varchar(255) NOT NULL,
  `user_birthday` date DEFAULT NULL,
  `user_level` varchar(255) DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `user_status` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

### 欄位說明

| 欄位名稱        | 類型         | 說明       | 可能的值                 |
| --------------- | ------------ | ---------- | ------------------------ |
| user_id         | int          | 使用者 ID  | 自動遞增                 |
| user_email      | varchar(255) | 電子郵件   | 必填                     |
| user_password   | varchar(255) | 密碼       | 必填                     |
| user_name       | varchar(255) | 使用者名稱 | 必填                     |
| user_number     | varchar(255) | 電話號碼   | 必填                     |
| user_address    | varchar(255) | 地址       | 必填                     |
| user_birthday   | date         | 生日       | 可為 NULL                |
| user_level      | varchar(255) | 使用者等級 | '愛心小天使', '乾爹乾媽' |
| profile_picture | varchar(255) | 個人頭像   | 可為 NULL                |
| user_status     | varchar(255) | 使用者狀態 | '正常', '禁言'           |

### 注意事項

1. 欄位命名規則：

   - 所有欄位名稱都以 `user_` 為前綴（除了 `profile_picture`）
   - 使用下劃線命名法
   - 不使用駝峰命名法

2. 狀態值：

   - `user_status` 只有 '正常' 和 '禁言' 兩種狀態
   - `user_level` 只有 '愛心小天使' 和 '乾爹乾媽' 兩種等級

3. 資料限制：

   - 電子郵件、密碼、名稱、電話和地址為必填欄位
   - 生日、等級、頭像和狀態可以為 NULL

4. 常見查詢模式：

```sql
-- 獲取所有正常狀態的會員
SELECT * FROM users WHERE user_status = '正常';

-- 獲取特定等級的會員
SELECT * FROM users WHERE user_level = '乾爹乾媽';

-- 搜尋會員
SELECT * FROM users
WHERE user_name LIKE ?
   OR user_email LIKE ?
   OR user_number LIKE ?;
```

### 相關資料表

- `pets_like`: 會員收藏的寵物
- `posts`: 會員發布的貼文
- `comments`: 會員的評論
- `orders`: 會員的訂單
- `donations`: 會員的捐款記錄

### `posts` 表 - 社區貼文

```sql
CREATE TABLE `posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `images` json DEFAULT NULL,
  `like_count` int DEFAULT '0',
  `comment_count` int DEFAULT '0',
  `view_count` int DEFAULT '0',
  `status` enum('published','draft','hidden') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'published',
  `category_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_posts_user` (`user_id`),
  KEY `fk_posts_category` (`category_id`),
  CONSTRAINT `fk_posts_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_posts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### `categories` 表 - 商品分類資訊

```sql
CREATE TABLE `categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `category_tag` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `category_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `parent_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`category_id`),
  KEY `fk_category_parent` (`parent_id`),
  CONSTRAINT `fk_category_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`category_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### 欄位說明

| 欄位名稱             | 類型         | 說明      | 可能的值                    |
| -------------------- | ------------ | --------- | --------------------------- |
| category_id          | int          | 分類 ID   | 自動遞增                    |
| category_name        | varchar(255) | 分類名稱  | 必填，如 '寵物飼料(乾糧)'   |
| category_tag         | varchar(20)  | 分類標籤  | 必填，用於快速識別          |
| category_description | text         | 分類描述  | 可為 NULL                   |
| parent_id            | int          | 父分類 ID | 可為 NULL，用於建立分類層級 |
| created_at           | timestamp    | 創建時間  | 自動生成                    |
| updated_at           | timestamp    | 更新時間  | 自動更新                    |

### 分類層級結構

1. 主分類（parent_id 為 NULL）：

   - 代表頂層分類，如 '寵物飼料'、'寵物用品'
   - 作為子分類的父層級

2. 子分類（parent_id 不為 NULL）：
   - 對應到特定主分類
   - parent_id 指向父分類的 category_id
   - 例如：'狗乾糧' 是 '寵物飼料' 的子分類

### 常見查詢模式

```sql
-- 獲取所有主分類
SELECT * FROM categories WHERE parent_id IS NULL;

-- 獲取特定主分類的所有子分類
SELECT * FROM categories WHERE parent_id = ?;

-- 獲取分類及其子分類的商品數量
SELECT c.category_name,
       COUNT(p.product_id) as product_count
FROM categories c
LEFT JOIN products p ON c.category_id = p.category_id
GROUP BY c.category_id;

-- 獲取完整的分類層級結構
SELECT c1.category_name as main_category,
       c2.category_name as sub_category
FROM categories c1
LEFT JOIN categories c2 ON c2.parent_id = c1.category_id
WHERE c1.parent_id IS NULL;
```

### 注意事項

1. 分類層級：

   - 目前系統僅支援兩層分類結構（主分類和子分類）
   - 主分類的 parent_id 必須為 NULL
   - 子分類必須有對應的 parent_id

2. 資料完整性：

   - 刪除主分類時，相關子分類的 parent_id 會自動設為 NULL
   - category_id 作為主鍵，確保唯一性
   - 使用外鍵約束確保資料一致性

3. 使用建議：
   - 建立新分類時應先確認是否已存在類似分類
   - 分類名稱應具描述性且易於理解
   - 建議定期檢查並維護分類結構

### `products` 表 - 商品資訊

```sql
CREATE TABLE `products` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `product_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `product_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `category_id` int DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock_quantity` int DEFAULT '0',
  `image_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `product_status` enum('上架','下架') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '下架',
  `is_deleted` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_id`),
  KEY `fk_products_category` (`category_id`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### `orders` 表 - 訂單資訊

```sql
CREATE TABLE `orders` (
  `order_id` varchar(20) NOT NULL,
  `user_id` int NOT NULL,
  `order_status` enum('待出貨','已出貨','已完成','已取消') NOT NULL DEFAULT '待出貨',
  `payment_method` enum('信用卡','LINE Pay','貨到付款') NOT NULL,
  `payment_status` enum('未付款','已付款','已退款') NOT NULL DEFAULT '未付款',
  `recipient_name` varchar(50) NOT NULL,
  `recipient_email` varchar(100) NOT NULL,
  `recipient_phone` varchar(20) NOT NULL,
  `shipping_address` text NOT NULL,
  `note` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`),
  KEY `fk_orders_user` (`user_id`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### `order_items` 表 - 訂單項目明細

```sql
CREATE TABLE `order_items` (
  `order_item_id` int NOT NULL AUTO_INCREMENT,
  `order_id` varchar(20) NOT NULL,
  `product_id` int NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_image` varchar(255) NOT NULL,
  `variant` varchar(100),
  `price` decimal(10,2) NOT NULL,
  `quantity` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_item_id`),
  KEY `fk_order_items_order` (`order_id`),
  KEY `fk_order_items_product` (`product_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### 欄位說明

#### orders 表

| 欄位名稱         | 類型         | 說明         | 可能的值                               |
| ---------------- | ------------ | ------------ | -------------------------------------- |
| order_id         | varchar(20)  | 訂單編號     | 必填，格式：ORD + 流水號               |
| user_id          | int          | 使用者 ID    | 必填，關聯到 users 表                  |
| order_status     | enum         | 訂單狀態     | '待出貨', '已出貨', '已完成', '已取消' |
| payment_method   | enum         | 支付方式     | '信用卡', 'LINE Pay', '貨到付款'       |
| payment_status   | enum         | 付款狀態     | '未付款', '已付款', '已退款'           |
| recipient_name   | varchar(50)  | 收件人姓名   | 必填                                   |
| recipient_email  | varchar(100) | 收件人 Email | 必填                                   |
| recipient_phone  | varchar(20)  | 收件人電話   | 必填                                   |
| shipping_address | text         | 收件地址     | 必填                                   |
| note             | text         | 訂單備註     | 可為 NULL                              |
| created_at       | timestamp    | 建立時間     | 自動生成                               |
| updated_at       | timestamp    | 更新時間     | 自動更新                               |

#### order_items 表

| 欄位名稱      | 類型          | 說明        | 可能的值               |
| ------------- | ------------- | ----------- | ---------------------- |
| order_item_id | int           | 訂單項目 ID | 自動遞增               |
| order_id      | varchar(20)   | 訂單編號    | 必填，關聯到 orders 表 |
| product_id    | int           | 商品 ID     | 必填關聯到 products 表 |
| product_name  | varchar(255)  | 商品名稱    | 必填                   |
| product_image | varchar(255)  | 商品圖片    | 必填                   |
| variant       | varchar(100)  | 商品變體    | 可為 NULL              |
| price         | decimal(10,2) | 商品單價    | 必填                   |
| quantity      | int           | 購買數量    | 必填                   |
| created_at    | timestamp     | 建立時間    | 自動生成               |

### 訂單總金額計算

訂單總金額是根據 `order_items` 表中的商品明細計算得出：

```sql
SELECT
  o.order_id,
  SUM(oi.price * oi.quantity) as total_price
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
GROUP BY o.order_id;
```

計算邏輯：

1. 每個訂單項目的金額 = 商品單價 × 購買數量
2. 訂單總金額 = 所有訂單項目的金額總和

注意事項：

1. 訂單總金額不包含運費
2. 優惠券折扣應在計算總金額後再進行扣除
3. 所有金額計算都應考慮到可能的 NULL 值，使用 COALESCE 或 IFNULL 函數處理

### 常見查詢模式

```sql
-- 獲取訂單及其商品明細
SELECT o.*, oi.*
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.order_id = ?;

-- 獲取訂單總金額
SELECT
  o.order_id,
  SUM(oi.price * oi.quantity) as total_price
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.order_id = ?
GROUP BY o.order_id;

-- 獲取特定狀態的訂單
SELECT * FROM orders WHERE order_status = ?;

-- 獲取特定使用者的訂單
SELECT * FROM orders WHERE user_id = ?;
```

### `donations` 表 - 捐款記錄

```sql
CREATE TABLE `donations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `is_anonymous` tinyint(1) DEFAULT '0',
  `is_paid` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_donations_user` (`user_id`),
  CONSTRAINT `fk_donations_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### `manager` 表 - 後台管理員

```sql
CREATE TABLE `manager` (
  `id` int NOT NULL AUTO_INCREMENT,
  `manager_account` varchar(255) DEFAULT NULL,
  `manager_password` varchar(255) DEFAULT NULL,
  `manager_privileges` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## 表格關聯圖

```
pets ────┐
         │
         ▼
     pet_store ◄───── pet_appointment
         ▲
         │
users ───┘
   │
   ├─────► posts ◄───── comments
   │        │
   │        ▼
   │     categories
   │
   ├─────► orders ◄───── order_items
   │                        │
   │                        ▼
   │                     products ◄───── product_variants
   │                        │
   │                        ▼
   │                  product_reviews
   │
   └─────► donations
```

## 資料庫統計資訊

- 資料表總數: 31
- 所有表格均使用 InnoDB 引擎，支援外鍵和交易
- 所有表格均使用 utf8mb4_general_ci 字符集與排序規則
- 大多數表格包含 created_at 和 updated_at 時間戳記欄位，方便追蹤記錄的創建和更新時間

## 常見查詢模式

### 寵物相關查詢

```sql
-- 獲取可收養的寵物列表
SELECT p.*, ps.name as store_name, ps.address
FROM pets p
JOIN pet_store ps ON p.store_id = ps.id
WHERE p.adopt_status = 'available'
ORDER BY p.created_at DESC;

-- 獲取寵物詳細資料及特徵
SELECT p.*,
       GROUP_CONCAT(DISTINCT ptl.trait_name) as traits
FROM pets p
LEFT JOIN pet_trait pt ON p.id = pt.pet_id
LEFT JOIN pet_trait_list ptl ON pt.trait_id = ptl.id
WHERE p.id = ?
GROUP BY p.id;
```

### 用戶相關查詢

```sql
-- 獲取用戶收藏的寵物
SELECT p.*
FROM pets p
JOIN pets_like pl ON p.id = pl.pet_id
WHERE pl.user_id = ?;

-- 用戶發布的貼文
SELECT p.*, u.username, u.profile_image
FROM posts p
JOIN users u ON p.user_id = u.id
WHERE u.id = ?
ORDER BY p.created_at DESC;
```

### 訂單相關查詢

```sql
-- 獲取訂單詳情和訂單項目
SELECT o.*, oi.product_id, oi.quantity, oi.price, p.product_name
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
JOIN products p ON oi.product_id = p.product_id
WHERE o.order_id = ?;
```

# 資料庫結構說明

## 管理員表 (manager)

### 表結構

```sql
-- 注意：此處顯示的是設計結構，實際部署的資料表結構請參考下方說明
CREATE TABLE manager (
  id INT PRIMARY KEY AUTO_INCREMENT,
  manager_account VARCHAR(50) NOT NULL UNIQUE,
  manager_password VARCHAR(255) NOT NULL,
  manager_privileges VARCHAR(50) NOT NULL,
  is_active TINYINT(1) DEFAULT 1,  -- 【注意】實際資料庫中不存在此欄位
  last_login_at DATETIME,          -- 【注意】實際資料庫中不存在此欄位
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- 【注意】實際資料庫中不存在此欄位
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP  -- 【注意】實際資料庫中不存在此欄位
);
```

### 實際資料庫中的結構 (重要)

```sql
-- 這是目前實際部署在資料庫中的結構
CREATE TABLE `manager` (
  `id` int NOT NULL,
  `manager_account` varchar(255) DEFAULT NULL,
  `manager_password` varchar(255) DEFAULT NULL,
  `manager_privileges` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

> **⚠️ 重要提醒：** `manager_privileges` 是關鍵欄位，表示管理員的權限，絕對不能為 NULL 或空值。此欄位在程式碼中廣泛用於權限判斷，如果為 NULL 將導致系統錯誤。

### 欄位說明

- `id`: 管理員唯一識別碼
- `manager_account`: 管理員帳號
- `manager_password`: 加密後的密碼（使用 bcrypt）
- `manager_privileges`: 權限代碼（**必填，不可為 NULL**）
  - `111`: 超級管理員（具有所有權限）
  - `member`: 會員管理權限
  - `pet`: 寵物管理權限
  - `shop`: 商品管理權限
  - `donation`: 捐款管理權限
  - `post`: 文章管理權限
  - 可以使用逗號分隔組合多個權限，例如：`member,pet,shop`
- ~~`is_active`: 帳號狀態（1: 啟用, 0: 停用）~~ **【注意】實際資料庫中不存在此欄位**
- ~~`last_login_at`: 最後登入時間~~ **【注意】實際資料庫中不存在此欄位**
- ~~`created_at`: 創建時間~~ **【注意】實際資料庫中不存在此欄位**
- ~~`updated_at`: 更新時間~~ **【注意】實際資料庫中不存在此欄位**

### 注意事項

1. 密碼加密使用 bcrypt，需要處理 PHP 和 Node.js 的兼容性
2. 權限代碼使用逗號分隔的字串格式
3. 超級管理員（111）擁有所有權限
4. **重要：代碼中不應使用 `is_active`、`last_login_at`、`created_at` 和 `updated_at` 欄位，因為這些欄位在實際資料庫中不存在**
5. **相關程式碼需要修改，以適應實際資料庫結構**

### 防止 manager_privileges 為 undefined 的最佳做法

在處理 `manager_privileges` 欄位時，應遵循以下最佳實踐：

1. **資料庫層面**：

   - 在 INSERT 或 UPDATE 操作時，應確保 `manager_privileges` 欄位有值，不要插入 NULL
   - 推薦為此欄位設置一個預設值（如 'viewer'），確保即使忘記設置也不會有問題

2. **應用程式層面**：

   - 在讀取 `manager_privileges` 時始終使用空值合併運算符：`const privileges = admin.manager_privileges || ''`
   - 在使用 `split` 方法前檢查值是否存在：`const perms = privileges ? privileges.split(',') : []`
   - 在登入流程中驗證此欄位是否存在，如不存在應拒絕登入或設置最低權限

3. **代碼示例**：

   ```typescript
   // 安全處理 manager_privileges
   const privileges = admin.manager_privileges || ''
   const isSuperAdmin = privileges === '111'
   const permissionArray = privileges ? privileges.split(',') : []

   // 檢查特定權限
   const hasPermission = isSuperAdmin || permissionArray.includes('member')
   ```

4. **管理員新增或編輯**：
   - 新增管理員時必須指定 `manager_privileges` 欄位
   - 對於現有記錄中 `manager_privileges` 為 NULL 的，應儘快更新為有效值

## 會員表 (users)

### 表結構

```sql
CREATE TABLE users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  user_email VARCHAR(100) NOT NULL UNIQUE,
  user_name VARCHAR(50) NOT NULL,
  user_number VARCHAR(20),
  user_address TEXT,
  user_birthday DATE,
  user_level VARCHAR(20),
  profile_picture VARCHAR(255),
  user_status VARCHAR(20) DEFAULT '正常',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 欄位說明

- `user_id`: 會員唯一識別碼
- `user_email`: 電子郵件（唯一）
- `user_name`: 會員姓名
- `user_number`: 電話號碼
- `user_address`: 地址
- `user_birthday`: 生日
- `user_level`: 會員等級
  - `愛心小天使`
  - `乾爹乾媽`
- `profile_picture`: 頭像圖片路徑
- `user_status`: 會員狀態
  - `正常`
  - `禁言`
- `created_at`: 創建時間
- `updated_at`: 更新時間

### 注意事項

1. 所有時間欄位使用 MySQL TIMESTAMP 類型
2. 狀態和等級使用預定義的字串值
3. 圖片路徑存儲相對路徑

## API 響應格式

### 成功響應

```typescript
{
  success: true,
  message: string,
  data: {
    // 數據內容
  }
}
```

### 錯誤響應

```typescript
{
  success: false,
  message: string,
  error?: any
}
```

## 資料庫連接配置

### 開發環境

```typescript
{
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'pet_proj',
  port: 3306
}
```

### 注意事項

1. 使用環境變數配置敏感資訊
2. 設置適當的連接池大小
3. 處理連接錯誤和重試機制

## 查詢最佳實踐

### 1. 使用預處理語句

```typescript
const query = 'SELECT * FROM users WHERE user_id = ?'
const results = await executeQuery(query, [id])
```

### 2. 正確處理 NULL 值

```typescript
const birthday = row.birthday ? new Date(row.birthday) : null
```

### 3. 使用適當的索引

- 主鍵索引：user_id, id
- 唯一索引：user_email, manager_account
- 普通索引：user_status, user_level

### 4. 日期時間處理

```sql
DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as formatted_date
```

### `product_variants` 表 - 商品變體

```sql
CREATE TABLE `product_variants` (
  `variant_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `variant_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock_quantity` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`variant_id`),
  KEY `fk_variants_product` (`product_id`),
  CONSTRAINT `fk_variants_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### 欄位說明

#### `products` 表欄位

| 欄位名稱            | 類型          | 說明         | 可能的值               |
| ------------------- | ------------- | ------------ | ---------------------- |
| product_id          | int           | 商品 ID      | 自動遞增               |
| product_name        | varchar(255)  | 商品名稱     | 必填                   |
| product_description | text          | 商品描述     | 可為 NULL              |
| category_id         | int           | 分類 ID      | 可為 NULL              |
| price               | decimal(10,2) | 價格         | 必填                   |
| stock_quantity      | int           | 庫存數量     | 默認值 0               |
| image_url           | varchar(255)  | 商品主圖 URL | 可為 NULL              |
| product_status      | enum          | 商品狀態     | '上架', '下架'         |
| is_deleted          | tinyint(1)    | 是否刪除     | 0 (未刪除), 1 (已刪除) |
| created_at          | timestamp     | 創建時間     | 自動生成               |
| updated_at          | timestamp     | 更新時間     | 自動更新               |

#### `product_variants` 表欄位

| 欄位名稱       | 類型          | 說明         | 可能的值 |
| -------------- | ------------- | ------------ | -------- |
| variant_id     | int           | 變體 ID      | 自動遞增 |
| product_id     | int           | 商品 ID      | 必填     |
| variant_name   | varchar(255)  | 變體名稱     | 必填     |
| price          | decimal(10,2) | 變體價格     | 必填     |
| stock_quantity | int           | 變體庫存數量 | 默認值 0 |
| created_at     | timestamp     | 創建時間     | 自動生成 |
| updated_at     | timestamp     | 更新時間     | 自動更新 |

### 常見查詢模式

```sql
-- 獲取所有上架中且未刪除的商品
SELECT * FROM products WHERE product_status = '上架' AND is_deleted = 0;

-- 獲取商品及其變體
SELECT p.*, v.variant_id, v.variant_name, v.price as variant_price, v.stock_quantity as variant_stock
FROM products p
LEFT JOIN product_variants v ON p.product_id = v.product_id
WHERE p.product_id = ? AND p.is_deleted = 0;

-- 更新商品狀態
UPDATE products SET product_status = '上架' WHERE product_id = ?;

-- 軟刪除商品（設置is_deleted為1，而不是實際刪除）
UPDATE products SET is_deleted = 1 WHERE product_id = ?;
```

### 注意事項

1. 商品狀態：

   - `product_status` 使用 enum 類型，有 '上架' 和 '下架' 兩種狀態
   - `is_deleted` 用於軟刪除功能，值為 1 表示已刪除，值為 0 表示未刪除

2. 前端顯示：

   - 前端顯示時將 `product_status` 值 '上架' 映射為 'active'，'下架' 映射為 'inactive'
   - `is_deleted` 為 1 的商品在前端顯示為 '已刪除' 狀態

3. 商品變體：
   - 商品變體表使用 `price` 和 `stock_quantity` 字段存儲價格和庫存
   - 所有價格字段使用 decimal(10,2) 類型確保精確計算
