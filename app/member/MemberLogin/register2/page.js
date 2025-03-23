'use client';

import React, { useState } from 'react';
import styles from './Register2.module.css';
import { useSearchParams, useRouter } from 'next/navigation';

export default function Register2Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const password = searchParams.get('password');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    let errors = []; // 儲存錯誤訊息的陣列
  
    // 必填欄位驗證
    if (!name) {
      errors.push('請填寫姓名欄位');
    }
    if (!phone) {
      errors.push('請填寫電話欄位');
    }
    if (!birthday) {
      errors.push('請填寫生日欄位');
    }
    if (!address) {
      errors.push('請填寫地址欄位');
    }
  
    // 如果有錯誤，一次性顯示所有錯誤訊息
    if (errors.length > 0) {
      alert(errors.join('\n')); // 使用換行符號連接錯誤訊息
      return;
    }
  
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, phone, birthday, address }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert(data.message);
        window.location.href = '/member/MemberLogin/login';
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('註冊錯誤:', error);
      alert('註冊失敗，請稍後重試');
    }
  };

  return (
    <>
      <div className={styles.registration_wrapper}>
        <section className={styles.welcome_section}>
          <h1 className={styles.welcome_title}>歡迎加入毛孩之家 !</h1>
          <p className={styles.welcome_message}>
            歡迎加入成為我們的會員，您將與我們一起打造一個充滿愛與關懷的動物樂園。無論您是否為愛犬、愛貓還是其他寵物的飼主，這裡都將是您與寶貝們共享美好時光的溫暖家園。身為會員，能享有專屬折扣與優惠，還能優先參加各類活動，與其他毛孩家長互動交流，分享照護心得與歡笑點滴。
            <br />
            感謝您加入我們的大家庭，與我們一起守護毛孩的幸福未來！
            <br />
            <br />
            <span className={styles.highlight_text}>
              請繼續完成以下基本資料填寫，即註冊完成 !
            </span>
          </p>
        </section>
        <h2 className={styles.form_title}>基本資料</h2>
        <form className={styles.registration_form} onSubmit={handleSubmit}>
          <div className={styles.form_group}>
            <label className={styles.form_label}>
              姓名 :<span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={styles.form_input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className={styles.form_group}>
            <label className={styles.form_label}>
              電話 :<span className={styles.required}>*</span>
            </label>
            <input
              type="tel"
              className={styles.form_input}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className={styles.form_group}>
            <label className={styles.form_label}>
              生日 :<span className={styles.required}>*</span>
            </label>
            <input
              type="date"
              className={styles.form_input}
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              required
            />
          </div>
          <div className={styles.form_group}>
            <label className={styles.form_label}>
              地址 :<span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={styles.form_input}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <div className={styles.form_button}>
            <button
              className="button"
              style={{ width: '200px', height: '80px', fontSize: '30px' }}
              type="submit"
            >
              完成
            </button>
          </div>
        </form>
      </div>
    </>
  );
}