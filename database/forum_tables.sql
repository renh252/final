-- 刪除現有的表（如果存在）
DROP TABLE IF EXISTS forum_likes;
DROP TABLE IF EXISTS forum_comments;
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
    tags VARCHAR(255),
    view_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES forum_categories(id) ON DELETE CASCADE
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
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 創建論壇點讚表
CREATE TABLE IF NOT EXISTS forum_likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_like (post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 插入基本分類數據
INSERT INTO forum_categories (name, slug, description, `order`) VALUES 
('寵物照護', 'pet-care', '分享寵物日常照護經驗與建議', 1),
('寵物健康', 'pet-health', '討論寵物健康相關議題', 2),
('寵物行為', 'pet-behavior', '探討寵物行為與訓練方法', 3),
('領養資訊', 'adoption', '分享領養經驗與資訊', 4),
('寵物用品', 'pet-products', '討論寵物用品推薦與心得', 5);

-- 插入測試文章
INSERT INTO forum_posts (title, content, user_id, category_id, tags, view_count, like_count, comment_count) VALUES
('新手養貓需要準備什麼？', '我想領養一隻貓，請問需要準備哪些用品？希望大家可以分享經驗。', 1, 1, '新手,貓咪,準備工作', 0, 0, 0),
('狗狗不吃飯怎麼辦？', '我家的狗狗最近食慾不太好，有什麼建議嗎？', 1, 2, '狗狗,健康,飲食', 0, 0, 0);

-- 插入測試評論
INSERT INTO forum_comments (post_id, user_id, content) VALUES
(1, 1, '建議準備貓砂盆、貓砂、飼料、飲水器、貓抓板等基本用品。'),
(2, 1, '建議帶去獸醫院檢查，可能是身體不適。');
