-- 0308新增(product_variants、products、product_like、product_img、categories)
CREATE TABLE `product_like` (
  `product_id` int NOT NULL,
  `user_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ;

CREATE TABLE `product_img` (
  `product_id` int NOT NULL,
  `product_img1` varchar(255) NOT NULL ,
  `product_img2` varchar(255),
  `product_img3` varchar(255),
  `product_img4` varchar(255)
) ;

-- 更新原有的資料
UPDATE `categories` 
SET `category_name` = '寵物飼料(乾糧)', `category_tag` = 'dry_food', `category_description` = '各類動物的乾糧飼料', `parent_id` = NULL, `updated_at` = NOW()
WHERE `category_id` = 1;

UPDATE `categories` 
SET `category_name` = '寵物罐頭(濕糧)', `category_tag` = 'wet_food', `category_description` = '各類動物的罐頭與濕糧', `parent_id` = NULL, `updated_at` = NOW()
WHERE `category_id` = 2;

UPDATE `categories` 
SET `category_name` = '寵物零食', `category_tag` = 'pet_snacks', `category_description` = '各類動物的零食與獎勳食品', `parent_id` = NULL, `updated_at` = NOW()
WHERE `category_id` = 3;

UPDATE `categories` 
SET `category_name` = '日常用品', `category_tag` = 'daily_supplies', `category_description` = '寵物的日常用品與配件', `parent_id` = NULL, `updated_at` = NOW()
WHERE `category_id` = 4;

UPDATE `categories` 
SET `category_name` = '寵物美容', `category_tag` = 'pet_grooming', `category_description` = '寵物的美容與清潔用品', `parent_id` = NULL, `updated_at` = NOW()
WHERE `category_id` = 5;

UPDATE `categories` 
SET `category_name` = '狗乾糧', `category_tag` = 'dog_dry_food', `category_description` = '狗專用乾糧', `parent_id` = 1, `updated_at` = NOW()
WHERE `category_id` = 6;

UPDATE `categories` 
SET `category_name` = '貓乾糧', `category_tag` = 'cat_dry_food', `category_description` = '貓專用乾糧', `parent_id` = 1, `updated_at` = NOW()
WHERE `category_id` = 7;

UPDATE `categories` 
SET `category_name` = '狗罐頭', `category_tag` = 'dog_wet_food', `category_description` = '狗專用罐頭與濕糧', `parent_id` = 2, `updated_at` = NOW()
WHERE `category_id` = 8;

UPDATE `categories` 
SET `category_name` = '貓罐頭', `category_tag` = 'cat_wet_food', `category_description` = '貓專用罐頭與濕糧', `parent_id` = 2, `updated_at` = NOW()
WHERE `category_id` = 9;

-- 插入新的資料
INSERT INTO `categories` (`category_id`, `category_name`, `category_tag`, `category_description`, `parent_id`, `created_at`, `updated_at`) VALUES

-- 每個主要分類的子類別

(10, '狗零食', 'dog_snacks', '狗專用零食與獎勳食品', 3, NOW(), NOW()),
(11, '貓零食', 'cat_snacks', '貓專用零食與獎勳食品', 3, NOW(), NOW()),

(12, '狗日常用品', 'dog_supplies', '狗的日常用品，如狗窩、牽繩', 4, NOW(), NOW()),
(13, '貓日常用品', 'cat_supplies', '貓的日常用品，如貓砂盆、貓抓板', 4, NOW(), NOW()),

(14, '狗美容用品', 'dog_grooming', '狗的美容與清潔用品', 5, NOW(), NOW()),
(15, '貓美容用品', 'cat_grooming', '貓的美容與清潔用品', 5, NOW(), NOW());

-- 更新商品資料為寵物商品
UPDATE `products` 
SET `category_id` = 6, `product_name` = '狗乾糧 1', `product_description` = '各種狗乾糧產品 1', `updated_at` = NOW()
WHERE `product_id` = 1;  -- 假設原來的商品ID為 1 (電子產品 1)

UPDATE `products` 
SET `category_id` = 6, `product_name` = '狗乾糧 2', `product_description` = '各種狗乾糧產品 2', `updated_at` = NOW()
WHERE `product_id` = 2;  -- 假設原來的商品ID為 2 (電子產品 2)

UPDATE `products` 
SET `category_id` = 7, `product_name` = '貓乾糧 1', `product_description` = '各種貓乾糧產品 1', `updated_at` = NOW()
WHERE `product_id` = 3;  -- 假設原來的商品ID為 3 (時尚商品 1)

UPDATE `products` 
SET `category_id` = 7, `product_name` = '貓乾糧 2', `product_description` = '各種貓乾糧產品 2', `updated_at` = NOW()
WHERE `product_id` = 4;  -- 假設原來的商品ID為 4 (時尚商品 2)

UPDATE `products` 
SET `category_id` = 8, `product_name` = '狗罐頭 1', `product_description` = '各種狗罐頭產品 1', `updated_at` = NOW()
WHERE `product_id` = 5;  -- 假設原來的商品ID為 5 (智能手機 1)

UPDATE `products` 
SET `category_id` = 8, `product_name` = '狗罐頭 2', `product_description` = '各種狗罐頭產品 2', `updated_at` = NOW()
WHERE `product_id` = 6;  -- 假設原來的商品ID為 6 (智能手機 2)

UPDATE `products` 
SET `category_id` = 9, `product_name` = '貓罐頭 1', `product_description` = '各種貓罐頭產品 1', `updated_at` = NOW()
WHERE `product_id` = 7;  -- 假設原來的商品ID為 7 (筆記型電腦 1)

UPDATE `products` 
SET `category_id` = 9, `product_name` = '貓罐頭 2', `product_description` = '各種貓罐頭產品 2', `updated_at` = NOW()
WHERE `product_id` = 8;  -- 假設原來的商品ID為 8 (筆記型電腦 2)

UPDATE `products` 
SET `category_id` = 6, `product_name` = '狗乾糧 3', `product_description` = '各種狗乾糧產品 3', `updated_at` = NOW()
WHERE `product_id` = 9;  -- 假設原來的商品ID為 9 (鞋子 1)

UPDATE `products` 
SET `category_id` = 7, `product_name` = '貓乾糧 3', `product_description` = '各種貓乾糧產品 3', `updated_at` = NOW()
WHERE `product_id` = 10;  -- 假設原來的商品ID為 10 (鞋子 2)

UPDATE `products` 
SET `category_id` = 8, `product_name` = '狗罐頭 3', `product_description` = '各種狗罐頭產品 3', `updated_at` = NOW()
WHERE `product_id` = 11;  -- 假設原來的商品ID為 11

UPDATE `products` 
SET `category_id` = 9, `product_name` = '貓罐頭 3', `product_description` = '各種貓罐頭產品 3', `updated_at` = NOW()
WHERE `product_id` = 12;  -- 假設原來的商品ID為 12



-- 更新商品變體資料為寵物商品變體
UPDATE `product_variants` 
SET `variant_name` = '狗乾糧 1 - 變體 A', `price` = 120, `stock_quantity` = 15, `updated_at` = NOW()
WHERE `variant_id` = 1;

UPDATE `product_variants` 
SET `variant_name` = '狗乾糧 2 - 變體 A', `price` = 140, `stock_quantity` = 20, `updated_at` = NOW()
WHERE `variant_id` = 2;

UPDATE `product_variants` 
SET `variant_name` = '貓乾糧 1 - 變體 A', `price` = 95, `stock_quantity` = 40, `updated_at` = NOW()
WHERE `variant_id` = 3;

UPDATE `product_variants` 
SET `variant_name` = '貓乾糧 2 - 變體 A', `price` = 115, `stock_quantity` = 30, `updated_at` = NOW()
WHERE `variant_id` = 4;

UPDATE `product_variants` 
SET `variant_name` = '狗罐頭 1 - 變體 A', `price` = 135, `stock_quantity` = 25, `updated_at` = NOW()
WHERE `variant_id` = 5;

UPDATE `product_variants` 
SET `variant_name` = '狗罐頭 2 - 變體 A', `price` = 155, `stock_quantity` = 20, `updated_at` = NOW()
WHERE `variant_id` = 6;

UPDATE `product_variants` 
SET `variant_name` = '貓罐頭 1 - 變體 A', `price` = 175, `stock_quantity` = 10, `updated_at` = NOW()
WHERE `variant_id` = 7;

UPDATE `product_variants` 
SET `variant_name` = '貓罐頭 2 - 變體 A', `price` = 195, `stock_quantity` = 15, `updated_at` = NOW()
WHERE `variant_id` = 8;

UPDATE `product_variants` 
SET `variant_name` = '狗乾糧 3 - 變體 A', `price` = 70, `stock_quantity` = 10, `updated_at` = NOW()
WHERE `variant_id` = 9;

UPDATE `product_variants` 
SET `variant_name` = '狗乾糧 4 - 變體 A', `price` = 80, `stock_quantity` = 12, `updated_at` = NOW()
WHERE `variant_id` = 10;

UPDATE `product_variants` 
SET `variant_name` = '狗乾糧 5 - 變體 A', `price` = 100, `stock_quantity` = 5, `updated_at` = NOW()
WHERE `variant_id` = 11;

UPDATE `product_variants` 
SET `variant_name` = '貓乾糧 5 - 變體 A', `price` = 120, `stock_quantity` = 10, `updated_at` = NOW()
WHERE `variant_id` = 12;


-- 0309新增(promotions、promotion_products)
-- promotions
UPDATE `promotions` 
SET `promotion_name` = '夏季寵物用品大促', 
    `promotion_description` = '全館寵物食品、零食、日常用品享受高達30%折扣' 
WHERE `promotion_id` = 1;

UPDATE `promotions` 
SET `promotion_name` = '寵物美容護理優惠', 
    `promotion_description` = '寵物美容產品限時買一送一，包括洗毛精、護毛素等' 
WHERE `promotion_id` = 2;

UPDATE `promotions` 
SET `promotion_name` = '新品飼料優惠', 
    `promotion_description` = '全新上市的寵物乾糧和罐頭享受首次購買20%折扣' 
WHERE `promotion_id` = 3;

UPDATE `promotions` 
SET `promotion_name` = '寵物用品滿額折扣', 
    `promotion_description` = '全館消費滿500元可享受額外10%折扣，適用於所有寵物商品' 
WHERE `promotion_id` = 4;

UPDATE `promotions` 
SET `promotion_name` = '雙11寵物狂歡節', 
    `promotion_description` = '雙11期間所有寵物商品享有30%折扣，限時搶購' 
WHERE `promotion_id` = 5;

UPDATE `promotions` 
SET `promotion_name` = '寵物零食優惠週', 
    `promotion_description` = '寵物零食專屬折扣，最高可享15%優惠', 
    `start_date` = '2025-05-01', 
    `end_date` = '2025-05-07', 
    `discount_percentage` = 15 
WHERE `promotion_id` = 7;


-- promotion_products
