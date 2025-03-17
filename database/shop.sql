-- 修改訂單orders連絡電話結構
ALTER TABLE orders
MODIFY COLUMN recipient_phone VARCHAR(50);