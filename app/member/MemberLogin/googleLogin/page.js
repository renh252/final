'use client';

import { useState, useEffect } from 'react';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged } from '@/lib/firebase'; // 根據您的檔案路徑調整

export default function LoginPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        setUser(authUser);
        console.log('已登入使用者：', authUser);
        // 可以在這裡導向使用者到應用程式的主要頁面
      } else {
        setUser(null);
        console.log('使用者已登出');
        // 可以在這裡顯示登入按鈕
      }
    });

    // 在組件卸載時取消監聽
    return () => unsubscribe();
  }, []);

  const handleSignInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // Google Sign-in successful
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      const user = result.user;
      console.log('Google 登入成功：', user);
      // 登入狀態會在 onAuthStateChanged 中處理
    } catch (error) {
      console.error('Google 登入失敗：', error);
      // 處理錯誤
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log('登出成功');
      // 登出狀態會在 onAuthStateChanged 中處理
    } catch (error) {
      console.error('登出失敗：', error);
    }
  };

  return (
    <div>
      <h1>登入頁面</h1>
      {user ? (
        <div>
          <p>已登入：{user.displayName} ({user.email})</p>
          <button onClick={handleSignOut}>登出</button>
        </div>
      ) : (
        <button onClick={handleSignInWithGoogle}>使用 Google 登入</button>
      )}
    </div>
  );
}