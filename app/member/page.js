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
    <section className={styles.logos_section}>
      <div className={styles.logos_grid}>
        <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/d98d246a112f9c972cf06b8f270688b5a5117bbb" alt="Partner logo" className="partner-logo" />
        <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/71ed6d0bda57ac11f298a7b08fb4e70c1e38633a" alt="Partner logo" className="partner-logo" />
        <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/39351883fade962b00ba084353b20f42dc52f387" alt="Partner logo" className="partner-logo" />
        <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/239b5de2c6c71bcc11d73ed0b879170145748c37" alt="Partner logo" className="partner-logo" />
        <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/cb0b8b4e01599a6ab799fec12982a67934c60bac" alt="Partner logo" className="partner-logo partner-logo-wide" />
        <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/825a329fe4aa6f4d4be11f40cde69cef9528f0b1" alt="Partner logo" className="partner-logo partner-logo-narrow" />
      </div>
    </section>
    <section className={styles.profile_section}>
      <div className={styles.profile_card}>
        <header className={styles.profile_header}>
          <h1 className={styles.profile_title}>個人資料</h1>
        </header>
        <div className={styles.profile_form}>
          <div className={styles.form_group}>
            <label className={styles.form_label}>姓名 :</label>
            <div className={styles.form_input} />
          </div>
          <div className={styles.form_group}>
            <label className={styles.form_label}>電話 :</label>
            <div className={styles.form_input} />
          </div>
          <div className={styles.form_group}>
            <label className={styles.form_label}>生日 :</label>
            <div className={styles.form-input} />
          </div>
          <div className={styles.form_group}>
            <label className={styles.form_label}>論壇ID :</label>
            <div className={styles.form_input} />
          </div>
          <div className={styles.form_group,address_group}>
            <div className={styles.address_container}>
              <label className={styles.form_label}>地址 :</label>
              <div className={styles.form_input,address_input} />
            </div>
          </div>
        </div>
        <div className={styles.profile_actions}>
          <div className={styles.edit_button_bg} />
          <button className={styles.edit_button}>修改資料</button>
        </div>
        <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/c07e5bb4325caeb94efd091416f6964123f3611a" alt="大頭照" className="profile-photo" />
        <p className={styles.profile_nickname}>暱稱 : 愛心小天使</p>
      </div>
    </section>
    <aside className={styles.floating_menu} />
  </div>
</main>

    </>
  )
}