-- 先檢查並刪除資料表(如果存在)，然後重新創建
DROP TABLE IF EXISTS `pet_appointment`;

-- 重新創建pet_appointment資料表，修正appointment_date和appointment_time欄位類型
CREATE TABLE `pet_appointment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `pet_id` int NOT NULL,
  `appointment_date` date DEFAULT NULL,
  `appointment_time` time DEFAULT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `house_type` varchar(50) DEFAULT NULL,
  `adult_number` int DEFAULT NULL,
  `child_number` int DEFAULT NULL,
  `adopted_experience` tinyint(1) DEFAULT NULL,
  `other_pets` text,
  `note` text,
  `store_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `pet_id` (`pet_id`),
  KEY `store_id` (`store_id`),
  CONSTRAINT `pet_appointment_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `pet_appointment_ibfk_2` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`),
  CONSTRAINT `pet_appointment_ibfk_3` FOREIGN KEY (`store_id`) REFERENCES `pet_store` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 插入測試資料到pet_appointment表，使用2025年附近的日期
INSERT INTO `pet_appointment` 
(`user_id`, `pet_id`, `appointment_date`, `appointment_time`, `status`, `created_at`, `updated_at`, 
`house_type`, `adult_number`, `child_number`, `adopted_experience`, `other_pets`, `note`, `store_id`) 
VALUES
-- 待審核狀態預約 (近期)
(1, 1, '2025-01-05', '10:00:00', 'pending', '2025-01-01 08:30:00', '2025-01-01 08:30:00', 
'apartment', 2, 1, 1, '有一隻貓', '希望能夠盡快安排', 1),
(3, 4, '2025-01-08', '14:30:00', 'pending', '2025-01-02 10:15:00', '2025-01-02 10:15:00', 
'house', 3, 0, 0, '沒有其他寵物', '第一次領養寵物，希望能得到一些指導', 2),
(5, 7, '2025-01-10', '11:00:00', 'pending', '2025-01-03 09:45:00', '2025-01-03 09:45:00', 
'apartment', 1, 0, 1, '之前養過狗', '住在公寓五樓，有電梯', 3),
(7, 10, '2025-01-12', '16:00:00', 'pending', '2025-01-04 14:30:00', '2025-01-04 14:30:00', 
'house', 2, 2, 0, '家中有兩隻貓', '孩子很期待見到新寵物', 5),
-- 已確認狀態預約
(2, 5, '2025-01-15', '09:30:00', 'approved', '2025-01-02 11:20:00', '2025-01-03 09:10:00', 
'house', 4, 2, 1, '有一隻大型犬', '家中有大花園適合寵物活動', 3),
(4, 12, '2025-01-18', '13:00:00', 'approved', '2025-01-03 15:45:00', '2025-01-04 10:30:00', 
'apartment', 2, 0, 1, '無', '希望領養一隻安靜的寵物', 4),
(6, 18, '2025-01-20', '15:30:00', 'approved', '2025-01-05 12:00:00', '2025-01-06 11:15:00', 
'house', 3, 1, 1, '有兩隻貓', '家中環境寬敞', 6),
-- 已完成狀態預約 (過去日期)
(9, 20, '2024-12-20', '10:00:00', 'completed', '2024-12-15 09:30:00', '2024-12-20 11:45:00', 
'house', 2, 3, 1, '無', '已成功領養', 4),
(10, 25, '2024-12-22', '14:00:00', 'completed', '2024-12-17 13:20:00', '2024-12-22 15:30:00', 
'apartment', 2, 0, 0, '無', '初次養寵物，已順利領養', 1),
-- 已取消狀態預約
(8, 30, '2025-01-25', '11:30:00', 'cancelled', '2025-01-10 10:00:00', '2025-01-11 09:15:00', 
'apartment', 1, 0, 1, '有一隻小型犬', '因個人因素需取消預約', 5),
(11, 35, '2025-01-28', '16:30:00', 'cancelled', '2025-01-12 14:30:00', '2025-01-13 10:00:00', 
'house', 2, 1, 0, '無', '臨時有事無法前往', 9),
-- 用戶1的多個預約記錄
(1, 40, '2025-01-30', '09:00:00', 'approved', '2025-01-20 08:45:00', '2025-01-21 10:30:00', 
'house', 2, 1, 1, '有一隻貓', '希望能找到適合與現有寵物相處的夥伴', 7),
(1, 45, '2024-12-15', '13:30:00', 'completed', '2024-12-10 15:00:00', '2024-12-15 14:45:00', 
'house', 2, 1, 1, '有一隻貓和一隻狗', '已成功領養第二隻寵物', 3),
(1, 50, '2025-02-10', '15:00:00', 'pending', '2025-01-25 09:30:00', '2025-01-25 09:30:00', 
'house', 2, 1, 1, '有兩隻貓和一隻狗', '希望能夠擴大寵物家庭', 6),
-- 用戶3的多個預約記錄
(3, 55, '2025-02-05', '10:30:00', 'approved', '2025-01-15 11:15:00', '2025-01-16 14:00:00', 
'apartment', 3, 0, 0, '無', '首次養寵物，已經做好充分準備', 7),
(3, 60, '2025-02-15', '14:00:00', 'cancelled', '2025-01-20 13:45:00', '2025-01-22 09:15:00', 
'apartment', 3, 0, 0, '無', '臨時工作調動，需要取消', 2),
-- 未來日期的預約
(5, 65, '2025-02-20', '11:00:00', 'pending', '2025-01-30 10:30:00', '2025-01-30 10:30:00', 
'house', 2, 2, 1, '有一隻小型犬', '希望找到適合孩子的寵物', 7),
(7, 70, '2025-02-25', '15:30:00', 'approved', '2025-01-30 13:00:00', '2025-01-31 11:45:00', 
'house', 4, 1, 1, '有兩隻貓', '家中環境寬敞，可以提供良好的生活環境', 6),
(9, 75, '2025-03-01', '10:00:00', 'pending', '2025-02-01 09:15:00', '2025-02-01 09:15:00', 
'apartment', 2, 0, 1, '無', '有豐富的寵物飼養經驗', 5),
-- 最近日期的預約
(4, 8, '2025-01-02', '09:30:00', 'pending', '2025-01-01 09:30:00', '2025-01-01 09:30:00', 
'house', 2, 1, 0, '沒有其他寵物', '希望能儘快與心儀的寵物見面', 3),
(6, 14, '2025-01-03', '14:00:00', 'approved', '2025-01-01 14:00:00', '2025-01-01 20:30:00', 
'apartment', 1, 0, 1, '有一隻貓', '已確認的預約', 7);