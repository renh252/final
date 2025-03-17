-- 首先添加經緯度欄位
ALTER TABLE pet_store 
ADD COLUMN lat DECIMAL(10, 6),
ADD COLUMN lng DECIMAL(10, 6);

-- 更新台北市店 (ID 1)
UPDATE pet_store 
SET lat = 25.0420, lng = 121.5655 
WHERE id = 1;

-- 更新台南東區店 (原ID 2)
UPDATE pet_store 
SET address = '台南市東區大東路229號', 
    lat = 22.9824, lng = 120.2254 
WHERE id = 2;

-- 更新台南中西區店 (ID 3)
UPDATE pet_store 
SET lat = 22.9896, lng = 120.2026 
WHERE id = 3;

-- 更新高雄市店 (ID 4)
UPDATE pet_store 
SET lat = 22.6314, lng = 120.3014 
WHERE id = 4;

-- 更新 ID=5 的寵物商店 (高雄市)
UPDATE pet_store 
SET 
  address = '高雄市鼓山區美術東二路99號', 
  lat = 22.6607, 
  lng = 120.2848
WHERE id = 5;

-- 更新台南安南區店 (原ID 6)
UPDATE pet_store 
SET address = '台南市安南區安和路一段208號', 
    lat = 23.0401, lng = 120.1413 
WHERE id = 6;

-- 更新 ID=7 的寵物商店 (桃園市)
UPDATE pet_store 
SET 
  address = '桃園市桃園區中正路108號', 
  lat = 24.9936, 
  lng = 121.3010
WHERE id = 7;

-- 更新 ID=8 的寵物商店 (新北市)
UPDATE pet_store 
SET 
  address = '新北市板橋區文化路一段360號', 
  lat = 25.0132, 
  lng = 121.4568
WHERE id = 8;

-- 更新 ID=9 的寵物商店 (新竹市)
UPDATE pet_store 
SET 
  address = '新竹市東區光復路二段101號', 
  lat = 24.7868, 
  lng = 120.9967
WHERE id = 9;

-- 更新 ID=10 的寵物商店 (基隆市)
UPDATE pet_store 
SET 
  address = '基隆市中正區義一路43號', 
  lat = 25.1286, 
  lng = 121.7425
WHERE id = 10;