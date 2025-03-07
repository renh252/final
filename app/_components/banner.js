'use client'

import Image from 'next/image'
import React from 'react'
import styles from './banner.module.css'

export default function Banner({
  show = false,
  image = '/images/Banner.jpg',
  title = '毛孩之家',
}) {
  console.log('Banner props:', { show, image, title }) // 添加調試日誌

  if (!show) return null

  return (
    <div className={styles.banner}>
      <Image
        src={image}
        alt={title}
        layout="responsive"
        width={1920}
        height={600}
        priority
      />
      <div className={styles.banner_title}>{title}</div>
    </div>
  )
}
