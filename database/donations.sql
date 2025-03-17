-- donations資料表修改

-- 1️⃣ 先備份原表格 (可選)
CREATE TABLE donations_backup AS SELECT * FROM donations;

UPDATE donations 
SET payment_method = 'Credit' 
WHERE payment_method NOT IN ('Credit', 'ATM', 'CVS') OR payment_method IS NULL;

-- 2️⃣ 修改 `donations` 表
ALTER TABLE donations
    ADD COLUMN trade_no VARCHAR(50) UNIQUE AFTER donor_email,
    ADD COLUMN transaction_status VARCHAR(20) NOT NULL DEFAULT 'pending' AFTER trade_no,
    DROP COLUMN regular_payment_date,
    DROP COLUMN is_anonymous,
    DROP COLUMN is_receipt_needed,
    MODIFY COLUMN payment_method ENUM('ATM', 'Credit', 'CVS', 'CreditPeriod') NOT NULL;