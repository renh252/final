'use client';

import React, { useState } from 'react';
import styles from './memsetting.module.css'; // 假設您的 CSS 檔案名為 memsetting.module.css

export default function MemSettingPage() {
    const [name, setName] = useState('您的姓名'); // 初始值
    const [phone, setPhone] = useState('您的電話');
    const [birthday, setBirthday] = useState('您的生日');
    const [forumId, setForumId] = useState('您的論壇ID');
    const [address, setAddress] = useState('您的地址');

    const handleSubmit = (e) => {
        e.preventDefault();
        // 在這裡處理表單提交邏輯，例如發送 API 請求
        console.log('提交資料：', { name, phone, birthday, forumId, address });
    };

    const handlePasswordChange = () => {
        // 處理修改密碼的邏輯，例如跳轉到修改密碼頁面
        router.push('/MemberLogin/forgot'); // 跳轉到 /forgot
    };

    return (
        <>
            <header className={styles.headerSection}>
                <img
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/c961159506ebe222e2217510289e3eee7203e02a0affe719332fe812045a0061?placeholderIfAbsent=true&apiKey=2d1f7455128543bfa30579a9cce96321"
                    alt="Header background"
                    className={styles.headerBackground}
                />
                <h1 className={styles.pageTitle}>修改資料</h1>
            </header>

            <div className={styles.member_container}>
                <form className={styles.profile_form} onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="name">姓名：</label>
                        <input
                            type="text"
                            id="name"
                            className={styles.formInput}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="phone">電話：</label>
                        <input
                            type="tel"
                            id="phone"
                            className={styles.formInput}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="birthday">生日：</label>
                        <input
                            type="date"
                            id="birthday"
                            className={styles.formInput}
                            value={birthday}
                            onChange={(e) => setBirthday(e.target.value)}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="forumId">論壇ID：</label>
                        <input
                            type="text"
                            id="forumId"
                            className={styles.formInput}
                            value={forumId}
                            onChange={(e) => setForumId(e.target.value)}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="address">地址：</label>
                        <input
                            type="text"
                            id="address"
                            className={styles.formInput}
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>
                    <button className="button" 
                            style={{ width: '170px', height: '50px', fontSize: '24px' }}>
                        儲存變更
                    </button>
                    <button className="button" 
                    style={{ width: '170px', height: '50px', fontSize: '24px' }} 
                    onClick={handlePasswordChange}>
                            修改密碼
                    </button>
                </form>
            </div>
        </>
    );
}