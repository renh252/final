-- 刪除現有的表（如果存在）
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS forum_likes;
DROP TABLE IF EXISTS forum_comment_replies;
DROP TABLE IF EXISTS forum_comments;
DROP TABLE IF EXISTS forum_post_tags;
DROP TABLE IF EXISTS forum_tags;
DROP TABLE IF EXISTS forum_posts;
DROP TABLE IF EXISTS forum_categories;

-- 創建論壇分類表
CREATE TABLE IF NOT EXISTS forum_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_id INT,
    `order` INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES forum_categories(id) ON DELETE SET NULL
);

-- 創建論壇文章表
CREATE TABLE IF NOT EXISTS forum_posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    view_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES forum_categories(id) ON DELETE CASCADE
);


-- 創建論壇標籤表
CREATE TABLE IF NOT EXISTS forum_tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 創建論壇文章與標籤的關聯表
CREATE TABLE IF NOT EXISTS forum_post_tags (
    post_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES forum_tags(id) ON DELETE CASCADE
);

-- 創建論壇評論表
CREATE TABLE IF NOT EXISTS forum_comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 創建論壇點讚表
CREATE TABLE IF NOT EXISTS forum_likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_like (post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 插入基本分類數據
INSERT INTO forum_categories (name, slug, description, `order`) VALUES 
('寵物照護', 'pet-care', '分享寵物日常照護經驗與建議', 1),
('寵物健康', 'pet-health', '討論寵物健康相關議題', 2),
('寵物行為', 'pet-behavior', '探討寵物行為與訓練方法', 3),
('領養資訊', 'adoption', '分享領養經驗與資訊', 4),
('寵物用品', 'pet-products', '討論寵物用品推薦與心得', 5);

-- 插入測試文章
INSERT INTO forum_posts (title, content, user_id, category_id, view_count, like_count, comment_count) VALUES
('新手養貓需要準備什麼？', '我想領養一隻貓，請問需要準備哪些用品？希望大家可以分享經驗。', 1, 1, 0, 0, 0),
('狗狗不吃飯怎麼辦？', '我家的狗狗最近食慾不太好，有什麼建議嗎？', 1, 2, 0, 0, 0);

-- 插入標籤
INSERT INTO forum_tags (name, slug, created_at) VALUES 
('新手', 'newbie', CURRENT_TIMESTAMP),
('貓咪', 'cat', CURRENT_TIMESTAMP),
('準備工作', 'preparation', CURRENT_TIMESTAMP),
('狗狗', 'dog', CURRENT_TIMESTAMP),
('健康', 'health', CURRENT_TIMESTAMP),
('飲食', 'diet', CURRENT_TIMESTAMP);

-- 插入文章與標籤的關聯
INSERT INTO forum_post_tags (post_id, tag_id) VALUES
(1, 1), (1, 2), (1, 3), -- 文章 1: 新手, 貓咪, 準備工作
(2, 4), (2, 5), (2, 6); -- 文章 2: 狗狗, 健康, 飲食

-- 插入測試評論
INSERT INTO forum_comments (post_id, user_id, content) VALUES
(1, 1, '建議準備貓砂盆、貓砂、飼料、飲水器、貓抓板等基本用品。'),
(2, 1, '建議帶去獸醫院檢查，可能是身體不適。');

-- 插入測試點讚
INSERT INTO forum_likes (post_id, user_id) VALUES
(1, 1), -- 文章 1 被使用者 1 點讚
(2, 1); -- 文章 2 被使用者 1 點讚


SET FOREIGN_KEY_CHECKS = 1;