'use client';
import React, { useState, useEffect } from 'react';
import styles from './login.module.css';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MemberPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!email || !password) {
      setMessage('請填寫所有欄位');
      return;
    }

    try {
      const response = await fetch('/api/member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage('登入成功！');
        setIsLoggedIn(true);
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        router.push('/member');
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
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>
              電子信箱 :
            </label>
            <input
              type="email"
              id="email"
              className={styles.formInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="password" className={styles.formLabel}>
              密碼 :
            </label>
            <input
              type="password"
              id="password"
              className={styles.formInput}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className={styles.rememberMe}>
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="rememberMe">記住我</label>
            </div>

            <button
              type="submit"
              className="button"
              style={{ width: '200px', height: '50px', fontSize: '28px' }}
            >
              登入
            </button>
          </div>
        </form>

        <div>
          <p className={styles.loginLink}>
            還沒有會員?  
            <Link
              href="/member/MemberLogin/register"
              className={styles.link}
              style={{ fontSize: '22px' }}
            >
              點此註冊
            </Link>
          </p>
          <p className={styles.loginLink}>
            忘記密碼?  
            <Link
              href="/member/MemberLogin/forgot"
              className={styles.link}
              style={{ fontSize: '22px' }}
            >
              請點我
            </Link>
          </p>
        </div>
      </div>
      {message && <p className={styles.message}>{message}</p>}
    </>
  );
}