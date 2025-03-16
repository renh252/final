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
      <main className={styles.profile_page}>
        <div className={styles.profile_container}>
          <header className={styles.hero_section}>
            <img
              src="./images/member/Frame 312.jpg"
              alt="Hero background"
              className={styles.hero_image} // 使用 styles 導入的樣式
            />
          </header>
          <div className={styles['login-container']}>
            {isLoggedIn ? (
              <div>
                <h2>歡迎回來！</h2>
                <p>您已登入。</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles['login-form']}>
                <h2>登入</h2>

                <div>
                  <label htmlFor="email">電子郵件：</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password">密碼：</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit">登入</button>

                {message && <p>{message}</p>}
              </form>
            )}
          </div>
        </div>
      </main>
    </>
  );
}