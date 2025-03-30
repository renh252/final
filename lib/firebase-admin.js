// app/lib/firebase-admin.js
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    try {
      const serviceAccountString = process.env.FIREBASE_ADMIN_SDK_KEY;
      if (!serviceAccountString) {
        throw new Error('FIREBASE_ADMIN_SDK_KEY 環境變數未設定');
      }

      let serviceAccount;
      try { 
        serviceAccount = JSON.parse(serviceAccountString);
        serviceAccount = JSON.parse(serviceAccountString);
    } catch (parseError) {
      console.error('解析 FIREBASE_ADMIN_SDK_KEY 失败:', parseError);
      throw new Error('FIREBASE_ADMIN_SDK_KEY 不是有效的 JSON');
    }

    if (!serviceAccount.private_key) {
      throw new Error('服务账户 JSON 中缺少 private_key');
    }
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        initializeApp({
        credential: cert(serviceAccount),
      });
      console.log('Firebase Admin SDK 初始化成功');
    } catch (error) {
      console.error('Firebase Admin SDK 初始化失敗:', error);
      throw error;
    }
  }
}

const auth = getAuth();

export { initializeFirebaseAdmin, auth };