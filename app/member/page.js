'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from "./member.module.css";
import { Breadcrumbs } from '../_components/breadcrumbs'

export default function MemberPage() {
  const [userData, setUserData] = useState(null);
  
  useEffect(() => {
    // 從API獲取用戶數據
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user'); // 假設您有一個 /api/user 路由
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
      const response = await fetch('/api/user/updateNickname', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
  <main classname={styles.profile_page}>
  <header>
      <img src="./images\member\Frame 312.jpg" 
      style={{ width: '1340px', height: '600px'}} />
  </header>


      <div className={styles.logos_grid}>
      <button
                className="button"
                style={{ width: '200px', height: '50px', fontSize: '28px' }}
              >
                <Link href="/shop">我的購物車</Link>
              </button>
              <button
                className="button"
                style={{ width: '200px', height: '50px', fontSize: '28px' }}
              >
                <Link href="/pets">我的寵物</Link>
              </button>
              <button
                className="button"
                style={{ width: '200px', height: '50px', fontSize: '28px' }}
              >
                <Link href="/forum">我的論壇</Link>
              </button>
              <button
                className="button"
                style={{ width: '200px', height: '50px', fontSize: '28px' }}
              >
                <Link href="/donate">我的捐款</Link>
              </button>
              <button
                className="button"
                style={{ width: '200px', height: '50px', fontSize: '28px' }}
              >
                <Link href="/">回首頁</Link>
              </button>
              <button
                className="button"
                style={{ width: '200px', height: '50px', fontSize: '28px' }}
              >
                <Link href="/">登出</Link>
              </button>
      </div>

      <Breadcrumbs
          title="會員中心"
          items={[
            {
              label: '會員中心',
              href: '/member',
            },
          ]} />
      <div className={styles.member_container}>
    <section className={styles.profile_section}>
    <div className={styles.profile_photos}>
          <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/c07e5bb4325caeb94efd091416f6964123f3611a" alt="大頭照" classname="profile-photo" />
          <select value={userData?.nickname || ""}>
              <option value="">暱稱</option>
              <option value="愛心小天使">愛心小天使</option>
              <option value="乾爹乾媽">乾爹乾媽</option>
              <option value="拔鼻媽咪">拔鼻媽咪</option>
              <option value="超級拔鼻媽咪">超級拔鼻媽咪</option>
              </select>
    </div>
                    
        <div className={styles.profile_content}>
          <h3 className="{styles.profile_title}">個人資料</h3>
            <div className="{styles.profile_group}">
            <label className="{styles.form_label}">姓名 : {userData?.name}</label>
            <hr />
            <label className="{styles.form_label}">電話 : {userData?.phone}</label>
            <hr />
            <label className="{styles.form_label}">生日 : {userData?.birthday}</label>
            <hr />
            <label className="{styles.form_label}">論壇ID : {userData?.forumId}</label>
            <hr />
            <label className="{styles.form_label}">地址 : {userData?.address}</label>
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