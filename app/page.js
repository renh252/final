'use client'

import Image from 'next/image'
import React, { useState, useEffect } from 'react'

export default function Page(props) {
  return (
    <>
      <Image
        src="/images/Banner.jpg"
        alt="圖片描述"
        layout='responsive'
        width={300}
        height={200}
      />
      <div>頁面內容edit</div>
    </>
  )
}
