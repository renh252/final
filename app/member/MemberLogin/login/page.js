'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext'; // 引入 AuthContext
import styles from './login.module.css';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Swal from 'sweetalert2';

export default function MemberPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth(); // 使用 Context 的 login 函式
  const router = useRouter();
  console.log(useAuth());

  const [rememberMe, setRememberMe] = useState(false);
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      await Swal.fire({
        title: '錯誤',
        text: '請填寫所有欄位',
        icon: 'error',
        confirmButtonText: '確定',
      });
      return;
    }

    try {
      const response = await fetch('/api/member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }), // 移除 rememberMe，因為 API 不需要
      });

      const data = await response.json();

      if (response.ok && data.success) {
        login(data.data); // 使用 Context 的 login 函式
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        await Swal.fire({
          title: '登入成功！',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });

        router.push('/member/AuthTest');
      } else {
        await Swal.fire({
          title: '登入失敗',
          text: data.message || '請檢查您的電子郵件和密碼。',
          icon: 'error',
          confirmButtonText: '確定',
        });
      }
    } catch (error) {
      console.error('登入請求失敗:', error);
      await Swal.fire({
        title: '錯誤',
        text: '登入時發生錯誤，請稍後再試。',
        icon: 'error',
        confirmButtonText: '確定',
      });
    }
  };

  return (
    <>
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
    </>
  );
}