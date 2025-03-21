//app/member/page.js
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from "./member.module.css";
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function MemberPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState(null); // 新增 userData 狀態
  const [isEditing, setIsEditing] = useState(false);// 初始化表單資料
  const [formData, setFormData] = useState({
    user_name: '',
    user_number: '',
    user_birthday: '',
    user_address: '',
    user_level: '',
  });
  const [originalData, setOriginalData] = useState(null); // 原始資料狀態

  useEffect(() => {
    if (!user && !loading) {
      router.push('/member/MemberLogin/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/user', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
          setFormData(data);// 初始化表單資料
          setOriginalData(data); // 儲存原始資料
        } else {
          console.error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (user && !loading) {
      fetchUserData();
    }
  }, [user, loading]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setFormData(originalData); // 還原為原始資料
  };


  const handleNicknameChange = async (event) => {
    const newNickname = event.target.value;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/updateNickname', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nickname: newNickname }),
      });
      if (response.ok) {
        // 更新 Context 中的 user 資料
        const updatedUser = { ...user, nickname: newNickname };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        // 觸發重新渲染，確保頁面顯示最新暱稱 (如果你的 AuthContext 有提供更新user的方法，可以使用context提供的方法更新)
      } else {
        throw new Error('Failed to update nickname');
      }
    } catch (error) {
      console.error('Error updating nickname:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        alert('資料更新成功！');
        setUserData(formData); // 更新顯示的資料
        
        setIsEditing(false);
      } else {
        alert('資料更新失敗！');
      }
    } catch (error) {
      console.error('Error updating user data:', error);
      alert('發生錯誤，請稍後再試！');
    }
  };

  if (loading) {
    return <div>Loading...</div>; // 顯示加載指示器
  }


  if (!user) {
    return null;
  }

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
                    <label className={styles.form_label}>姓名：<input type="text" name="user_name" value={formData.user_name} onChange={handleChange} /></label>
                    <hr />
                    <label className={styles.form_label}>電話：<input type="text" name="user_number" value={formData.user_number} onChange={handleChange} /></label>
                    <hr />
                    <label className={styles.form_label}>生日：<input type="date" name="user_birthday" value={formData.user_birthday} onChange={handleChange} /></label>
                    <hr />
                    <label className={styles.form_label}>地址：<input type="text" name="user_address" value={formData.user_address} onChange={handleChange} /></label>
                  </>
                ) : (
                  <>
                    <label className={styles.form_label}>姓名：{userData?.user_name}</label>
                    <hr />
                    <label className={styles.form_label}>電話：{userData?.user_number}</label>
                    <hr />
                    <label className={styles.form_label}>生日：{userData?.user_birthday}</label>
                    <hr />
                    <label className={styles.form_label}>論壇ID：{userData?.user_id}</label>
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