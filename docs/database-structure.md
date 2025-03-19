# Pet Project 資料庫結構

> ⚠️ **重要警告**: 此文檔定義了系統核心資料結構。修改資料庫設計需嚴格遵循以下規範：
>
> 1. 不得修改現有主鍵和外鍵關係
> 2. 必須維持向後兼容性
> 3. 添加新欄位必須考慮默認值和空值處理
> 4. 所有修改必須遵循資料類型安全原則

## 資料庫操作規範

開發或修改與資料庫相關的功能時，必須遵循以下規範：

1. **查詢安全**：所有查詢必須使用參數化查詢，避免 SQL 注入
2. **事務管理**：涉及多表操作時必須使用事務
3. **索引利用**：查詢必須利用已定義的索引
4. **錯誤處理**：必須妥善處理資料庫錯誤並提供明確的錯誤訊息
5. **避免 N+1 問題**：使用適當的 JOIN 和關聯加載
6. **權限控制**：所有資料庫操作必須經過權限檢查
7. **表名使用**：必須使用正確的資料表名稱，不添加任何前綴

> 🔴 **嚴禁**:
>
> - 在 API 路由中直接編寫原始 SQL
> - 在前端直接執行資料庫操作
> - 繞過 ORM 或查詢構建器
> - 修改生產環境中的表結構(必須通過正確的遷移流程)
> - 使用不正確的表名前綴 (如 `shop_products` 而非 `products`)

## 資料庫表名映射

所有 API 在引用資料表時必須使用這些正確的表名：

| 領域     | 正確表名             | 錯誤表名 (禁止使用)       |
| -------- | -------------------- | ------------------------- |
| 商品     | `products`           | `shop_products`           |
| 訂單     | `orders`             | `shop_orders`             |
| 訂單項目 | `order_items`        | `shop_order_items`        |
| 商品分類 | `categories`         | `shop_categories`         |
| 促銷活動 | `promotions`         | `shop_promotions`         |
| 促銷商品 | `promotion_products` | `shop_promotion_products` |

使用正確的表名是避免資料庫查詢錯誤的關鍵。

## 資料表概覽

`pet_proj` 資料庫包含以下主要資料表：

| 資料表名稱                | 描述                 |
| ------------------------- | -------------------- |
| `admin_operation_logs`    | 管理員操作日誌       |
| `bank_transfer_details`   | 銀行轉帳詳情         |
| `bans`                    | 使用者封禁記錄       |
| `bookmarks`               | 使用者收藏貼文       |
| `cases`                   | 救援案例             |
| `case_images`             | 案例圖片             |
| `categories`              | 商品分類資訊         |
| `chat_messages`           | 聊天訊息             |
| `chat_rooms`              | 聊天室               |
| `chat_users`              | 聊天室使用者         |
| `comments`                | 貼文評論             |
| `donations`               | 捐款記錄             |
| `expenses`                | 支出記錄             |
| `follows`                 | 使用者關注關係       |
| `forum_articles`          | 論壇文章             |
| `forum_article_favorites` | 論壇文章收藏         |
| `forum_article_likes`     | 論壇文章喜歡         |
| `forum_comments`          | 論壇評論             |
| `forum_comment_replies`   | 論壇評論回覆         |
| `manager`                 | 後台管理員資訊       |
| `media_article`           | 媒體文章關聯         |
| `media_chat`              | 聊天媒體關聯         |
| `media_uploads`           | 媒體上傳記錄         |
| `notify_notifications`    | 系統通知             |
| `orders`                  | 訂單資訊             |
| `order_items`             | 訂單項目明細         |
| `pets`                    | 寵物基本資訊         |
| `pets_like`               | 使用者喜愛的寵物記錄 |
| `pets_recent_activities`  | 寵物相關的最近活動   |
| `pet_appointment`         | 與寵物相關的預約     |
| `pet_photos`              | 寵物照片             |
| `pet_recommendation`      | 寵物推薦             |
| `pet_store`               | 寵物商店/收容所資訊  |
| `pet_trait`               | 寵物特徵關聯         |
| `pet_trait_list`          | 特徵類型定義         |
| `posts`                   | 社區貼文             |
| `posts_likes`             | 貼文喜歡記錄         |
| `products`                | 商品資訊             |
| `product_img`             | 商品圖片             |
| `product_like`            | 商品收藏             |
| `product_reviews`         | 商品評價             |
| `product_variants`        | 商品變體             |
| `promotions`              | 促銷活動             |
| `promotion_products`      | 促銷商品關聯         |
| `receipts`                | 捐款收據             |
| `refunds`                 | 退款記錄             |
| `reports`                 | 內容舉報             |
| `return_order`            | 退貨訂單             |
| `shopping_cart`           | 購物車               |
| `users`                   | 使用者資訊           |
| `user_questionnaire`      | 使用者問卷           |
| `user_sessions`           | 使用者登入會話       |

## 核心資料表詳細結構

### `admin_operation_logs` 表 - 管理員操作日誌

```sql
CREATE TABLE `admin_operation_logs` (
  `id` int NOT NULL,
  `admin_id` int DEFAULT NULL,
  `action_type` varchar(50) DEFAULT NULL,
  `module` varchar(50) DEFAULT NULL,
  `target_id` int DEFAULT NULL,
  `details` text,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作時間'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='管理員操作日誌';
```

### `pets` 表 - 寵物資訊

```sql
CREATE TABLE `pets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `species` varchar(50) DEFAULT NULL,
  `variety` varchar(50) DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `weight` decimal(5,2) DEFAULT NULL,
  `chip_number` varchar(50) DEFAULT NULL,
  `fixed` tinyint(1) DEFAULT NULL,
  `story` text,
  `store_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `is_adopted` tinyint(1) DEFAULT '0',
  `main_photo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `store_id` (`store_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

### `pet_store` 表 - 寵物商店/收容所

```sql
CREATE TABLE `pet_store` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `mail` varchar(100) DEFAULT NULL,
  `open_hours` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `lat` decimal(10,6) DEFAULT NULL,
  `lng` decimal(10,6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

### `users` 表 - 使用者資訊

```sql
CREATE TABLE `users` (
  `user_id` int NOT NULL,
  `user_email` varchar(255) DEFAULT NULL,
  `user_password` varchar(255) DEFAULT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `user_number` varchar(255) DEFAULT NULL,
  `user_address` varchar(255) DEFAULT NULL,
  `user_birthday` date DEFAULT NULL,
  `user_level` varchar(255) DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `user_status` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `user_email` (`user_email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

### `posts` 表 - 社區貼文

```sql
CREATE TABLE `posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `body` text,
  `user_id` int DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `likes_count` int DEFAULT NULL,
  `bookmark_count` int DEFAULT NULL,
  `is_pinned` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### `comments` 表 - 評論

```sql
CREATE TABLE `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `body` text,
  `post_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `likes_count` int DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### `categories` 表 - 商品分類資訊

```sql
CREATE TABLE `categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(255) DEFAULT NULL,
  `category_tag` varchar(255) DEFAULT NULL,
  `category_description` varchar(255) DEFAULT NULL,
  `parent_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`category_id`),
  KEY `parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### `products` 表 - 商品資訊

```sql
CREATE TABLE `products` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `product_name` varchar(255) DEFAULT NULL,
  `product_description` text,
  `price` decimal(10,0) DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `product_status` varchar(50) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `stock_quantity` int DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`product_id`),
  KEY `category_id` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### `product_variants` 表 - 商品變體

```sql
CREATE TABLE `product_variants` (
  `variant_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int DEFAULT NULL,
  `variant_name` varchar(255) DEFAULT NULL,
  `price` decimal(10,0) DEFAULT NULL,
  `stock_quantity` int DEFAULT NULL,
  `variant_status` varchar(50) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`variant_id`),
  KEY `product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### `orders` 表 - 訂單資訊

```sql
CREATE TABLE `orders` (
  `order_id` varchar(30) NOT NULL,
  `user_id` int DEFAULT NULL,
  `total_price` decimal(10,0) DEFAULT NULL,
  `order_status`
```
