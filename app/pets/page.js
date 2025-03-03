'use client'

import Image from 'next/image'
import React, { useState, useEffect } from 'react'

export default function PetsPage(props) {
  return (
    <>
      <Image
        src="/images/Banner.jpg"
        alt="圖片描述"
        layout="responsive"
        width={300}
        height={200}
        priority
      />
      <div>Pets Page</div>
    </>
  )
}
