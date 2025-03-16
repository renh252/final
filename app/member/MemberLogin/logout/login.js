// login.js
import React, { useState } from 'react';
import styles from './login.module.css';
import { useRouter } from 'next/router'; // 引入 useRouter

export default function MemberPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter(); // 初始化 router

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setIsLoggedIn(true);
        // 登入成功後跳轉到會員中心或其他頁面
        router.push('/member');
      } else {
        setMessage(data.message);
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('An error occurred during login.');
      setIsLoggedIn(false);
    }
  };

  // ... (其他程式碼保持不變)
}