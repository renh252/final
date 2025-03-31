-- Add image_url column to forum_posts table
ALTER TABLE forum_posts ADD COLUMN image_url VARCHAR(255) DEFAULT NULL AFTER content;
