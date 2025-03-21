'use client';

import React from 'react';
import styles from './Register.module.css';

export default function RegisterPage() {
  return (
    <>
                      <div className={styles.formContainer}>

              <h2 className={styles.sectionTitle}>快速註冊</h2>
              <div className={styles.form}>
              <div className={styles.GFbutton}>
                <button
                  className="button"
                  style={{ width: '350px', height: '60px', fontSize: '20px' }}
                >
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/153b2dcd7ca2627a463800e38ebc91cf43bcd541ad79fa3fea9919eec17199df?placeholderIfAbsent=true&apiKey=2d1f7455128543bfa30579a9cce96321"
                    alt="Google icon"
                    style={{ width: '100px', height: '50px' }}
                  />
                  以Google帳號註冊
                </button>
              </div>
              

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
                  />
                  <br />  <br />
                  <label htmlFor="password" className={styles.formLabel}>
                    密碼 :
                  </label>
                  <br />
                  <input
                    type="password"
                    id="password"
                    className={styles.formInput}
                    required
                  />
                    <br />  <br />
                  <label htmlFor="confirmPassword" className={styles.formLabel}>
                    確認密碼 :
                  </label>
                  <br />
                  <input
                    type="password"
                    id="confirmPassword"
                    className={styles.formInput}
                    required
                  />
                    <br />  <br />
                    <br />  
              <button
                className="button"
                style={{ width: '200px', height: '50px', fontSize: '28px' }}
              >
                註冊
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
                <a
                  href="#"
                  className={styles.link}
                  style={{ fontSize: '20px' }}
                >
                  使用條款
                </a>
                及
                <a
                  href="#"
                  className={styles.link}
                  style={{ fontSize: '20px' }}
                >
                  私隱政策
                </a>
                。
              </p>
              </div>
              
                  </div>
              </div>
            </div>
    </>
  );
}