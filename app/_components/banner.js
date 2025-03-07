'use client'

import Image from 'next/image'
import React from 'react'
import { usePathname } from 'next/navigation'
import styles from './banner.module.css'

// Banner 配置
const bannerConfig = {
  '/': {
    show: true,
    image: '/images/Banner.jpg',
    title: '毛孩之家',
  },
  '/pets': {
    show: true,
    image: '/images/banner-pets.png',
    title: '寵物領養',
  },
}

export default function Banner() {
  const pathname = usePathname()

  // 獲取當前頁面的 Banner 配置
  const config = bannerConfig[pathname] || {
    show: false,
    image: '/images/Banner.jpg',
    title: '毛孩之家',
  }

  if (!config.show) return null

  return (
    <div className={styles.banner}>
      <Image
        src={config.image}
        alt={config.title}
        layout="responsive"
        width={1920}
        height={600}
        priority
      />
      <div className={styles.banner_title}>{config.title}</div>
    </div>
  )
}
