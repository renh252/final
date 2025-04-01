-- 更新所有預約資料至2025/3/20~2025/4/30之間
-- 方法是將預約均勻分佈在這段期間，並特別安排一些預約在4/11（主要展示日）

-- 第一步：先找出所有預約數量，以便我們均勻分佈
-- SELECT COUNT(*) FROM pet_appointment;

-- 第二步：更新預約日期，將其分佈在指定時間範圍內

-- 將部分預約安排在展示日4/11
UPDATE pet_appointment 
SET appointment_date = '2025-04-11',
    updated_at = NOW() 
WHERE id % 5 = 0;

-- 將部分預約安排在3/20-3/31之間
UPDATE pet_appointment 
SET appointment_date = DATE_ADD('2025-03-20', INTERVAL (id % 10) DAY),
    updated_at = NOW() 
WHERE id % 5 = 1;

-- 將部分預約安排在4/1-4/10之間
UPDATE pet_appointment 
SET appointment_date = DATE_ADD('2025-04-01', INTERVAL (id % 9) DAY),
    updated_at = NOW() 
WHERE id % 5 = 2;

-- 將部分預約安排在4/12-4/20之間
UPDATE pet_appointment 
SET appointment_date = DATE_ADD('2025-04-12', INTERVAL (id % 8) DAY),
    updated_at = NOW() 
WHERE id % 5 = 3;

-- 將部分預約安排在4/21-4/30之間
UPDATE pet_appointment 
SET appointment_date = DATE_ADD('2025-04-21', INTERVAL (id % 9) DAY),
    updated_at = NOW() 
WHERE id % 5 = 4;

-- 確保展示日4/11有各種狀態的預約
UPDATE pet_appointment 
SET appointment_date = '2025-04-11',
    status = 'pending',
    updated_at = NOW()
WHERE id % 20 = 1;

UPDATE pet_appointment 
SET appointment_date = '2025-04-11',
    status = 'approved',
    updated_at = NOW()
WHERE id % 20 = 3;

UPDATE pet_appointment 
SET appointment_date = '2025-04-11',
    status = 'completed',
    updated_at = NOW()
WHERE id % 20 = 5;

UPDATE pet_appointment 
SET appointment_date = '2025-04-11',
    status = 'cancelled',
    updated_at = NOW()
WHERE id % 20 = 7;

-- 更新時間，使其在正常工作時間內（上午9點到下午6點）
UPDATE pet_appointment 
SET appointment_time = CONCAT(
    LPAD(9 + (id % 9), 2, '0'),  -- 9點到17點
    ':',
    LPAD((id * 13) % 60, 2, '0'),  -- 隨機分鐘
    ':00'
);