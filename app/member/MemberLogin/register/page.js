'use client';

import React, { useState } from 'react';
import styles from './Register.module.css';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailExists, setEmailExists] = useState(false);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [tempToken, setTempToken] = useState('');

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailExists(false); // 重置電子郵件已存在錯誤
    setEmailError('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError('');
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setConfirmPasswordError('');
  };

  const handleNextStep = async () => {
    setEmailError('');
    setEmailExists(false);
    setPasswordError('');
    setConfirmPasswordError('');
    setEmailCheckLoading(true);
    setTempToken('');

    // 電子郵件格式驗證
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('請輸入有效的電子郵件地址');
      setEmailCheckLoading(false);
      return;
    }

    // 密碼強度驗證（至少 8 個字符，包含字母和數字）
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      setPasswordError('密碼強度不足，請使用至少 8 個字符，包含字母和數字');
      setEmailCheckLoading(false);
      return;
    }

    // 確認密碼是否一致
    if (password !== confirmPassword) {
      setConfirmPasswordError('密碼和確認密碼不一致');
      setEmailCheckLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/member/register/step1', { // 使用驗證電子郵件的 API
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setTempToken(data.tempToken);
        // 導航到 register2 頁面，並傳遞 tempToken 和密碼
        router.push(`/member/MemberLogin/register2?token=${encodeURIComponent(data.tempToken)}&password=${encodeURIComponent(password)}`);
      } else if (response.status === 409) {
        setEmailExists(true);
        setEmailError(data.message);
        setTempToken('');
      } else {
        setEmailError('驗證電子郵件失敗，請稍後重試');
        setTempToken('');
      }
    } catch (error) {
      console.error('檢查電子郵件錯誤:', error);
      setEmailError('檢查電子郵件失敗，請稍後重試');
      setTempToken('');
    } finally {
      setEmailCheckLoading(false);
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
            >
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/153b2dcd7ca2627a463800e38ebc91cf43bcd541ad79fa3fea9919eec17199df?placeholderIfAbsent=true&apiKey=2d1f7455128543bfa30579a9cce96321"
                alt="Google icon"
                style={{ width: '100px', height: '50px' }}
              />
              以Google帳號註冊
            </button>
          </div>

          <h2 className={styles.sectionTitle}>加入會員 - 步驟 1</h2>
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
              onChange={handleEmailChange}
            />
            {emailError && <p className={styles.error}>{emailError}</p>}
            {emailCheckLoading && <p>檢查中...</p>}
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
              onChange={handlePasswordChange}
            />
            {passwordError && <p className={styles.error}>{passwordError}</p>}
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
              onChange={handleConfirmPasswordChange}
            />
            {confirmPasswordError && <p className={styles.error}>{confirmPasswordError}</p>}
            <br /> <br />
            <br />
            <button
              className="button"
              style={{ width: '200px', height: '50px', fontSize: '28px' }}
              onClick={handleNextStep}
            >
              下一步
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
        </div>
      </div>
    </>
  );
}