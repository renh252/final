'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext'; // 引入 useAuth

const ProtectedPage = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>載入中...</div>;
  }

  if (!user) {
    return null; // 不顯示任何內容，因為已經導向到登入頁面
  }

  return <>{children}</>;
};

export default ProtectedPage;