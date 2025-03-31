'use client';

import React, { useState, useEffect } from 'react';
import styles from './google.module.css';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { auth, googleProvider, signInWithPopup, onAuthStateChanged } from '@/lib/firebase'; // 引入 Firebase 相關函式
import { createUserWithEmailAndPassword } from 'firebase/auth'; // 引入電子郵件/密碼註冊函式

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 添加 loading 狀態

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(false);
      if (currentUser) {
        try {
          const response = await fetch(`/api/member/googleCallback/${currentUser.uid}`); // 假設後端 API 端點
          if (response.ok) {
            const userData = await response.json();
            if (userData.has_additional_info) {
              router.push('/dashboard'); // 導向主要頁面
            } else {
              router.push(`/member/MemberLogin/register2?email=${encodeURIComponent(currentUser.email)}`); // 導向填寫額外資料
            }
          } else {
            console.error('獲取使用者資料失敗');
            // 處理錯誤
          }
        } catch (error) {
          console.error('獲取使用者資料時發生錯誤:', error);
          // 處理錯誤
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user && user.email) {
        try {
          const response = await fetch(`/api/member/googleCallback/${user.uid}`);
          if (response.ok) {
            const userData = await response.json();
            if (userData.has_additional_info) {
              router.push('/dashboard');
            } else {
              router.push(`/member/MemberLogin/register2?email=${encodeURIComponent(user.email)}`);
            }
          } else {
            console.error('獲取使用者資料失敗');
          }
        } catch (error) {
          console.error('獲取使用者資料時發生錯誤:', error);
        }
      } else {
        console.log('未獲取到 Google 登入的使用者資訊。');
      }
    } catch (error) {
      console.error('Google 註冊/登入失敗：', error);
      setError(error.message);
    }
  };

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('請輸入有效的電子郵件地址');
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('密碼強度不足，請使用至少 8 個字符，包含字母和數字');
      return;
    }

    if (password !== confirmPassword) {
      setError('密碼和確認密碼不一致');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('電子郵件註冊成功：', userCredential.user);
      // 註冊成功後，onAuthStateChanged 會處理導向
    } catch (error) {
      console.error('電子郵件註冊失敗：', error);
      setError(error.message);
      if (error.code === 'auth/email-already-in-use') {
        setError('此電子郵件已註冊，請使用其他電子郵件登入。');
      } else if (error.code === 'auth/weak-password') {
        setError('密碼強度不足，請使用至少 6 個字元的密碼。');
      }
    }
  };

  if (loading) {
    return <div>載入中...</div>;
  }

  return (
    <>
      <div className={styles.formContainer}>
        <h2 className={styles.sectionTitle}>快速註冊</h2>
        <div className={styles.form}>
          <div className={styles.GFbutton}>
            <button
              className="button"
              style={{ width: '350px', height: '60px', fontSize: '20px' }}
              onClick={handleGoogleSignIn}
            >
              <Image
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/153b2dcd7ca2627a463800e38ebc91cf43bcd541ad79fa3fea9919eec17199df?placeholderIfAbsent=true&apiKey=2d1f7455128543bfa30579a9cce96321"
                alt="Google icon"
                style={{ width: '100px', height: '50px' }}
                width={100}
                height={50}
              />
              以Google帳號註冊
            </button>
          </div>

          <h2 className={styles.sectionTitle}>加入會員</h2>
          <form onSubmit={handleEmailRegister}>
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
                value={email}
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
                value={password}
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
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <br /> <br />
              {error && <p className={styles.error}>{error}</p>}
              <br />
              <button
                className="button"
                style={{ width: '200px', height: '50px', fontSize: '28px' }}
                type="submit"
              >
                註冊
              </button>
              <br /><br />
              <div>
                <p className={styles.loginLink}>
                  已經是會員?
                  <a
                    href="/member/MemberLogin/login"
                    className={styles.link}
                    style={{ fontSize: '20px' }}
                  >
                    點此登入
                  </a>
                </p>
                <p className={styles.termsText}>
                  點擊「註冊」即表示你同意我們的
                  <a href="#" className={styles.link} style={{ fontSize: '20px' }}>
                    使用條款
                  </a>
                  及
                  <a href="#" className={styles.link} style={{ fontSize: '20px' }}>
                    私隱政策
                  </a>
                  。
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}