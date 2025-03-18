
-- 創建通知表
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `admin_id` int DEFAULT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `related_id` int DEFAULT NULL,
  `related_type` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `admin_id` (`admin_id`),
  KEY `created_at` (`created_at`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 插入一些測試用的通知數據，使用2025年附近的日期
INSERT INTO `notifications` 
(`user_id`, `admin_id`, `type`, `title`, `message`, `is_read`, `related_id`, `related_type`, `created_at`) 
VALUES
-- 會員通知
(1, NULL, 'appointment_confirmed', '預約確認通知', '您的寵物預約已確認，預約時間：2025-01-30 09:00', 0, 12, 'appointment', '2025-01-21 10:30:00'),
(1, NULL, 'appointment_completed', '預約完成通知', '恭喜您成功領養寵物！', 0, 13, 'appointment', '2024-12-15 14:45:00'),
(1, NULL, 'system', '系統通知', '您的帳戶資訊已更新', 1, NULL, NULL, '2025-01-01 09:15:00'),

(3, NULL, 'appointment_confirmed', '預約確認通知', '您的寵物預約已確認，預約時間：2025-02-05 10:30', 0, 15, 'appointment', '2025-01-16 14:00:00'),
(3, NULL, 'appointment_cancelled', '預約取消通知', '您的預約已取消', 1, 16, 'appointment', '2025-01-22 09:15:00'),

(5, NULL, 'system', '系統通知', '感謝您參與我們的問卷調查', 0, NULL, NULL, '2025-01-15 13:20:00'),
(5, NULL, 'appointment_pending', '預約待確認通知', '您的預約正在審核中，我們會盡快回覆', 0, 17, 'appointment', '2025-01-30 10:30:00'),

-- 管理員通知
(NULL, 1, 'new_appointment', '新預約通知', '有新的預約需要審核', 0, 1, 'appointment', '2025-01-01 08:30:00'),
(NULL, 1, 'new_appointment', '新預約通知', '有新的預約需要審核', 0, 3, 'appointment', '2025-01-02 10:15:00'),
(NULL, 1, 'system', '系統通知', '系統將於今晚23:00-23:30進行維護', 0, NULL, NULL, '2025-01-10 15:45:00'),

(NULL, 2, 'report', '新舉報通知', '有新的內容被舉報，請盡快審核', 0, 5, 'post', '2025-01-05 11:30:00'),
(NULL, 2, 'new_appointment', '新預約通知', '有新的預約需要審核', 1, 17, 'appointment', '2025-01-30 10:30:00'),

-- 最近日期的通知
(1, NULL, 'appointment_reminder', '預約提醒', '提醒您明天有寵物預約', 0, 1, 'appointment', '2025-01-04 09:00:00'),
(4, NULL, 'appointment_reminder', '預約提醒', '提醒您今天有寵物預約', 0, 4, 'appointment', '2025-01-18 08:00:00'),
(6, NULL, 'appointment_confirmed', '預約已確認', '您的預約已確認', 0, 6, 'appointment', '2025-01-06 11:15:00'),

(NULL, 1, 'system', '系統通知', '今日有2個新預約需要處理', 0, NULL, NULL, '2025-01-01 08:00:00'),
(NULL, 2, 'system', '系統通知', '有3筆預約狀態需要更新', 0, NULL, NULL, '2025-01-01 08:15:00');