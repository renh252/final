-- 新增一欄用來呈現用戶在後台的註冊時間
ALTER TABLE users
ADD COLUMN created_at TIMESTAMP;
UPDATE users
SET created_at = '2025-01-01'
WHERE user_id = 1;

UPDATE users
SET created_at = '2025-01-02'
WHERE user_id = 2;

UPDATE users
SET created_at = '2025-01-03'
WHERE user_id = 3;

UPDATE users
SET created_at = '2025-01-04'
WHERE user_id = 4;

UPDATE users
SET created_at = '2025-01-05'
WHERE user_id = 5;

UPDATE users
SET created_at = '2025-01-06'
WHERE user_id = 6;

UPDATE users
SET created_at = '2025-01-07'
WHERE user_id = 7;

UPDATE users
SET created_at = '2025-01-08'
WHERE user_id = 8;

UPDATE users
SET created_at = '2025-01-09'
WHERE user_id = 9;

UPDATE users
SET created_at = '2025-01-10'
WHERE user_id = 10;

UPDATE users
SET created_at = '2025-01-11'
WHERE user_id = 11;

UPDATE users
SET created_at = '2025-01-12'
WHERE user_id = 12;

UPDATE users
SET created_at = '2025-01-13'
WHERE user_id = 13;

UPDATE users
SET created_at = '2025-01-14'
WHERE user_id = 14;

UPDATE users
SET created_at = '2025-01-15'
WHERE user_id = 15;

UPDATE users
SET created_at = '2025-01-16'
WHERE user_id = 16;

UPDATE users
SET created_at = '2025-01-17'
WHERE user_id = 17;

UPDATE users
SET created_at = '2025-01-18'
WHERE user_id = 18;

UPDATE users
SET created_at = '2025-01-19'
WHERE user_id = 19;