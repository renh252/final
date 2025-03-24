'use client';

import React, { useState } from 'react';
import styles from './Register.module.css';
import { useRouter } from 'next/navigation';


export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 電子郵件格式驗證
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('請輸入有效的電子郵件地址');
      return;
    }

    // 密碼強度驗證（至少 8 個字符，包含字母和數字）
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      alert('密碼強度不足，請使用至少 8 個字符，包含字母和數字');
      return;
    }

    // 確認密碼是否一致
    if (password !== confirmPassword) {
      alert('密碼和確認密碼不一致');
      return;
    }

    // 導航到 register2 頁面，並傳遞資料
    router.push(`/member/MemberLogin/register2?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
  };

  return (
    <>
      <div className={styles.formContainer}>
        <h2 className={styles.sectionTitle}>快速註冊</h2>
        <div className={styles.form}>
          <div className={styles.GFbutton}>
            <button
              className="button"
              style={{ width: '350px', height: '60px', fontSize: '20px' }}
            >
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/153b2dcd7ca2627a463800e38ebc91cf43bcd541ad79fa3fea9919eec17199df?placeholderIfAbsent=true&apiKey=2d1f7455128543bfa30579a9cce96321"
                alt="Google icon"
                style={{ width: '100px', height: '50px' }}
              />
              以Google帳號註冊
            </button>
          </div>

          <h2 className={styles.sectionTitle}>加入會員</h2>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>
              電子信箱 :
            </label>
            <br />
            <input
              type="email"
              id="email"
              className={styles.formInput}
              required
              value={email} // 添加 value 和 onChange
              onChange={(e) => setEmail(e.target.value)}
            />
            <br /> <br />
            <label htmlFor="password" className={styles.formLabel}>
              密碼 :
            </label>
            <br />
            <input
              type="password"
              id="password"
              className={styles.formInput}
              required
              value={password} // 添加 value 和 onChange
              onChange={(e) => setPassword(e.target.value)}
            />
            <br /> <br />
            <label htmlFor="confirmPassword" className={styles.formLabel}>
              確認密碼 :
            </label>
            <br />
            <input
              type="password"
              id="confirmPassword"
              className={styles.formInput}
              required
              value={confirmPassword} // 添加 value 和 onChange
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <br /> <br />
            <br />
            <button
              className="button"
              style={{ width: '200px', height: '50px', fontSize: '28px' }}
              onClick={handleSubmit} // 修改為 onClick
            >
              註冊
            </button>
            <br /><br />
            <div>
              <p className={styles.loginLink}>
                已經是會員?
                <a
                  href="\member\MemberLogin\login"
                  className={styles.link}
                  style={{ fontSize: '20px' }}
                >
                  點此登入
                </a>
              </p>
              <p className={styles.termsText}>
                點擊「註冊」即表示你同意我們的
                <a
                  href="#"
                  className={styles.link}
                  style={{ fontSize: '20px' }}
                >
                  使用條款
                </a>
                及
                <a
                  href="#"
                  className={styles.link}
                  style={{ fontSize: '20px' }}
                >
                  私隱政策
                </a>
                。
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}