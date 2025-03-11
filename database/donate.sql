-- 創建個案資料表
CREATE TABLE cases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL
);

-- 創建個案圖片資料表
CREATE TABLE case_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_id INT,
  image_url VARCHAR(255) NOT NULL,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

-- 插入個案資料
INSERT INTO cases (title, content) VALUES
('高雄浪喵遭橡皮圈勒喉頭腫如皮球', '台灣動物緊急救援小組前往高雄路竹救援一隻頭部明顯腫脹的浪貓，這隻貓咪的脖子被一條橡皮圈緊繞，陷入深層，阻礙血液循環，頭腫如皮球一般。台灣動物緊急救援小組救援團隊成功誘捕貓咪後，立即送往動物醫院進行醫療與安置。\n\n台灣動物緊急救援小組救援過許多因橡皮筋造成勒傷的案例，多數為流浪貓狗覓食將頭伸入便當盒中造成，在長期的摩擦與橡皮筋會越束越緊的特性之下，造成被勒住的部位被摩擦甚至嵌入皮肉中，甚至造成開放的傷口或切開氣管，嚴重者甚至會喪命。希望大家在外食用便當時，可將橡皮筋直接丟棄或採斜對角方式綑綁，減少悲劇發生的機率。');

-- 取得新增的個案ID（假設為1）
-- 插入圖片資料
INSERT INTO case_images (case_id, image_url) VALUES
(1, 'https://www.savedogs.org/upload/ckeditor/forum_photos/followup/2024-12-29/R01.jpg'),
(1, 'https://www.savedogs.org/upload/ckeditor/forum_photos/followup/2024-12-29/R03.jpg'),
(1, 'https://www.savedogs.org/upload/ckeditor/forum_photos/followup/2024-12-29/R04.jpg');

-- 第二筆資料
INSERT INTO cases (title, content) VALUES
('巨瘤吞半邊臉的小黃狗', '台灣動物緊急救援小組前往高雄六龜救援一隻臉部腫瘤的浪犬，這隻狗兒臉上有一顆巨大腫瘤，幾乎吞噬半張左臉，且相當虛弱。台灣動物緊急救援小組救援團隊順利救援病犬後立即送往動物醫院檢查治療。');

INSERT INTO case_images (case_id, image_url) VALUES
(2, 'https://www.savedogs.org/upload/ckeditor/forum_photos/followup/2025-02-12/R01.jpg'),
(2, 'https://www.savedogs.org/upload/ckeditor/forum_photos/followup/2025-02-12/R02.jpg'),
(2,'https://www.savedogs.org/upload/ckeditor/forum_photos/followup/2025-02-12/R03.jpg');

-- 第三筆資料
INSERT INTO cases (title, content) VALUES
('新北市流浪貓救援，傷勢嚴重獲醫治', '一隻流浪貓在新北市被發現傷勢嚴重，經過動物救援小組的協助，將貓咪送到醫院治療，並且進行了手術。經過一段時間的醫療照護，貓咪康復，並被送到愛心家庭。');

INSERT INTO case_images (case_id, image_url) VALUES
(3, 'https://www.savedogs.org/upload/ckeditor/forum_photos/followup/2024-06-06/R00.jpg'),
(3, 'https://www.savedogs.org/upload/ckeditor/forum_photos/followup/2024-06-06/R01.jpg'),
(3, 'https://www.savedogs.org/upload/ckeditor/forum_photos/followup/2024-06-06/R02.jpg');

-- 第四筆資料
INSERT INTO cases (title, content) VALUES
('高雄流浪狗救援，成功治療並安置', '在高雄的街頭，一隻流浪狗因為受傷無法行動，動物救援小組及時發現並提供了醫療幫助。經過救援，狗狗被治療並安置在安養中心。');

INSERT INTO case_images (case_id, image_url) VALUES
(4, 'https://www.savedogs.org/upload/ckeditor/forum_photos/followup/2024-08-06/R01.jpg'),
(4, 'https://www.savedogs.org/upload/ckeditor/forum_photos/followup/2024-08-06/R02.jpg');

-- 第五筆資料
INSERT INTO cases (title, content) VALUES
('台南市救援傷貓，獲得醫治與康復', '台南市一隻傷貓被發現後，動物救援小組迅速將牠送往醫院治療。經過醫療照護後，貓咪成功康復，並由領養家庭接走。');

INSERT INTO case_images (case_id, image_url) VALUES
(5, 'https://www.savedogs.org/upload/ckeditor/forum_photos/followup/2024-08-02/R00.jpg'),
(5, 'https://www.savedogs.org/upload/ckeditor/forum_photos/followup/2024-08-02/R01.jpg'),
(5,'https://www.savedogs.org/upload/ckeditor/forum_photos/followup/2024-08-02/R02.jpg');

-- 第六筆資料
INSERT INTO cases (title, content) VALUES
('台中市救援受傷流浪狗，成功醫治', '一隻流浪狗在台中市被發現受傷，動物救援小組立即提供醫療幫助，並將狗狗送往醫院進行治療。經過康復，狗狗被領養家庭接走。');

INSERT INTO case_images (case_id, image_url) VALUES
(6, 'https://www.savedogs.org/upload/ckeditor/forum_photos/followup/2024-07-18/R00.jpg'),
(6, 'https://www.savedogs.org/upload/ckeditor/forum_photos/followup/2024-07-18/R01.jpg');

-- 第七筆資料
INSERT INTO cases (title, content) VALUES
('彰化狗狗被釘入刺，救援醫療成功', '一隻狗狗被不明物體釘入傷口，幸好在動物救援小組的幫助下，成功移除異物並進行醫療處置，狗狗迅速康復。');

INSERT INTO case_images (case_id, image_url) VALUES
(7, 'http://www.test.123/image1.jpg'),
(7, 'http://www.test.123/image2.jpg');

-- 第八筆資料
INSERT INTO cases (title, content) VALUES
('高雄流浪貓傷勢嚴重，獲救助及安置', '在高雄，一隻流浪貓遭遇重傷，被動物救援小組救助後，送醫進行醫療。經過治療後，貓咪得以康復並成功找到領養家庭。');

INSERT INTO case_images (case_id, image_url) VALUES
(8, 'https://www.savedogs.org/upload/ckeditor/forum_photos/followup/2024-10-18/R03.jpg'),
(8, 'https://www.savedogs.org/upload/ckeditor/forum_photos/followup/2024-10-18/R01.jpg'),
(8, 'https://www.savedogs.org/upload/ckeditor/forum_photos/followup/2024-10-18/R02.jpg');

