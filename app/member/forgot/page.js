import React, { useState } from 'react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // 處理表單提交
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 假設這裡會有 API 請求發送重設密碼的連結
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Something went wrong, please try again.');
      }

      // 顯示成功信息
      setMessage('If this email exists in our system, you will receive a password reset link.');
      setError('');
    } catch (err) {
      // 顯示錯誤信息
      setError(err.message);
      setMessage('');
    }
  };

  return (
    <div className="forgot-password-container">
      <form onSubmit={handleSubmit} className="forgot-password-form">
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

        <button type="submit">Send Reset Link</button>

        {/* 顯示提示信息 */}
        {message && <p>{message}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}
