'use client';

import React, { useState } from 'react';
import styles from './Register.module.css';
import { useRouter } from 'next/navigation';
import { auth, googleProvider, signInWithPopup, onAuthStateChanged } from '@/lib/firebase'; // 引入 Firebase 相關函式


export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailExists, setEmailExists] = useState(false);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [signInError, setSignInError] = useState('');
  const [isTermsVisible, setIsTermsVisible] = useState(false);
  const [isPrivacyVisible, setIsPrivacyVisible] = useState(false);
  const [popupText, setPopupText] = useState('');

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailExists(false); // 重置電子郵件已存在錯誤
    setEmailError('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError('');
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setConfirmPasswordError('');
  };

  const handleNextStep = async () => {
    setEmailError('');
    setEmailExists(false);
    setPasswordError('');
    setConfirmPasswordError('');
    setEmailCheckLoading(true);
    setTempToken('');

    // 電子郵件格式驗證
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('請輸入有效的電子郵件地址');
      setEmailCheckLoading(false);
      return;
    }

    // 密碼強度驗證（至少 8 個字符，包含字母和數字）
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      setPasswordError('密碼強度不足，請使用至少 8 個字符，包含字母和數字');
      setEmailCheckLoading(false);
      return;
    }

    // 確認密碼是否一致
    if (password !== confirmPassword) {
      setConfirmPasswordError('密碼和確認密碼不一致');
      setEmailCheckLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/member/register/step1', { // 使用驗證電子郵件的 API
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setTempToken(data.tempToken);
        // 導航到 register2 頁面，並傳遞 tempToken 和密碼
        router.push(`/member/MemberLogin/register2?token=${encodeURIComponent(data.tempToken)}&password=${encodeURIComponent(password)}`);
      } else if (response.status === 409) {
        setEmailExists(true);
        setEmailError(data.message);
        setTempToken('');
      } else {
        setEmailError('驗證電子郵件失敗，請稍後重試');
        setTempToken('');
      }
    } catch (error) {
      console.error('檢查電子郵件錯誤:', error);
      setEmailError('檢查電子郵件失敗，請稍後重試');
      setTempToken('');
    } finally {
      setEmailCheckLoading(false);
    }
  };
  const handleGoogleSignIn = async () => {
    setSignInError('');
    const provider = new GoogleAuthProvider();

    try {
      const auth = getAuth();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user) {
        // Google 登入成功，獲取使用者資訊
        const googleEmail = user.email;
        const googleName = user.displayName;
        const idToken = await user.getIdToken(); // 獲取 Firebase ID Token

        // 將 ID Token 發送到後端進行驗證和後續處理
        await checkGoogleSignInStatus(googleEmail, googleName, idToken);
      }
    } catch (error) {
      console.error('Google 登入錯誤:', error);
      setSignInError(error.message);
    }
  };
//google註冊
  const checkGoogleSignInStatus = async (googleEmail, googleName, idToken) => {
    try {
      const response = await fetch('/api/member/googleCallback', { // 後端驗證 API
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`, // 將 ID Token 放在 Authorization Header 中
        },
        body: JSON.stringify({ googleEmail, googleName }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.userExists && data.hasDetails) {
          console.log('Google 登入成功，已存在使用者且有詳細資料');
          window.location.href = '/member/dashboard'; // 導向使用者儀表板
        } else {
          console.log('Google 登入成功，需要填寫詳細資料');
          router.push(`/member/MemberLogin/register2?googleEmail=${encodeURIComponent(googleEmail)}&googleName=${encodeURIComponent(googleName)}&isGoogleSignIn=true`);
        }
      } else {
        console.error('Google 登入回調失敗:', data);
        alert('Google 登入失敗，請稍後重試');
      }
    } catch (error) {
      console.error('檢查 Google 登入狀態錯誤:', error);
      alert('Google 登入失敗，請稍後重試');
    }
  };
  //條款視窗
  const showTermsPopup = (e) => {
    e.preventDefault();
    setPopupText(termsText);
    setIsTermsVisible(true);
    setIsPrivacyVisible(false); // 確保另一個彈窗關閉
  };

  const showPrivacyPopup = (e) => {
    e.preventDefault();
    setPopupText(privacyPolicyText);
    setIsPrivacyVisible(true);
    setIsTermsVisible(false); // 確保另一個彈窗關閉
  };

  const closePopup = () => {
    setIsTermsVisible(false);
    setIsPrivacyVisible(false);
    setPopupText('');
  };
  
// 使用條款文字內容
const termsText = `
歡迎來到「毛孩之家」（以下簡稱「本網站」）。請仔細閱讀以下使用條款，使用本網站即表示您同意受本條款約束。

1. 服務簡介

本網站致力於提供流浪動物領養資訊，促進寵物與合適飼主的媒合，並建立愛寵社群。您可透過本網站發布領養資訊、查閱相關內容及參與社群互動。

2. 用戶責任

註冊帳戶時，您須提供準確、完整的個人資料，並妥善保管您的帳號資訊。

不得發布虛假、誤導性或違法資訊，包括假冒動物領養資訊、商業廣告等。

尊重社群規範，不得騷擾、辱罵或攻擊其他用戶。

3. 知識產權

本網站的所有內容（包括但不限於文字、圖片、商標及程式碼）受相關法律保護，未經授權不得擅自使用、複製或分發。

4. 責任限制

本網站僅作為資訊媒合平台，不對任何領養交易的結果負責。

我們不對任何用戶行為或外部網站的內容承擔責任。

5. 變更條款

本網站保留隨時修改本條款的權利，變更後的條款將於網站公告生效，請定期查閱。
`;

// 私隱政策文字內容
const privacyPolicyText = `
本網站尊重您的個人隱私，並致力於保護您的個人資料安全。

1. 收集資訊

我們可能收集以下類型的個人資料：

註冊帳號時提供的姓名、電子郵件、聯絡方式。

您發布的領養資訊、留言或其他互動記錄。

您的瀏覽行為，例如頁面訪問紀錄及裝置資訊。

2. 資訊用途

我們收集的資訊僅用於以下目的：

提供、維護及改善網站服務。

確保領養資訊的真實性與安全性。

依據用戶行為優化網站體驗。

3. 資訊分享與保護

我們不會出售、出租或與未經授權的第三方共享您的個人資料。

我們將採取合理的安全措施保護您的個人資訊，避免未經授權的存取或洩露。

若因法律要求或保障社群安全需要，我們可能依法提供資料。

4. 用戶權利

您可隨時查閱、更新或刪除您的個人資料。

若您希望撤回個資使用權或對資料處理有任何疑問，請聯繫我們。

5. 政策更新

我們可能會不定期更新本私隱政策，更新後的政策將於網站公告生效。

如有任何疑問，請透過本網站聯絡我們，謝謝您的支持！
`;

  return (
    <>
      <div className={styles.formContainer}>
        <div className={styles.form}>
          <h2 className={styles.sectionTitle}>加入會員</h2>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>
              電子信箱 :
            </label>
            <br />
            <input
              type="email"
              id="email"
              className={styles.formInput}
              required
              value={email}
              onChange={handleEmailChange}
            />
            {emailError && <p className={styles.error}>{emailError}</p>}
            {emailCheckLoading && <p>檢查中...</p>}
            <br /> <br />
            <label htmlFor="password" className={styles.formLabel}>
              密碼 :
            </label>
            <br />
            <input
              type="password"
              id="password"
              className={styles.formInput}
              required
              value={password}
              onChange={handlePasswordChange}
            />
            {passwordError && <p className={styles.error}>{passwordError}</p>}
            <br /> <br />
            <label htmlFor="confirmPassword" className={styles.formLabel}>
              確認密碼 :
            </label>
            <br />
            <input
              type="password"
              id="confirmPassword"
              className={styles.formInput}
              required
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
            />
            {confirmPasswordError && <p className={styles.error}>{confirmPasswordError}</p>}
            <br /> <br />
            <br />
            <button
              className="button"
              style={{ width: '200px', height: '50px', fontSize: '28px' }}
              onClick={handleNextStep}
            >
              下一步
            </button>
            <br /><br />
            <div>
              <p className={styles.loginLink}>
                已經是會員?
                <a
                  href="\member\MemberLogin\login"
                  className={styles.link}
                  style={{ fontSize: '20px' }}
                >
                  點此登入
                </a>
              </p>
              <p className={styles.termsText}>
                點擊「註冊」即表示你同意我們的
                <a href="#" 
                className={styles.link} 
                style={{ fontSize: '20px' }}
                onClick={showTermsPopup}
                >
                  使用條款
                </a>
                及
                <a href="#" 
                className={styles.link} 
                style={{ fontSize: '20px' }}
                onClick={showPrivacyPopup}
                >
                  私隱政策
                </a>
                。
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {(isTermsVisible || isPrivacyVisible) && (
        <div className={styles.popupOverlay} onClick={(e) => { if (e.target.className === styles.popupOverlay) closePopup(); }}>
          <div className={styles.popup}>
            <h3>{isTermsVisible ? '使用條款' : '私隱政策'}</h3>
            <pre>{popupText}</pre>
            <button onClick={closePopup}>
              關閉
            </button>
          </div>
        </div>
      )}
    </>
  );
}