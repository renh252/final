//app\member\page.js
'use client';

import React, { useEffect, useState, useRef } from 'react';
import styles from "./member.module.css";
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image'; 
import Swal from 'sweetalert2';

export default function MemberPage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null); // 保存使用者資料
  const [editingField, setEditingField] = useState(null); // 目前正在編輯的欄位名稱
  const [draftValues, setDraftValues] = useState({}); // 儲存每個欄位編輯中的值
  const [profilePhoto, setProfilePhoto] = useState('/images/member/memberphoto.png'); // 儲存使用者上傳的圖片
  const fileInputRef = useRef(null); // 創建一個 ref 用於觸發檔案輸入框

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
          setProfilePhoto(data.profile_picture  || '/images/member/memberphoto.png'); // 設定使用者上傳的圖片
        } else {
          console.error('獲取使用者資料失敗:', response.statusText);
        }
      } catch (error) {
        console.error('錯誤:', error.message);
      }
    };
    fetchUserData();
  }, []);

  const handleSaveClick = async (fieldName) => {
      try {
     const token = localStorage.getItem('token'); // 從 localStorage 獲取 token
      if (!token) {
      console.error('未找到 token，無法更新資料');
      return;
      }
    const response = await fetch('/api/user/update', {
      method: 'POST',
      headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
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

  const handleEditClick = (fieldName) => {
    console.log('handleEditClick called with:', fieldName, userData);
    setEditingField(fieldName);
    setDraftValues({ ...draftValues, [fieldName]: userData?.[fieldName] });
  };

  const handleInputChange = (e) => {
    setDraftValues({ ...draftValues, [e.target.name]: e.target.value });
  };
  
  const handleCancelEditClick = (fieldName) => {
  setEditingField(null);
  const newDraftValues = { ...draftValues };
  delete newDraftValues[fieldName];
  setDraftValues(newDraftValues);
  };

  const handleUploadPhoto = async (e) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('未找到 token，無法上傳圖片');
        return;
      }
      const file = e.target.files[0];
      if (!file) {
        return; // 使用者未選擇檔案
    }
    const allowedTypes = ['image/jpeg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                await Swal.fire({
                    icon: 'error',
                    title: '上傳失敗',
                    text: '請上傳 JPG 或 PNG 格式的圖片。',
                });
                return;
            }

            if (file.size > 2 * 1024 * 1024) { // 限制 2MB
                await Swal.fire({
                    icon: 'error',
                    title: '上傳失敗',
                    text: '圖片檔案大小請勿超過 2MB。',
                });
                return;
            }

            const formData = new FormData();
            formData.append('profile_photo', file);

            const response = await fetch('/api/user/uploadPhoto', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setUserData(updatedUser);
                setProfilePhoto(updatedUser.profile_picture || '/public/images/member/memberphoto.png');
                await Swal.fire({
                    icon: 'success',
                    title: '上傳成功！',
                    text: '大頭照已成功更新。',
                    timer: 1500,
                    showConfirmButton: false,
                });
            } else {
                console.error('上傳圖片失敗:', response.statusText);
                await Swal.fire({
                    icon: 'error',
                    title: '上傳失敗',
                    text: '圖片上傳失敗，請稍後再試。',
                });
            }
        } catch (error) {
            console.error('上傳圖片時發生錯誤:', error);
            await Swal.fire({
                icon: 'error',
                title: '錯誤',
                text: '上傳圖片時發生錯誤，請稍後再試。',
            });
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
  };

  return (
    <>
        <div className={styles.member_container}>
          <section className={styles.profile_section}>
            <div className={styles.profile_photos}>
            <Image
            src={profilePhoto}  alt="大頭照" 
            width={300}
            height={300}
    className={styles.profile_photo}  />              
            <div><br />
            <label className="form_label">
      上傳大頭照：
      <input 
        type="file" 
        id="profile_photo" 
        name="profile_photo" 
        onChange={handleUploadPhoto} 
        className={styles.label_input}
        ref={fileInputRef}
        style={{ display: 'none' }} // 隱藏原始的 input
        accept="image/jpeg, image/png" // 建議加上 accept 屬性
      />
      </label>
      <button onClick={triggerFileInput} className="button" style={{ width: '150px', height: '40px', fontSize: '16px' }}>
      選擇圖片
      </button>
      <br /><br />
                <p>
                  暱稱：
                  {editingField === 'user_level' ? (
                    <select name="user_level" value={draftValues.user_level || userData?.user_level || ''} onChange={handleInputChange} className={styles.label_input}>
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
                      <button onClick={() => handleSaveClick('user_level')}
                      className={styles.edit_button} >儲存</button>
                      <button onClick={() => handleCancelEditClick('user_level')}
                      className={styles.edit_button} >取消</button>
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
                    <input type="text" name="user_name" value={draftValues.user_name || userData?.user_name || ''} onChange={handleInputChange} className={styles.label_input}/>
                  ) : (
                    <span>{userData?.user_name}</span>
                  )}
                  {editingField === 'user_name' ? (
                    <>
                      <button onClick={() => handleSaveClick('user_name')}
                      className={styles.edit_button} >儲存</button>
                      <button onClick={() => handleCancelEditClick('user_name')}
                      className={styles.edit_button} >取消</button>
                    </>
                  ) : (
                    <span onClick={() => handleEditClick('user_name')} style={{ cursor: 'pointer' }}> <FontAwesomeIcon icon={faPenToSquare} style={{ color: "#d2ac83" }} /> </span> 
                  )}
                </label>
                <hr />

                <label className={styles.form_label}>
                  電話：
                  {editingField === 'user_number' ? (
                    <input type="text" name="user_number" value={draftValues.user_number || userData?.user_number || ''} onChange={handleInputChange} className={styles.label_input}/>
                  ) : (
                    <span>{userData?.user_number}</span>
                  )}
                  {editingField === 'user_number' ? (
                    <>
                      <button onClick={() => handleSaveClick('user_number')}
                      className={styles.edit_button} >儲存</button>
                      <button onClick={() => handleCancelEditClick('user_number')}
                      className={styles.edit_button} >取消</button>
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
                      onChange={handleInputChange} className={styles.label_input}/>
                  ) : (
                    <span>{userData?.user_birthday ? formatDate(userData.user_birthday) : ''}</span>
                  )}
                  {editingField === 'user_birthday' ? (
                    <>
                      <button onClick={() => handleSaveClick('user_birthday')}
                      className={styles.edit_button} >儲存</button>
                      <button onClick={() => handleCancelEditClick('user_birthday')}
                      className={styles.edit_button} >取消</button>
                    </>
                  ) : (
                    <span onClick={() => handleEditClick('user_birthday')} style={{ cursor: 'pointer' }}> <FontAwesomeIcon icon={faPenToSquare} style={{ color: "#d2ac83" }} /> </span>
                  )}
                </label>
                <hr />

                <label className={styles.form_label}>
                  論壇ID：
                  {editingField === 'user_nickname' ? (
                    <input type="text" name="user_nickname" value={draftValues.user_nickname || userData?.user_nickname || ''} onChange={handleInputChange} className={styles.label_input}/>
                  ) : (
                    <span>{userData?.user_nickname}</span>
                  )}
                  {editingField === 'user_nickname' ? (
                    <>
                      <button onClick={() => handleSaveClick('user_nickname')}
                      className={styles.edit_button} >儲存</button>
                      <button onClick={() => handleCancelEditClick('user_nickname')}
                      className={styles.edit_button} >取消</button>
                    </>
                  ) : (
                    <span onClick={() => handleEditClick('user_nickname')} style={{ cursor: 'pointer' }}> <FontAwesomeIcon icon={faPenToSquare} style={{ color: "#d2ac83" }} /> </span> 
                  )}
                </label>
                <hr />

                <label className={styles.form_label}>
                  地址：
                  {editingField === 'user_address' ? (
                    <input type="text" name="user_address" value={draftValues.user_address || userData?.user_address || ''} onChange={handleInputChange} className={styles.label_input}/>
                  ) : (
                    <span>{userData?.user_address}</span>
                  )}
                  {editingField === 'user_address' ? (
                    <>
                      <button onClick={() => handleSaveClick('user_address')}
                      className={styles.edit_button} >儲存</button> 
                      <button onClick={() => handleCancelEditClick('user_address')}
                      className={styles.edit_button} >取消</button>
                    </>
                  ) : (
                    <span onClick={() => handleEditClick('user_address')} style={{ cursor: 'pointer' }}> <FontAwesomeIcon icon={faPenToSquare} style={{ color: "#d2ac83" }} /> </span> 
                  )}
                </label>
                <hr />
              </div>
              <br /><br />
              <div className={styles.password_button}>
                <button
                  onClick={() => router.push('/member/MemberLogin/forgot')}
                  className="button"
                  style={{ width: '150px', height: '40px', fontSize: '16px' }}
                >
                  修改密碼
                </button>
              </div>
            </div>
          </section>
        </div>
    </>
  );
}