'use client';

import React, { useState } from 'react';
import styles from './forgot.module.css';

export default function ResetPasswordPage() {
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [isCodeVerified, setIsCodeVerified] = useState(false);

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handleSendCode = () => {
        // 發送驗證碼郵件的邏輯
        console.log('驗證碼已發送至：', email);
        setIsCodeSent(true);
    };

    const handleVerifyCode = () => {
        // 驗證驗證碼的邏輯
        console.log('驗證碼：', verificationCode);
        setIsCodeVerified(true);
    };

    const handleResetPassword = () => {
        // 重設密碼的邏輯
        console.log('重設密碼');
    };

    return (
        <>
            {/* ... 其他程式碼 ... */}
            <div className={styles.formContainer}>
                <h2 className={styles.sectionTitle}>重設密碼</h2>
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
                        />
                    </div>
                    {!isCodeSent && (
                        <button 
                        className="button" 
                        style={{ width: '200px', height: '60px', fontSize: '28px' }} 
                        onClick={handleSendCode}>
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
                            onClick={handleVerifyCode}>
                                驗證驗證碼
                            </button>
                        </>
                    )}
                    {isCodeVerified && (
                        <button className="button" 
                        style={{ width: '200px', height: '60px', fontSize: '28px' }} 
                        onClick={handleResetPassword}>
                            重設密碼
                        </button>
                    )}
                    {/* ... 其他程式碼 ... */}
                </div>
            </div>
        </>
    );
}