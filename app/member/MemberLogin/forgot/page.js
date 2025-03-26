'use client';

import React, { useState } from 'react';
import styles from './forgot.module.css';

export default function ResetPasswordPage() {
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [isCodeVerified, setIsCodeVerified] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handleSendCode = async () => {
        setMessage('');
        setError('');
        try {
            const response = await fetch('/api/member/forgot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'request-otp', email }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                setIsCodeSent(true);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('請求驗證碼失敗，請檢查您的網路連線');
            console.error('請求驗證碼錯誤:', err);
        }
    };

    const handleVerifyCode = async () => {
        setMessage('');
        setError('');
        try {
            const response = await fetch('/api/member/forgot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'verify-otp', email, otp: verificationCode }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                setIsCodeVerified(true);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('驗證驗證碼失敗，請檢查您的網路連線');
            console.error('驗證驗證碼錯誤:', err);
        }
    };

    const handleResetPassword = async () => {
        setMessage('');
        setError('');
        if (newPassword !== confirmNewPassword) {
            setError('新密碼與確認密碼不符');
            return;
        }

        try {
            const response = await fetch('/api/member/forgot', { // 修改 API 端點
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'reset-password', email, otp: verificationCode, newPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message + '，您現在可以<a href="/login">登入</a>。'); // 假設有登入頁面
                setIsCodeVerified(false);
                setEmail('');
                setVerificationCode('');
                setNewPassword('');
                setConfirmNewPassword('');
                setIsCodeSent(false);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('重設密碼失敗，請檢查您的網路連線');
            console.error('重設密碼錯誤:', err);
        }
    };

    return (
        <>
            <div className={styles.formContainer}>
                <h2 className={styles.sectionTitle}>重設密碼</h2>
                {message && <p style={{ color: 'green' }} dangerouslySetInnerHTML={{ __html: message }} />}
                {error && <p style={{ color: 'red' }}>{error}</p>}

                <div className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="email" className={styles.formLabel}>
                            電子信箱 :
                        </label>
                        <input
                            type="email"
                            id="email"
                            className={styles.formInput}
                            required
                            value={email}
                            onChange={handleEmailChange}
                            disabled={isCodeSent} // 發送驗證碼後禁用
                        />
                    </div>
                    {!isCodeSent && (
                        <button
                            className="button"
                            style={{ width: '200px', height: '60px', fontSize: '28px' }}
                            onClick={handleSendCode}
                            disabled={!email}
                        >
                            發送驗證碼
                        </button>
                    )}

                    {isCodeSent && !isCodeVerified && (
                        <>
                            <div className={styles.formGroup}>
                                <label htmlFor="verificationCode" className={styles.formLabel}>
                                    驗證碼 :
                                </label>
                                <input
                                    type="text"
                                    id="verificationCode"
                                    className={styles.formInput}
                                    required
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                />
                            </div>
                            <button
                                className="button"
                                style={{ width: '200px', height: '60px', fontSize: '28px' }}
                                onClick={handleVerifyCode}
                                disabled={!verificationCode}
                            >
                                驗證驗證碼
                            </button>
                        </>
                    )}

                    {isCodeVerified && (
                        <>
                            <div className={styles.formGroup}>
                                <label htmlFor="newPassword" className={styles.formLabel}>
                                    新密碼 :
                                </label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    className={styles.formInput}
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="confirmNewPassword" className={styles.formLabel}>
                                    確認新密碼 :
                                </label>
                                <input
                                    type="password"
                                    id="confirmNewPassword"
                                    className={styles.formInput}
                                    required
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                />
                            </div>
                            <button
                                className="button"
                                style={{ width: '200px', height: '60px', fontSize: '28px' }}
                                onClick={handleResetPassword}
                                disabled={!newPassword || !confirmNewPassword}
                            >
                                重設密碼
                            </button>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}