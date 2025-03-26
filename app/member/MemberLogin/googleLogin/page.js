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
  const [user, setUser] = useState(null); // 用於追蹤使用者登入狀態

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        router.push('/member/MemberLogin/register2'); // 登入後導向 register2
      } else {
        setUser(null);
        console.log('使用者已登出');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // 登入成功後，onAuthStateChanged 會處理導向
    } catch (error) {
      console.error('Google 註冊/登入失敗：', error);
      setError(error.message); // 顯示錯誤訊息
    }
  };

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setError('');

    // 電子郵件格式驗證
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('請輸入有效的電子郵件地址');
      return;
    }

    // 密碼強度驗證（至少 8 個字符，包含字母和數字）
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('密碼強度不足，請使用至少 8 個字符，包含字母和數字');
      return;
    }

    // 確認密碼是否一致
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
      setError(error.message); // 顯示 Firebase 的錯誤訊息
      // 可以根據 error.code 顯示更具體的錯誤訊息
      if (error.code === 'auth/email-already-in-use') {
        setError('此電子郵件已註冊，請使用其他電子郵件登入。');
      } else if (error.code === 'auth/weak-password') {
        setError('密碼強度不足，請使用至少 6 個字元的密碼。');
      }
    }
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
              onClick={handleGoogleSignIn} // 綁定 Google 登入函式
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
          <form onSubmit={handleEmailRegister}> {/* 使用新的 handleEmailRegister 函式 */}
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
                type="submit" // 更改 button 的 type 為 submit
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