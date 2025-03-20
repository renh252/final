'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from "./member.module.css";

export default function MemberPage() {
  const [userData, setUserData] = useState(null);
  
  useEffect(() => {
    // 從API獲取用戶數據
    const fetchUserData = async () => {
      try {
        // 從 localStorage 獲取 token
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error('No token found, user might not be logged in');
          return;
        }

        const response = await fetch('/api/member', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

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
        setUserData(prevData => ({ ...prevData, nickname: newNickname }));
      } else {
        throw new Error('Failed to update nickname');
      }
    } catch (error) {
      console.error('Error updating nickname:', error);
    }
  };

  return (
    <>
      <main className={styles.profile_page}>
        <div className={styles.member_container}>
          <section className={styles.profile_section}>
            <div className={styles.profile_photos}>
              <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/c07e5bb4325caeb94efd091416f6964123f3611a" alt="大頭照" className="profile-photo" />
              <select value={userData?.nickname || ""} onChange={handleNicknameChange}>
                <option value="">暱稱</option>
                <option value="愛心小天使">愛心小天使</option>
                <option value="乾爹乾媽">乾爹乾媽</option>
                <option value="拔鼻媽咪">拔鼻媽咪</option>
                <option value="超級拔鼻媽咪">超級拔鼻媽咪</option>
              </select>
            </div>
                      
            <div className={styles.profile_content}>
              <h3 className={styles.profile_title}>個人資料</h3>
              <div className={styles.profile_group}>
                <label className={styles.form_label}>姓名 : {userData?.user_name}</label>
                <hr />
                <label className={styles.form_label}>電話 : {userData?.user_phone}</label>
                <hr />
                <label className={styles.form_label}>生日 : {userData?.user_birthday}</label>
                <hr />
                <label className={styles.form_label}>論壇ID : {userData?.user_id}</label>
                <hr />
                <label className={styles.form_label}>地址 : {userData?.user_address}</label>
                <hr />
              </div>
              
              <div className={styles.edit_but}>
                <button
                  className="button"
                  style={{ width: '150px', height: '40px', fontSize: '20px' }}>
                  <Link href="/member/memsetting">修改資料</Link>
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}