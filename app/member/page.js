//app/member/page.js
'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import styles from "./member.module.css";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

export default function MemberPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/member/MemberLogin/login');
    }
  }, [user, loading, router]);

  const handleNicknameChange = async (event) => {
    const newNickname = event.target.value;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/updateNickname', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nickname: newNickname }),
      });
      if (response.ok) {
        // 更新 Context 中的 user 資料
        const updatedUser = { ...user, nickname: newNickname };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        // 觸發重新渲染，確保頁面顯示最新暱稱 (如果你的 AuthContext 有提供更新user的方法，可以使用context提供的方法更新)
      } else {
        throw new Error('Failed to update nickname');
      }
    } catch (error) {
      console.error('Error updating nickname:', error);
    }
  };



  if (!user) {
    return null;
  }

  return (
    <>
      <main className={styles.profile_page}>
        <div className={styles.member_container}>
          <section className={styles.profile_section}>
            <div className={styles.profile_photos}>
              <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/c07e5bb4325caeb94efd091416f6964123f3611a" alt="大頭照" className="profile-photo" />
              <select value={user?.nickname || ""} onChange={handleNicknameChange}>
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
                <label className={styles.form_label}>姓名 : {user?.user_name}</label>
                <hr />
                <label className={styles.form_label}>電話 : {user?.user_number}</label>
                <hr />
                <label className={styles.form_label}>生日 : {user?.user_birthday}</label>
                <hr />
                <label className={styles.form_label}>論壇ID : {user?.user_id}</label>
                <hr />
                <label className={styles.form_label}>地址 : {user?.user_address}</label>
                <hr />
              </div>

              <div className={styles.edit_but}>
                <button
                  className="button"
                  style={{ width: '150px', height: '40px', fontSize: '20px' }}>
                  <Link href="/member/memsetting">修改資料</Link>
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}