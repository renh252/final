'use client'

import React, { useState, useEffect } from 'react'
import styles from './resgister2.module.css';
export default function Register2Page(props) {
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
    <form className={styles.registration_form}>
      <div className={styles.form_group}>
        <label className={styles.form_label}>姓名 :</label>
        <input type="text" className={styles.form_input} />
      </div>
      <div className={styles.form_group}>
        <label className={styles.form_label}>電話 :</label>
        <input type="tel" className={styles.form_input} />
        <label className={styles.form_label}>生日 :</label>
        <input type="date" className={styles.form_input} />
        <label className={styles.form_label}>地址 :</label>
        <input type="text" className={styles.form_input} />
        <br />
        <div className={styles.form_button}>
        <button className="button"
                style={{ width: '200px', height: '80px', fontSize: '30px'}}>
                完成
              </button>
              </div>
        
      </div>
    </form>

  </div>

    </>
  )
}
