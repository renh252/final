'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/app/context/AuthContext'; // 引入 useAuth
import { useRouter } from 'next/navigation';// 導向到登入頁面
//引入 useAuth
export default function ProtectedPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/member/MemberLogin/login');// 將使用者導向到登入頁面
    }
  }, [user, router]);

  if (!user) {
    return null;
  }// 如果使用者未登入不顯示任何內容，導向到登入頁面

  return (
    <div>
      <h1>放入頁面內容</h1>
    </div>
  );
}