'use client';

import React, { useState, useEffect } from 'react'; // 引入 useEffect
import styles from './Register2.module.css';
import { useSearchParams, useRouter } from 'next/navigation';

export default function Register2Page() {

  const router = useRouter();
  const searchParams = useSearchParams();
  const tempToken = searchParams.get('token');
  const password = searchParams.get('password');
  const googleEmail = searchParams.get('googleEmail'); // 接收 googleEmail
  const isGoogleSignIn = searchParams.get('isGoogleSignIn') === 'true'; // 接收 isGoogleSignIn

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [address, setAddress] = useState('');
  const [registrationError, setRegistrationError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const validatePhoneNumber = (phoneNumber) => {
    const phoneRegex = /^09\d{8}$/;
    return phoneRegex.test(phoneNumber);
  };

  useEffect(() => {
    // 在組件掛載時檢查 token 和 password 是否存在
    if (!isGoogleSignIn && (!tempToken || !password)) {
      router.push('/member/MemberLogin/register');
    }
  }, [isGoogleSignIn, tempToken, password, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let errors = [];

    if (!name) errors.push('請填寫姓名欄位');
    if (!phone) errors.push('請填寫電話欄位');
    else if (!validatePhoneNumber(phone)) errors.push('電話號碼格式不正確，請輸入有效的台灣手機號碼');
    if (!birthday) errors.push('請填寫生日欄位');
    if (!address) errors.push('請填寫地址欄位');

    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    const requestBody = {
      name,
      phone,
      birthday,
      address,
      isGoogleSignIn: isGoogleSignIn,
    };

    if (isGoogleSignIn) {
      requestBody.googleEmail = googleEmail;
    } else {
      requestBody.tempToken = tempToken;
      requestBody.password = password;
    }

    try {
      const response = await fetch('/api/member/register/final', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('伺服器返回資料:', data);

      if (response.ok) {
        setRegistrationSuccess(true);
        alert(data.message);
        window.location.href = '/member/MemberLogin/login';
      } else {
        setRegistrationError(data.message);
        alert(data.message);
      }
    } catch (error) {
      console.error('註冊錯誤:', error);
      setRegistrationError('註冊失敗，請稍後重試');
      alert('註冊失敗，請稍後重試');
    }
  };

  const handleGoBack = () => {
    router.push('/member/MemberLogin/register');
  };

  if (registrationSuccess) {
    return (
      <div className={styles.registration_wrapper}>
        <section className={styles.welcome_section}>
          <h1 className={styles.welcome_title}>註冊成功！</h1>
          <p className={styles.welcome_message}>
            您已成功註冊成為毛孩之家會員！
            <br />
            即將導向登入頁面...
          </p>
        </section>
      </div>
    );
  }

  return (
    <>
      <div className={styles.registration_wrapper}>
        <section className={styles.welcome_section}>
          <h1 className={styles.welcome_title}>歡迎加入毛孩之家 !</h1>
          <p className={styles.welcome_message}>
            歡迎加入成為我們的會員，您將與我們一起打造一個充滿愛與關懷的動物樂園。無論您是否為愛犬、愛貓還是其他寵物的飼主，這裡都將是您與寶貝們共享美好時光的溫暖家園。身為會員，能享有專屬折扣與優惠，還能優先參加各類活動，與其他毛孩家長互動交流，分享照護心得與歡笑點滴。
            <br />
            感謝您加入我們的大家庭，與我們一起守護毛孩的幸福未來！
            <br />
            <br />
            <span className={styles.highlight_text}>
              請繼續完成以下基本資料填寫，即註冊完成 !
            </span>
          </p>
        </section>
        <h2 className={styles.form_title}>基本資料</h2>
        <form className={styles.registration_form} onSubmit={handleSubmit}>
          <div className={styles.form_group}>
            <label className={styles.form_label}>
              姓名 :<span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={styles.form_input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className={styles.form_group}>
            <label className={styles.form_label}>
              電話 :<span className={styles.required}>*</span>
            </label>
            <input
              type="tel"
              className={styles.form_input}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className={styles.form_group}>
            <label className={styles.form_label}>
              生日 :<span className={styles.required}>*</span>
            </label>
            <input
              type="date"
              className={styles.form_input}
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              required
            />
          </div>
          <div className={styles.form_group}>
            <label className={styles.form_label}>
              地址 :<span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={styles.form_input}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
        </form>

        <div className={styles.form_button}>
          <button className="button" onClick={handleGoBack}>
            回上一步
          </button>
          <button className="button" 
          onClick={handleSubmit} 
          disabled={!isGoogleSignIn && (!tempToken || !password)}>
            完成
          </button>
          {!isGoogleSignIn && (!tempToken || !password) && (
            <p style={{ color: 'orange' }}>請先完成第一步驗證電子郵件和輸入密碼。</p>
          )}
          {registrationError && <p style={{ color: 'red' }}>{registrationError}</p>}
        </div>
      </div>
    </>
  );
}