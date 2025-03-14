'use client'

import React, { useState, useEffect } from 'react'
import React, { useState } from 'react';

const MemberForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    birthday: '',
    forumId: '',
    address: '',
  });
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 在這裡處理資料庫連接和提交表單資料的邏輯
    console.log('Form data submitted:', formData);
  };

export default function MemsettingPage(props) {
  return (
    <>
    <div>
  <div>
    <h2>會員資料</h2>
    <form onsubmit="{handleSubmit}">
      <div>
        <label htmlfor="name">姓名:</label>
        <input type="text" id="name" name="name" defaultValue="{formData.name}" onchange="{handleChange}" />
      </div>
      <div>
        <label htmlfor="phone">電話:</label>
        <input type="text" id="phone" name="phone" defaultValue="{formData.phone}" onchange="{handleChange}" />
      </div>
      <div>
        <label htmlfor="birthday">生日:</label>
        <input type="date" id="birthday" name="birthday" defaultValue="{formData.birthday}" onchange="{handleChange}" />
      </div>
      <div>
        <label htmlfor="forumId">論壇ID:</label>
        <input type="text" id="forumId" name="forumId" defaultValue="{formData.forumId}" onchange="{handleChange}" />
      </div>
      <div>
        <label htmlfor="address">地址:</label>
        <input type="text" id="address" name="address" defaultValue="{formData.address}" onchange="{handleChange}" />
      </div>
      <button type="submit">提交</button>
    </form>
  </div>
</div>

</>
)
}

export default MemberForm;