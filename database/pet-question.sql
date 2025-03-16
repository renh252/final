use pet_proj;

-- user_questionnaire - 儲存用戶問卷結果
CREATE TABLE `user_questionnaire` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `living_environment` varchar(50) NOT NULL,
  `activity_level` varchar(50) NOT NULL,
  `experience_level` varchar(50) NOT NULL,
  `time_available` varchar(50) NOT NULL,
  `preferred_size` varchar(50) NOT NULL,
  `preferred_age` varchar(50) NOT NULL,
  `preferred_traits` text,
  `allergies` tinyint(1) DEFAULT '0',
  `has_children` tinyint(1) DEFAULT '0',
  `has_other_pets` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_questionnaire_user` (`user_id`),
  CONSTRAINT `fk_questionnaire_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- pet_recommendation - 儲存推薦結果
CREATE TABLE `pet_recommendation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `pet_id` int NOT NULL,
  `match_score` decimal(5,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_recommendation_user` (`user_id`),
  KEY `fk_recommendation_pet` (`pet_id`),
  CONSTRAINT `fk_recommendation_pet` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_recommendation_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;