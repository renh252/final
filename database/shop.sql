-- 更新訂單假資料
UPDATE `orders` SET`total_price`=7500,user_id='1',invoice_method='手機載具',`recipient_phone`='095555555',`remark`='測試',`shipping_method`='宅配',`shipping_address`='台南市永康區111號',`payment_method`='信用卡' WHERE order_id='ORD00002';
UPDATE `orders` SET`total_price`=7500,`order_status`='已完成',`recipient_phone`='095555555',`remark`='測試',`shipping_method`='宅配',`shipping_address`='台南市永康區111號',`payment_method`='信用卡',`tracking_number`='GH12555',`shipped_at`='2025-01-16 12:20:07',`finish_at`='2025-01-16 15:20:07' WHERE order_id='ORD00001';

-- 更新商品收藏欄位
DROP TABLE IF EXISTS `product_like`;

CREATE TABLE `product_like` (
    `user_id` INT NOT NULL,
    `product_id` INT NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`, `product_id`)
);
INSERT INTO `product_like` (`user_id`, `product_id`, `created_at`)
VALUES (1, 1, NOW());
