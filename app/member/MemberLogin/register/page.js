'use client';

import React, { useState } from 'react';
import styles from './Register.module.css'; // 導入 CSS Modules

export default function RegisterPage(props) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' }); // 清除錯誤訊息
  };

  const validateForm = () => {
    let isValid = true;
    let newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '姓名不能為空';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = '電子郵件不能為空';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '電子郵件格式不正確';
      isValid = false;
    }

    if (!formData.password.trim()) {
      newErrors.password = '密碼不能為空';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = '密碼長度至少為 6 個字元';
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '密碼不匹配';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch('/api/member/register', { // 假設您的後端 API 路徑為 /api/register
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setRegistrationSuccess(true);
      } else {
        const errorData = await response.json();
        setErrors({ ...errors, general: errorData.message || '註冊失敗，請稍後再試' });
      }
    } catch (error) {
      setErrors({ ...errors, general: '網路錯誤，請稍後再試' });
    }
  };

  if (registrationSuccess) {
    return <div>註冊成功！</div>;
  }

  return (
    <div className={styles.container}>
      <h2>會員註冊</h2>
      {errors.general && <div className={styles.error}>{errors.general}</div>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name">姓名：</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={styles.input}
          />
          {errors.name && <div className={styles.error}>{errors.name}</div>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email">電子郵件：</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={styles.input}
          />
          {errors.email && <div className={styles.error}>{errors.email}</div>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">密碼：</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={styles.input}
          />
          {errors.password && <div className={styles.error}>{errors.password}</div>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword">確認密碼：</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={styles.input}
          />
          {errors.confirmPassword && <div className={styles.error}>{errors.confirmPassword}</div>}
        </div>
        <button type="submit" className={styles.button}>註冊</button>
      </form>
    </div>
  );
}