-- 新增orders表欄位-運費、折扣
ALTER TABLE orders
ADD COLUMN shipping_fee INT NOT NULL DEFAULT 0 AFTER total_price,
ADD COLUMN total_discount INT NOT NULL DEFAULT 0 AFTER total_price;
