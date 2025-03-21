'use client'

import React, { useState, useEffect } from 'react'

export default function UserDataRoute(props) {
  return (
    <>
      <div classname="{styles.fieldContainer}">
  <label classname="{styles.label}">{'{'}label{'}'}:</label>
  <input type="{type}" name="{name}" required="{required}" classname="{styles.input}" aria-label="{label}" />
  <section classname="{styles.welcomeContainer}">
    <h1 classname="{styles.title}">歡迎加入毛孩之家 !</h1>
    <article classname="{styles.message}">
      歡迎加入成為我們的會員，您將與我們一起打造一個充滿愛與關懷的動物樂園。無論您是否為愛犬、愛貓還是其他寵物的飼主，這裡都將是您與寶貝們共享美好時光的溫暖家園。身為會員，能享有專屬折扣與優惠，還能優先參加各類活動，與其他毛孩家長互動交流，分享照護心得與歡笑點滴。
      <br />
      感謝您加入我們的大家庭，與我們一起守護毛孩的幸福未來！
      <br />
      <br />
      <strong classname="{styles.instruction}">
        請繼續完成以下基本資料填寫，即註冊完成 !
      </strong>
    </article>
  </section>
  <form onsubmit="{handleSubmit}" classname="{styles.formContainer}">
    <h2 classname="{styles.formTitle}">基本資料</h2>
    <div classname="{styles.fieldsContainer}">
      <formfield label="姓名" name="name">
        <formfield label="電話" name="phone" type="tel">
          <formfield label="生日" name="birthday" type="date">
            <formfield label="地址" name="address">
              <button type="submit" classname="{styles.submitButton}">
                完成
              </button>
            </formfield></formfield></formfield></formfield></div>
  </form>
  <main classname="{styles.mainContainer}">
    <div classname="{styles.contentWrapper}">
      <welcomesection>
        <registrationform>
          <div classname="{styles.separator}">
            <div classname="{styles.separatorLine}">
            </div>
          </div>
          <div classname="{styles.spacer}">
          </div></registrationform></welcomesection></div></main>
</div>

    </>
  )
}
