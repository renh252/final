'use client';

import React, { useState } from 'react';
import styles from './login.module.css';

export default function MemberPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // 模擬的登入檢查，實際應用中應該使用 API
    if (email === 'user@example.com' && password === 'password123') {
      setMessage('登入成功！');
      setIsLoggedIn(true);
    } else {
      setMessage('電子郵件或密碼無效。');
      setIsLoggedIn(false);
    }
  };

  return (
    <>
       <header className={styles.headerSection}>
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/c961159506ebe222e2217510289e3eee7203e02a0affe719332fe812045a0061?placeholderIfAbsent=true&apiKey=2d1f7455128543bfa30579a9cce96321"
              alt="Header background"
              className={styles.headerBackground}
            />
            <h1 className={styles.pageTitle}>會員登入</h1>
          </header>
          

            <div className={styles.formContainer}>

            <h2 className={styles.sectionTitle}>登入會員</h2>
              <div className={styles.form}>
                 <div className={styles.formGroup}>
                 <br /> <br />  <br />
                <label htmlFor="email" className={styles.formLabel}>
                    電子信箱 :
                  </label>
                  <br />
                  <input
                    type="email"
                    id="email"
                    className={styles.formInput}
                    required
                  />
                  <br />  <br />
                  <label htmlFor="password" className={styles.formLabel}>
                    密碼 :
                  </label>
                  <br />
                  <input
                    type="password"
                    id="password"
                    className={styles.formInput}
                    required
                  />
                    <br />  <br /> 
                    <div className={styles.rememberMe}>
            <input type="checkbox" id="rememberMe" name="rememberMe" />
            <label htmlFor="rememberMe">記住我</label>
        </div>
                    <br />  
                    <br />
              <button
                className="button"
                style={{ width: '200px', height: '50px', fontSize: '28px' }}
              >
                登入
              </button>
              <br />
              <div>
                <p className={styles.loginLink}>
                還沒有會員?  
                <a
                  href="\member\MemberLogin\register"
                  className={styles.link}
                  style={{ fontSize: '22px' }}
                >
                點此註冊
                </a>
              </p>
              <p className={styles.loginLink}>
                忘記密碼?  
                <a
                  href="\member\MemberLogin\forgot"
                  className={styles.link}
                  style={{ fontSize: '22px' }}
                >
                請點我
                </a>
              </p>
              </div>
                  </div>
              </div>
            </div>
    </>
  );
}