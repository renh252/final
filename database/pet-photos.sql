use pet_proj;
-- 寵物照片表結構
CREATE TABLE `pet_photos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pet_id` int NOT NULL,
  `photo_url` varchar(255) NOT NULL,
  `is_main` tinyint(1) DEFAULT 0,
  `sort_order` int DEFAULT 0,
  `title` varchar(100) DEFAULT NULL,
  `description` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `pet_id` (`pet_id`),
  CONSTRAINT `pet_photos_ibfk_1` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 插入測試數據
INSERT INTO `pet_photos` (`pet_id`, `photo_url`, `is_main`, `sort_order`, `title`, `description`) VALUES
(1, '/images/pets/pet1_main.jpg', 1, 0, '主照片', '可愛的正面照'),
(1, '/images/pets/pet1_play.jpg', 0, 1, '玩耍照', '在草地上玩耍的照片'),
(1, '/images/pets/pet1_sleep.jpg', 0, 2, '睡覺照', '睡覺的可愛模樣'),
(2, '/images/pets/pet2_main.jpg', 1, 0, '主照片', '優雅的坐姿'),
(2, '/images/pets/pet2_outdoor.jpg', 0, 1, '戶外照', '在戶外探索的照片'),
(3, '/images/pets/pet3_main.jpg', 1, 0, '主照片', '正面特寫'),
(3, '/images/pets/pet3_play.jpg', 0, 1, '玩耍照', '玩玩具的照片'),
(4, '/images/pets/pet4_main.jpg', 1, 0, '主照片', '可愛的笑容'),
(4, '/images/pets/pet4_run.jpg', 0, 1, '奔跑照', '在公園奔跑的照片'),
(5, '/images/pets/pet5_main.jpg', 1, 0, '主照片', '慵懶的姿態'); 