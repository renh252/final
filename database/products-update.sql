-- 清空現有商品表（可選，謹慎使用）
-- TRUNCATE TABLE products;

-- 重設自動遞增（可選）
-- ALTER TABLE products AUTO_INCREMENT = 20;

-- 為次分類添加商品
-- 狗乾糧 (ID:6)
INSERT INTO products (product_name, product_description, price, category_id, stock_quantity, product_status, image_url) 
VALUES 
('高級狗乾糧-雞肉配方', '適合成犬的雞肉配方乾糧，富含蛋白質', 799, 6, 100, '上架', 'https://placehold.co/100x100'),
('幼犬成長狗乾糧', '專為幼犬設計，促進健康成長', 899, 6, 80, '上架', 'https://placehold.co/100x100'),
('老年犬專用乾糧', '適合7歲以上老年犬，低脂配方', 699, 6, 50, '上架', 'https://placehold.co/100x100');

-- 貓乾糧 (ID:7)
INSERT INTO products (product_name, product_description, price, category_id, stock_quantity, product_status, image_url) 
VALUES 
('高級貓乾糧-鮭魚配方', '含豐富Omega-3脂肪酸的鮭魚配方', 850, 7, 120, '上架', 'https://placehold.co/100x100'),
('室內貓專用乾糧', '低活動量室內貓的低卡配方', 750, 7, 90, '上架', 'https://placehold.co/100x100'),
('貓咪腸胃健康配方', '添加益生菌，促進貓咪腸胃健康', 880, 7, 70, '上架', 'https://placehold.co/100x100');

-- 狗罐頭 (ID:8)
INSERT INTO products (product_name, product_description, price, category_id, stock_quantity, product_status, image_url) 
VALUES 
('狗狗牛肉濕糧罐頭', '新鮮牛肉製成，適合挑食狗狗', 150, 8, 200, '上架', 'https://placehold.co/100x100'),
('狗狗雞肉蔬菜罐頭', '雞肉加蔬菜的均衡營養配方', 130, 8, 180, '上架', 'https://placehold.co/100x100'),
('狗狗鮭魚罐頭', '富含Omega油脂的鮭魚濕糧', 170, 8, 150, '上架', 'https://placehold.co/100x100');

-- 貓罐頭 (ID:9)
INSERT INTO products (product_name, product_description, price, category_id, stock_quantity, product_status, image_url) 
VALUES 
('貓咪吞拿魚罐頭', '純正吞拿魚肉製成，不含防腐劑', 160, 9, 190, '上架', 'https://placehold.co/100x100'),
('貓咪肝醬罐頭', '貓咪最愛的肝醬口味，營養豐富', 140, 9, 170, '上架', 'https://placehold.co/100x100'),
('幼貓專用濕糧', '質地柔軟，易於幼貓咀嚼', 180, 9, 140, '上架', 'https://placehold.co/100x100');

-- 狗零食 (ID:10)
INSERT INTO products (product_name, product_description, price, category_id, stock_quantity, product_status, image_url) 
VALUES 
('狗狗牛肉乾', '純天然牛肉製成，口感香脆', 250, 10, 80, '上架', 'https://placehold.co/100x100'),
('狗狗潔牙骨', '幫助清潔牙齒的狗狗零食', 220, 10, 100, '上架', 'https://placehold.co/100x100'),
('狗狗訓練小餅乾', '適合訓練時獎勵的小型零食', 180, 10, 120, '上架', 'https://placehold.co/100x100');

-- 貓零食 (ID:11)
INSERT INTO products (product_name, product_description, price, category_id, stock_quantity, product_status, image_url) 
VALUES 
('貓咪鮮肉條', '新鮮肉類製成的貓咪零食', 240, 11, 85, '上架', 'https://placehold.co/100x100'),
('貓草薄荷玩具', '內含貓草的玩具零食', 210, 11, 95, '上架', 'https://placehold.co/100x100'),
('貓咪營養膏', '補充營養的美味零食膏', 260, 11, 75, '上架', 'https://placehold.co/100x100');

-- 狗日常用品 (ID:12)
INSERT INTO products (product_name, product_description, price, category_id, stock_quantity, product_status, image_url) 
VALUES 
('狗狗牽引繩-中型犬', '結實耐用的中型犬牽引繩', 350, 12, 60, '上架', 'https://placehold.co/100x100'),
('狗狗項圈-小型犬', '舒適安全的小型犬項圈', 250, 12, 70, '上架', 'https://placehold.co/100x100'),
('狗狗保暖衣', '冬季保暖的狗狗衣服', 450, 12, 40, '上架', 'https://placehold.co/100x100');

-- 貓日常用品 (ID:13)
INSERT INTO products (product_name, product_description, price, category_id, stock_quantity, product_status, image_url) 
VALUES 
('豪華貓砂盆', '封閉式豪華貓砂盆，減少異味', 650, 13, 45, '上架', 'https://placehold.co/100x100'),
('貓咪抓板', '耐用的貓咪抓板，保護家具', 320, 13, 55, '上架', 'https://placehold.co/100x100'),
('貓咪窩', '柔軟舒適的貓咪睡窩', 580, 13, 35, '上架', 'https://placehold.co/100x100');

-- 狗美容用品 (ID:14)
INSERT INTO products (product_name, product_description, price, category_id, stock_quantity, product_status, image_url) 
VALUES 
('狗狗洗毛精', '溫和清潔的狗狗專用洗毛精', 380, 14, 65, '上架', 'https://placehold.co/100x100'),
('狗狗梳毛刷', '去除廢毛的專業梳毛工具', 280, 14, 75, '上架', 'https://placehold.co/100x100'),
('狗狗指甲剪', '安全剪裁狗狗指甲的工具', 150, 14, 85, '上架', 'https://placehold.co/100x100');

-- 貓美容用品 (ID:15)
INSERT INTO products (product_name, product_description, price, category_id, stock_quantity, product_status, image_url) 
VALUES 
('貓咪洗毛精', '專為貓咪敏感皮膚設計的洗毛精', 400, 15, 60, '上架', 'https://placehold.co/100x100'),
('貓咪除毛手套', '按摩式除毛手套，舒適去除脫落毛髮', 300, 15, 70, '上架', 'https://placehold.co/100x100'),
('貓咪美毛營養霜', '促進毛髮健康的外用營養霜', 480, 15, 50, '上架', 'https://placehold.co/100x100');