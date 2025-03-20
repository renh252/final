
'use client';

import React from 'react';
import Link from 'next/link';
import styles from "@/app/member/member.module.css";
import Image from 'next/image'
import { useAuth } from '@/app/context/AuthContext'; // 引入 useAuth
import { useRouter } from 'next/navigation';// 導向到登入頁面



export default function MemberLayout({ children }) {
  const { user,logout } = useAuth(); // 從 useAuth 中獲取 logout
  const router = useRouter();

  const handleLogout = () => {
    logout(); // 呼叫登出函數
    router.push('/member/MemberLogin/login'); // 確保登出後導向登入頁面
  };

  if (!user) {
    return <main>{children}</main>; // 如果使用者未登入，只渲染 children
  }
  
  return (
    <div className="member-layout">
      <div className={styles.logos_grid}>
        <button
          className="button"
          style={{ width: '200px', height: '50px', fontSize: '28px' }}
        >
          <Link href="/member/orders">我的訂單</Link>
        </button>
        <button
          className="button"
          style={{ width: '200px', height: '50px', fontSize: '28px' }}
        >
          <Link href="/pets">我的寵物</Link>
        </button>
        <button
          className="button"
          style={{ width: '200px', height: '50px', fontSize: '28px' }}
        >
          <Link href="/forum">我的論壇</Link>
        </button>
        <button
          className="button"
          style={{ width: '200px', height: '50px', fontSize: '28px' }}
        >


          <Link href="/member/donations">我的捐款</Link>

        </button>
        <button
          className="button"
          style={{ width: '200px', height: '50px', fontSize: '28px' }}
        >
          <Link href="/">回首頁</Link>
        </button>
        <button
          className="button"
          style={{ width: '200px', height: '50px', fontSize: '28px' }}

          onClick={handleLogout} // 添加 onClick 事件
        >
          登出
        </button>
      </div>
      <main style={{ margin: '30px auto' }}>
        {children}
      </main>


    </div>
  );
}