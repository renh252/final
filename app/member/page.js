'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from "./member.module.css";
import { Breadcrumbs } from '../_components/breadcrumbs'
const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage('');

  try {
    const response = await fetch('/api/member', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // ... 成功登入的處理邏輯 ...
    } else {
      setMessage(data.message || '登入失敗，請檢查您的電子郵件和密碼。');
      console.error('登入錯誤詳情:', data.error); // 添加這行來記錄詳細錯誤
    }
  } catch (error) {
    console.error('登入請求失敗:', error);
    setMessage('登入時發生錯誤，請稍後再試。錯誤詳情: ' + error.message);
  }
};
export default function MemberPage(props) {
  
  return (
    <>

<header className={styles.headerSection}>
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/c961159506ebe222e2217510289e3eee7203e02a0affe719332fe812045a0061?placeholderIfAbsent=true&apiKey=2d1f7455128543bfa30579a9cce96321"
              alt="Header background"
              className={styles.headerBackground}
            />
            <h1 className={styles.pageTitle}>會員中心</h1>
          </header>


      <div className={styles.logos_grid}>
      <button
                className="button"
                style={{ width: '200px', height: '50px', fontSize: '28px' }}
              >
                <Link href="/shop/cart">我的購物車</Link>
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
              <select>
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
            <label className="{styles.form_label}">姓名 :</label>
            <hr />
            <label className="{styles.form_label}">電話 :</label>
            <hr />
            <label className="{styles.form_label}">生日 :</label>
            <hr />
            <label className="{styles.form_label}">論壇ID :</label>
            <hr />
            <label className="{styles.form_label}">地址 :</label>
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



    </>
  )
}