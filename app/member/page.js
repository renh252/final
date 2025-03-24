//app\member\page.js
'use client';

import React, { useEffect, useState } from 'react';
import styles from "./member.module.css";
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';

export default function MemberPage() {
  const [userData, setUserData] = useState(null); // 保存使用者資料
  const [editingField, setEditingField] = useState(null); // 目前正在編輯的欄位名稱
  const [draftValues, setDraftValues] = useState({}); // 儲存每個欄位編輯中的值

  const formatDate = (date) => {
    const formattedDate = new Date(date);
    return formattedDate.toISOString().split('T')[0]; // 格式化成YYYY-MM-dd
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
        } else {
          console.error('獲取使用者資料失敗:', response.statusText);
        }
      } catch (error) {
        console.error('錯誤:', error.message);
      }
    };

    fetchUserData();
  }, []);

  const handleEditClick = (fieldName) => {
    setEditingField(fieldName);
    setDraftValues({ ...draftValues, [fieldName]: userData?.[fieldName] });
  };

  const handleInputChange = (e) => {
    setDraftValues({ ...draftValues, [e.target.name]: e.target.value });
  };

  const handleSaveClick = async (fieldName) => {
    try {
      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [fieldName]: draftValues[fieldName] }), // 只傳送修改的欄位
      });

      if (response.ok) {
        const updatedData = await response.json();
        setUserData(updatedData); // 更新使用者資料
        setEditingField(null); // 結束編輯狀態
        const newDraftValues = { ...draftValues };
        delete newDraftValues[fieldName];
        setDraftValues(newDraftValues); // 清除 draftValues 中已儲存的值
      } else {
        console.error(`更新 ${fieldName} 失敗`);
      }
    } catch (error) {
      console.error(`更新 ${fieldName} 失敗:`, error.message);
    }
  };

  const handleCancelEditClick = (fieldName) => {
    setEditingField(null);
    const newDraftValues = { ...draftValues };
    delete newDraftValues[fieldName];
    setDraftValues(newDraftValues);
  };

  return (
    <>
      <main className={styles.profile_page}>
        <div className={styles.member_container}>
          <section className={styles.profile_section}>
            <div className={styles.profile_photos}>
              <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/c07e5bb4325caeb94efd091416f6964123f3611a" alt="大頭照" className="profile-photo" />
              <div>
                <p>
                  暱稱：
                  {editingField === 'user_level' ? (
                    <select name="user_level" value={draftValues.user_level || userData?.user_level || ''} onChange={handleInputChange}>
                      <option value="">請選擇暱稱</option>
                      <option value="愛心小天使">愛心小天使</option>
                      <option value="乾爹乾媽">乾爹乾媽</option>
                      <option value="拔鼻媽咪">拔鼻媽咪</option>
                      <option value="超級拔鼻媽咪">超級拔鼻媽咪</option>
                    </select>
                  ) : (
                    <span>{userData?.user_level}</span>
                  )}
                  {editingField === 'user_level' ? (
                    <>
                      <button onClick={() => handleSaveClick('user_level')}>儲存</button>
                      <button onClick={() => handleCancelEditClick('user_level')}>取消</button>
                    </>
                  ) : (
                    <span onClick={() => handleEditClick('user_level')} style={{ cursor: 'pointer' }}> <FontAwesomeIcon icon={faPenToSquare} style={{ color: "#d2ac83" }} /> </span> 
                  )}
                </p>
              </div>
            </div>

            <div className={styles.profile_content}>
              <h3 className={styles.profile_title}>個人資料</h3>
              <div className={styles.profile_group}>
                <label className={styles.form_label}>
                  姓名：
                  {editingField === 'user_name' ? (
                    <input type="text" name="user_name" value={draftValues.user_name || userData?.user_name || ''} onChange={handleInputChange} />
                  ) : (
                    <span>{userData?.user_name}</span>
                  )}
                  {editingField === 'user_name' ? (
                    <>
                      <button onClick={() => handleSaveClick('user_name')}>儲存</button>
                      <button onClick={() => handleCancelEditClick('user_name')}>取消</button>
                    </>
                  ) : (
                    <span onClick={() => handleEditClick('user_name')} style={{ cursor: 'pointer' }}> <FontAwesomeIcon icon={faPenToSquare} style={{ color: "#d2ac83" }} /> </span> 
                  )}
                </label>
                <hr />

                <label className={styles.form_label}>
                  電話：
                  {editingField === 'user_number' ? (
                    <input type="text" name="user_number" value={draftValues.user_number || userData?.user_number || ''} onChange={handleInputChange} />
                  ) : (
                    <span>{userData?.user_number}</span>
                  )}
                  {editingField === 'user_number' ? (
                    <>
                      <button onClick={() => handleSaveClick('user_number')}>儲存</button>
                      <button onClick={() => handleCancelEditClick('user_number')}>取消</button>
                    </>
                  ) : (
                    <span onClick={() => handleEditClick('user_number')} style={{ cursor: 'pointer' }}> <FontAwesomeIcon icon={faPenToSquare} style={{ color: "#d2ac83" }} /> </span> 
                  )}
                </label>
                <hr />

                <label className={styles.form_label}>
                生日：
                  {editingField === 'user_birthday' ? (
                    <input type="date" name="user_birthday"
                      value={draftValues.user_birthday ? formatDate(draftValues.user_birthday) : (userData?.user_birthday ? formatDate(userData.user_birthday) : '')}
                      onChange={handleInputChange} />
                  ) : (
                    <span>{userData?.user_birthday ? formatDate(userData.user_birthday) : ''}</span>
                  )}
                  {editingField === 'user_birthday' ? (
                    <>
                      <button onClick={() => handleSaveClick('user_birthday')}>儲存</button>
                      <button onClick={() => handleCancelEditClick('user_birthday')}>取消</button>
                    </>
                  ) : (
                    <span onClick={() => handleEditClick('user_birthday')} style={{ cursor: 'pointer' }}> <FontAwesomeIcon icon={faPenToSquare} style={{ color: "#d2ac83" }} /> </span>
                  )}
                </label>
                <hr />

                <label className={styles.form_label}>
                  論壇ID：
                  {editingField === 'user_nickname' ? (
                    <input type="text" name="user_nickname" value={draftValues.user_nickname || userData?.user_nickname || ''} onChange={handleInputChange} />
                  ) : (
                    <span>{userData?.user_nickname}</span>
                  )}
                  {editingField === 'user_nickname' ? (
                    <>
                      <button onClick={() => handleSaveClick('user_nickname')}>儲存</button>
                      <button onClick={() => handleCancelEditClick('user_nickname')}>取消</button>
                    </>
                  ) : (
                    <span onClick={() => handleEditClick('user_nickname')} style={{ cursor: 'pointer' }}> <FontAwesomeIcon icon={faPenToSquare} style={{ color: "#d2ac83" }} /> </span> 
                  )}
                </label>
                <hr />

                <label className={styles.form_label}>
                  地址：
                  {editingField === 'user_address' ? (
                    <input type="text" name="user_address" value={draftValues.user_address || userData?.user_address || ''} onChange={handleInputChange} />
                  ) : (
                    <span>{userData?.user_address}</span>
                  )}
                  {editingField === 'user_address' ? (
                    <>
                      <button onClick={() => handleSaveClick('user_address')}>儲存</button>
                      <button onClick={() => handleCancelEditClick('user_address')}>取消</button>
                    </>
                  ) : (
                    <span onClick={() => handleEditClick('user_address')} style={{ cursor: 'pointer' }}> <FontAwesomeIcon icon={faPenToSquare} style={{ color: "#d2ac83" }} /> </span> 
                  )}
                </label>
                <hr />
              </div>

              {/* 移除原本的整體編輯按鈕 */}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}