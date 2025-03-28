-- Add images column to forum_posts table
ALTER TABLE `forum_posts` 
ADD COLUMN `images` JSON DEFAULT NULL COMMENT '文章圖片URLs的JSON陣列';
