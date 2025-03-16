import React, { useState } from 'react';
import styles from './forgot-password.module.css'; // 引入 CSS 樣式

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // 新增加載狀態

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // 開始加載

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json(); // 嘗試獲取詳細錯誤訊息
        throw new Error(errorData.error || 'Something went wrong, please try again.');
      }

      setMessage('If this email exists in our system, you will receive a password reset link.');
      setError('');
    } catch (err) {
      setError(err.message);
      setMessage('');
    } finally {
      setIsLoading(false); // 結束加載
    }
  };

  return (
    <div className={styles['forgot-password-container']}>
      <form onSubmit={handleSubmit} className={styles['forgot-password-form']}>
        <h2>Forgot Password</h2>

        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={isLoading}> {/* 根據加載狀態禁用按鈕 */}
          {isLoading ? 'Sending...' : 'Send Reset Link'} {/* 顯示加載訊息 */}
        </button>

        {message && <p>{message}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}