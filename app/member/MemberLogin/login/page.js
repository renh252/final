'use client';
import React, { useState } from 'react';
import styles from './login.module.css';
import { useRouter } from 'next/navigation'; // 引入 useRouter

export default function MemberPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter(); // 初始化 useRouter

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // 清空之前的訊息

    try {
      const response = await fetch('/api/member', { // 確保路徑與您的 route.js 相符
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage('登入成功！');
        setIsLoggedIn(true);
        localStorage.setItem('token', data.data.token); // 儲存 token
        // 可以將使用者資訊儲存到 state 或 context 中
        // 例如：setUser(data.data.user);
        router.push('/member'); // 登入成功後導向會員中心或其他頁面
      } else {
        setMessage(data.message || '登入失敗，請檢查您的電子郵件和密碼。');
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('登入請求失敗:', error);
      setMessage('登入時發生錯誤，請稍後再試。');
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                onClick={handleSubmit} 
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
            {message && <p className={styles.message}>{message}</p>} {/* 顯示登入訊息 */}
    </>
  );
}