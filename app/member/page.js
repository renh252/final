'use client'

import React, { useState, useEffect } from 'react'
import styles from "./member.module.css";
export default function MemberPage(props) {
  
  return (
    <>
<main className={styles.profile_page}>
  <div className={styles.profile_container}>
    <header className={styles.hero_section}>
      <img src="./images\member\Frame 312.jpg" alt="Hero background" className="hero-image" />
    </header>
    <section className="logos-section">
      <div className="logos-grid">
        <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/d98d246a112f9c972cf06b8f270688b5a5117bbb" alt="Partner logo" className="partner-logo" />
        <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/71ed6d0bda57ac11f298a7b08fb4e70c1e38633a" alt="Partner logo" className="partner-logo" />
        <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/39351883fade962b00ba084353b20f42dc52f387" alt="Partner logo" className="partner-logo" />
        <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/239b5de2c6c71bcc11d73ed0b879170145748c37" alt="Partner logo" className="partner-logo" />
        <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/cb0b8b4e01599a6ab799fec12982a67934c60bac" alt="Partner logo" className="partner-logo partner-logo-wide" />
        <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/825a329fe4aa6f4d4be11f40cde69cef9528f0b1" alt="Partner logo" className="partner-logo partner-logo-narrow" />
      </div>
    </section>
    <section className="profile-section">
      <div className="profile-card">
        <header className="profile-header">
          <h1 className="profile-title">個人資料</h1>
        </header>
        <div className="profile-form">
          <div className="form-group">
            <label className="form-label">姓名 :</label>
            <div className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">電話 :</label>
            <div className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">生日 :</label>
            <div className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">論壇ID :</label>
            <div className="form-input" />
          </div>
          <div className="form-group address-group">
            <div className="address-container">
              <label className="form-label">地址 :</label>
              <div className="form-input address-input" />
            </div>
          </div>
        </div>
        <div className="profile-actions">
          <div className="edit-button-bg" />
          <button className="edit-button">修改資料</button>
        </div>
        <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/c07e5bb4325caeb94efd091416f6964123f3611a" alt="大頭照" className="profile-photo" />
        <p className="profile-nickname">暱稱 : 愛心小天使</p>
      </div>
    </section>
    <aside className="floating-menu" />
  </div>
</main>

    </>
  )
}