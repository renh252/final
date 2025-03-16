'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './memsetting.module.css'; // 假設樣式檔案名為 memsetting.module.css
import { Breadcrumbs } from '../_components/breadcrumbs';

export default function MemberSettingPage() {
    const [name, setName] = useState('使用者姓名'); // 初始值可以從後端獲取
    const [phone, setPhone] = useState('使用者電話');
    const [birthday, setBirthday] = useState('使用者生日');
    const [forumId, setForumId] = useState('使用者論壇ID');
    const [address, setAddress] = useState('使用者地址');
    const [nickname, setNickname] = useState('');
    const [profilePhoto, setProfilePhoto] = useState(
        'https://cdn.builder.io/api/v1/image/assets/TEMP/c07e5bb4325caeb94efd091416f6964123f3611a'
    );

    const handleSave = () => {
        // 在這裡處理儲存資料的邏輯，例如發送 API 請求
        console.log({ name, phone, birthday, forumId, address, nickname });
        alert('資料已儲存！');
    };

    const handleCancel = () => {
        // 在這裡處理取消編輯的邏輯，例如返回會員中心頁面
        alert('取消編輯！');
    };

    const handlePhotoChange = (event) => {
        // 處理照片上傳的邏輯
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfilePhoto(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <>
            <header className={styles.header_container}>
                <img src="./images/member/memb.jpg" />
                <div className={styles.text_overlay}>編輯資料</div>
            </header>

            <Breadcrumbs
                title="編輯資料"
                items={[
                    { label: '會員中心', href: '/member' },
                    { label: '編輯資料', href: '/member/memsetting' },
                ]}
            />

            <div className={styles.member_container}>
                <section className={styles.profile_section}>
                    <div className={styles.profile_photos}>
                        <img src={profilePhoto} alt="大頭照" className="profile-photo" />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                        />
                        <select value={nickname} onChange={(e) => setNickname(e.target.value)}>
                            <option value="">暱稱</option>
                            <option value="愛心小天使">愛心小天使</option>
                            <option value="乾爹乾媽">乾爹乾媽</option>
                            <option value="拔鼻媽咪">拔鼻媽咪</option>
                            <option value="超級拔鼻媽咪">超級拔鼻媽咪</option>
                        </select>
                    </div>

                    <div className={styles.profile_content}>
                        <h3 className={styles.profile_title}>個人資料</h3>
                        <div className={styles.profile_group}>
                            <label className={styles.form_label}>姓名 :</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />

                            <label className={styles.form_label}>電話 :</label>
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />

                            <label className={styles.form_label}>生日 :</label>
                            <input
                                type="text"
                                value={birthday}
                                onChange={(e) => setBirthday(e.target.value)}
                            />

                            <label className={styles.form_label}>論壇ID :</label>
                            <input
                                type="text"
                                value={forumId}
                                onChange={(e) => setForumId(e.target.value)}
                            />

                            <label className={styles.form_label}>地址 :</label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>

                        <div className={styles.edit_but}>
                            <button
                                className="button"
                                style={{ width: '150px', height: '40px', fontSize: '20px' }}
                                onClick={handleSave}
                            >
                                儲存
                            </button>
                            <button
                                className="button"
                                style={{ width: '150px', height: '40px', fontSize: '20px' }}
                                onClick={handleCancel}
                            >
                                取消
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}