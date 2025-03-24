//app\member\page.js
'use client';

import React, { useEffect, useState } from 'react';
import styles from "./member.module.css";
import { useRouter } from 'next/navigation';

export default function MemberPage() {
  const [userData, setUserData] = useState(null); // 保存使用者資料
  const [isEditing, setIsEditing] = useState(false); // 編輯狀態
  const [formData, setFormData] = useState({
    user_name: '',
    user_number: '',
    user_birthday: '',
    user_address: '',
    user_level: '',
  });

  const formatDate = (date) => {
    const formattedDate = new Date(date);
    return formattedDate.toISOString().split('T')[0]; // 格式化成 yyyy-MM-dd
  };

  useEffect(() => {
    // 當頁面載入時，獲取使用者資料
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token'); // token 被存儲在 localStorage 中
        const response = await fetch('/api/user', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`, // 設置 Authorization 標頭
          },
        }); 
        // /api/user 是獲取使用者資料的 API
        if (response.ok) {
          const data = await response.json();
          setUserData(data); // 更新使用者資料
          setFormData(data); // 初始化表單資料
        } else {
          console.error('獲取使用者資料失敗:', response.statusText);
        }
      } catch (error) {
        console.error('錯誤:', error.message);
      }
    };

    fetchUserData();
  }, []);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setFormData(userData); // 還原原本的使用者資料
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setUserData(updatedData); // 更新使用者資料
        setIsEditing(false);
      } else {
        console.error('更新失敗');
      }
    } catch (error) {
      console.error('更新使用者資料失敗:', error.message);
    }
  };

  return (
    <>
      <main className={styles.profile_page}>
        <div className={styles.member_container}>
          <section className={styles.profile_section}>
            <div className={styles.profile_photos}>
              <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/c07e5bb4325caeb94efd091416f6964123f3611a" alt="大頭照" className="profile-photo" />
              {isEditing ? (
                <select name="user_level" value={formData.user_level} onChange={handleChange}>
                  <option value="">請選擇暱稱</option>
                  <option value="愛心小天使">愛心小天使</option>
                  <option value="乾爹乾媽">乾爹乾媽</option>
                  <option value="拔鼻媽咪">拔鼻媽咪</option>
                  <option value="超級拔鼻媽咪">超級拔鼻媽咪</option>
                </select>
              ) : (
                <p>暱稱：{userData?.user_level}</p>
              )}
            </div>

            <div className={styles.profile_content}>
              <h3 className={styles.profile_title}>個人資料</h3>
              <div className={styles.profile_group}>
                {isEditing ? (
                  <>
                    <label className={styles.form_label}>
                      姓名：
                      <input type="text" name="user_name" value={formData.user_name} onChange={handleChange} />
                    </label>
                    <hr />
                    <label className={styles.form_label}>
                      電話：
                      <input type="text" name="user_number" value={formData.user_number} onChange={handleChange} />
                    </label>
                    <hr />
                    <label className={styles.form_label}>
                      生日：
                      <input type="date" name="user_birthday" 
                      value={formatDate(formData.user_birthday)} 
                      onChange={handleChange}  />
                    </label>
                    <hr />
                    <label className={styles.form_label}>
                      地址：
                      <input type="text" name="user_address" value={formData.user_address} onChange={handleChange} />
                    </label>
                  </>
                ) : (
                  <>
                    <label className={styles.form_label}>姓名：{userData?.user_name}</label>
                    <hr />
                    <label className={styles.form_label}>電話：{userData?.user_number}</label>
                    <hr />
                    <label className={styles.form_label}>生日：{userData?.user_birthday}</label>
                    <hr />
                    <label className={styles.form_label}>論壇ID：{userData?.user_nickname}</label>
                    <hr />
                    <label className={styles.form_label}>地址：{userData?.user_address}</label>
                    <hr />
                  </>
                )}
              </div>

              <div className={styles.edit_but}>
                {isEditing ? (
                  <>
                    <button onClick={handleSubmit} className="button" style={{ width: '100px', height: '40px', fontSize: '20px' }}>確認</button>
                    <button onClick={handleCancelClick} className="button" style={{ width: '100px', height: '40px', fontSize: '20px' }}>取消</button>
                  </>
                ) : (
                  <button onClick={handleEditClick} className="button" style={{ width: '150px', height: '40px', fontSize: '20px' }}>修改資料</button>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
