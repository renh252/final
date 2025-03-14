INSERT INTO `product_reviews`(`review_id`, `order_item_id`, `user_id`, `product_id`, `variant_id`, `rating`, `review_text`, `created_at`) VALUES
(1, 1, 1, 1, 1, 5, '狗狗很喜歡這款乾糧，品質很好！', '2025-03-10 10:00:00'),
(2, 11, 3, 1, 1, 4, '味道不錯，狗狗吃得很開心，但希望包裝可以改進。', '2025-03-10 10:05:00'),
(3, 21, 5, 1, 1, 3, '一般般，狗狗吃得還行，但比預期中貴了一點。', '2025-03-10 10:10:00');

-- 4. Shopping_Cart (購物車) **不開表，使用 localstorage 處理
CREATE TABLE Shopping_Cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    product_id INT,
    variant_id INT,
    quantity INT DEFAULT 1,
    update_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    foreign key (user_id) references Users(user_id),
    FOREIGN KEY (product_id) REFERENCES Products(product_id),
    FOREIGN KEY (variant_id) REFERENCES Product_Variants(variant_id)
);

INSERT INTO Shopping_Cart (user_id, product_id, variant_id, quantity, update_at) VALUES
(1, 1, 1, 2, NOW()),  -- 狗乾糧，變體 A，數量 2
(1, 2, 2, 1, NOW()),  -- 狗罐頭，變體 A，數量 1
(1, 3, 3, 3, NOW()),  -- 貓乾糧，變體 A，數量 3
(1, 4, 4, 1, NOW()),  -- 貓罐頭，變體 A，數量 1
(1, 5, 5, 2, NOW());  -- 寵物零食，變體 A，數量 2
