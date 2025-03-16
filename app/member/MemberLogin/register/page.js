'use client';

import React from 'react';
import styles from './Register.module.css';

export default function RegisterPage() {
  return (
    <>
      <main className={styles.container}>
        <section className={styles.registrationWrapper}>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/113fc9eaf2a450ce67599182a38a68d6ecc38c23ec57923abf5c14fdcf528df5?placeholderIfAbsent=true&apiKey=2d1f7455128543bfa30579a9cce96321"
            alt="Decorative background"
            className={styles.decorativeImage}
          />
          <header className={styles.headerSection}>
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/c961159506ebe222e2217510289e3eee7203e02a0affe719332fe812045a0061?placeholderIfAbsent=true&apiKey=2d1f7455128543bfa30579a9cce96321"
              alt="Header background"
              className={styles.headerBackground}
            />
            <h1 className={styles.pageTitle}>會員註冊</h1>
          </header>
          <section className={styles.contentSection}>
            <div className={styles.formContainer}>
              <h2 className={styles.sectionTitle}>快速註冊</h2>
              <div className={styles.socialButtons}>
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
                <button
                  className="button"
                  style={{ width: '350px', height: '60px', fontSize: '20px' }}
                >
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/947deca3304a13703edd669f75def30df7a6bad1d73408cb9ee3fa21c3d9e912?placeholderIfAbsent=true&apiKey=2d1f7455128543bfa30579a9cce96321"
                    alt="Facebook icon"
                    style={{ width: '100px', height: '50px' }}
                  />
                  以Facebook帳號註冊
                </button>
              </div>
              <h2 className={styles.sectionTitle}>加入會員</h2>
              <form className={styles.registrationForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.formLabel}>
                    電子信箱 :
                  </label>
                  <input
                    type="email"
                    id="email"
                    className={styles.formInput}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="password" className={styles.formLabel}>
                    密碼 :
                  </label>
                  <input
                    type="password"
                    id="password"
                    className={styles.formInput}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword" className={styles.formLabel}>
                    確認密碼 :
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    className={styles.formInput}
                    required
                  />
                </div>
              </form>
              <p className={styles.loginLink}>
                已經是會員?
                <a
                  href="#"
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
              <button
                className="button"
                style={{ width: '200px', height: '50px', fontSize: '28px' }}
              >
                註冊
              </button>
            </div>
          </section>
        </section>
      </main>
    </>
  );
}