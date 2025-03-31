CREATE TABLE `password_reset_tokens` (
   `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
   `email` VARCHAR(191) COLLATE utf8mb4_unicode_ci NOT NULL,
   `token` VARCHAR(191) COLLATE utf8mb4_unicode_ci NOT NULL,
   `expires_at` TIMESTAMP(3) NOT NULL,
   `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
   PRIMARY KEY (`id`),
   UNIQUE KEY `email_unique` (`email`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;