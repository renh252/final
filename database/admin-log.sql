use pet_proj;
-- 創建管理員操作日誌表
CREATE TABLE `admin_operation_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int NOT NULL,
  `action_type` varchar(50) NOT NULL COMMENT '操作類型：登入、登出、新增、修改、刪除等',
  `module` varchar(50) NOT NULL COMMENT '操作模組：會員、寵物、商品、文章等',
  `target_id` int DEFAULT NULL COMMENT '操作對象ID',
  `details` text NOT NULL COMMENT '詳細操作內容',
  `ip_address` varchar(45) DEFAULT NULL COMMENT '操作者IP地址',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作時間',
  PRIMARY KEY (`id`),
  KEY `idx_admin_id` (`admin_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_action_type` (`action_type`),
  KEY `idx_module` (`module`),
  CONSTRAINT `fk_admin_logs_admin_id` FOREIGN KEY (`admin_id`) REFERENCES `manager` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='管理員操作日誌';



-- 插入模擬的管理員操作日誌
INSERT INTO `admin_operation_logs` 
(`admin_id`, `action_type`, `module`, `target_id`, `details`, `ip_address`, `created_at`) 
VALUES
-- weng (id=1) 的操作記錄
(1, 'LOGIN', 'SYSTEM', NULL, '管理員登入系統', '192.168.1.100', '2024-03-15 09:00:00'),
(1, 'UPDATE', 'MEMBER', 25, '更新會員資料：修改聯絡電話', '192.168.1.100', '2024-03-15 09:15:23'),
(1, 'DELETE', 'MEMBER', 30, '刪除停用會員帳號', '192.168.1.100', '2024-03-15 09:30:45'),
(1, 'LOGOUT', 'SYSTEM', NULL, '管理員登出系統', '192.168.1.100', '2024-03-15 17:30:00'),

-- ren (id=2) 的寵物管理相關操作
(2, 'LOGIN', 'SYSTEM', NULL, '管理員登入系統', '192.168.1.101', '2024-03-15 08:30:00'),
(2, 'CREATE', 'PET', 101, '新增寵物資料：米克斯成年貓', '192.168.1.101', '2024-03-15 08:45:12'),
(2, 'UPDATE', 'PET', 95, '更新寵物狀態：已完成結紮手術', '192.168.1.101', '2024-03-15 10:20:33'),
(2, 'UPDATE', 'PET', 88, '更新寵物狀態：已被領養', '192.168.1.101', '2024-03-15 14:15:27'),
(2, 'LOGOUT', 'SYSTEM', NULL, '管理員登出系統', '192.168.1.101', '2024-03-15 18:00:00'),

-- sheng (id=3) 的捐款相關操作
(3, 'LOGIN', 'SYSTEM', NULL, '管理員登入系統', '192.168.1.102', '2024-03-15 09:15:00'),
(3, 'CREATE', 'DONATION', 156, '新增捐款記錄：台幣 5000 元', '192.168.1.102', '2024-03-15 09:45:18'),
(3, 'UPDATE', 'DONATION', 155, '更新捐款狀態：已開立收據', '192.168.1.102', '2024-03-15 11:30:42'),
(3, 'LOGOUT', 'SYSTEM', NULL, '管理員登出系統', '192.168.1.102', '2024-03-15 17:45:00'),

-- ching (id=4) 的商店相關操作
(4, 'LOGIN', 'SYSTEM', NULL, '管理員登入系統', '192.168.1.103', '2024-03-15 08:00:00'),
(4, 'CREATE', 'PRODUCT', 89, '新增商品：優質貓砂 10kg裝', '192.168.1.103', '2024-03-15 08:30:15'),
(4, 'UPDATE', 'PRODUCT', 75, '更新商品庫存：補貨 50 件', '192.168.1.103', '2024-03-15 09:20:44'),
(4, 'UPDATE', 'PRODUCT', 82, '更新商品價格：調整為 299 元', '192.168.1.103', '2024-03-15 13:45:30'),
(4, 'DELETE', 'PRODUCT', 70, '下架已售罄商品', '192.168.1.103', '2024-03-15 15:30:22'),
(4, 'LOGOUT', 'SYSTEM', NULL, '管理員登出系統', '192.168.1.103', '2024-03-15 17:15:00'),

-- ting (id=5) 的文章相關操作
(5, 'LOGIN', 'SYSTEM', NULL, '管理員登入系統', '192.168.1.104', '2024-03-15 09:30:00'),
(5, 'CREATE', 'POST', 45, '發布新文章：寵物健康檢查指南', '192.168.1.104', '2024-03-15 10:15:33'),
(5, 'UPDATE', 'POST', 42, '更新文章內容：補充疫苗資訊', '192.168.1.104', '2024-03-15 11:45:21'),
(5, 'DELETE', 'POST', 38, '刪除過期活動文章', '192.168.1.104', '2024-03-15 14:30:17'),
(5, 'LOGOUT', 'SYSTEM', NULL, '管理員登出系統', '192.168.1.104', '2024-03-15 18:15:00'),

-- 今天的一些操作記錄
(1, 'LOGIN', 'SYSTEM', NULL, '管理員登入系統', '192.168.1.100', NOW() - INTERVAL 2 HOUR),
(1, 'UPDATE', 'MEMBER', 28, '更新會員等級：升級為 VIP', '192.168.1.100', NOW() - INTERVAL 1 HOUR),
(2, 'LOGIN', 'SYSTEM', NULL, '管理員登入系統', '192.168.1.101', NOW() - INTERVAL 3 HOUR),
(2, 'CREATE', 'PET', 102, '新增寵物資料：米克斯幼犬', '192.168.1.101', NOW() - INTERVAL 30 MINUTE),
(4, 'LOGIN', 'SYSTEM', NULL, '管理員登入系統', '192.168.1.103', NOW() - INTERVAL 4 HOUR),
(4, 'UPDATE', 'PRODUCT', 90, '更新商品促銷資訊', '192.168.1.103', NOW() - INTERVAL 15 MINUTE);

-- 創建觸發器，在刪除管理員時檢查是否有相關日誌
DROP TRIGGER IF EXISTS before_delete_manager;

DELIMITER //
CREATE TRIGGER before_delete_manager 
BEFORE DELETE ON manager
FOR EACH ROW
BEGIN
    DECLARE log_count INT;
    SELECT COUNT(*) INTO log_count 
    FROM admin_operation_logs 
    WHERE admin_id = OLD.id;
    
    IF log_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = '無法刪除此管理員，因為存在相關的操作日誌記錄';
    END IF;
END //
DELIMITER ;