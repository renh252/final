'use client'

import React, { useState } from 'react';
import styles from "./login.module.css";

export default function MemberPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 處理表單提交
  const handleSubmit = (e) => {
    e.preventDefault();

    // 模擬的登入檢查，通常應該使用 API 來進行驗證
    if (email === 'user@example.com' && password === 'password123') {
      setMessage('Login successful!');
      setIsLoggedIn(true);
    } else {
      setMessage('Invalid email or password.');
      setIsLoggedIn(false);
    }
  };

  return (
    <>
      <main className={styles.profile_page}>
        <div className={styles.profile_container}>
          <header className={styles.hero_section}>
            <img src="./images/member/Frame 312.jpg" alt="Hero background" className="hero-image" />
          </header>
          <div className={styles['login-container']}>
            {isLoggedIn ? (
              <div>
                <h2>Welcome back!</h2>
                <p>You are logged in.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles['login-form']}>
                <h2>Login</h2>

                <div>
                  <label>Email:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label>Password:</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit">Login</button>

                {/* 顯示登入信息 */}
                {message && <p>{message}</p>}
              </form>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
