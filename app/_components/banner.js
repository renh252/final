'use client'

import Image from 'next/image'
import React from 'react'
import { usePathname } from 'next/navigation'
import styles from './banner.module.css'

// Banner 配置
const bannerHome = {
  '/': {
    show: true,
    image: '/images/Banner.jpg',
    title: '毛孩之家',
  },
}
const bannerConfig = {
  '/pets': {
    show: true,
    image: '/images/banner-pets.png',
    title: '寵物領養',
  },
  '/shop': {
    show: true,
    image: '/images/banner-pets.png',
    title: '商城',
  },
  '/donate/flow': {
    show: true,
    image: '/images/banner-pets.png',
    title: '捐款',
  },
}

export default function Banner() {
  const pathname = usePathname()

  // 獲取當前頁面的 Banner 配置
  const config = bannerConfig[pathname] ||
    bannerHome[pathname] || {
      show: false,
      image: '/images/Banner.jpg',
      title: '毛孩之家',
    }
  if (!config.show) {
    return null
  } else if (config == bannerHome[pathname]) {
    return (
      <div className={styles.banner}>
        <Image
          src={config.image}
          alt={config.title}
          width={1920}
          height={600}
          priority
          style={{
            width: '100%',
            height: 'auto',
          }}
        />
        <div className={styles.banner_title}>{config.title}</div>
      </div>
    )
  } else {
    return (
      <div className={styles.banner}>
        <Image
          src={config.image}
          alt={config.title}
          width={1920}
          height={600}
          priority
          style={{
            width: '100%',
            height: '50vh',
          }}
        />
        <div className={styles.banner_title}>{config.title}</div>
      </div>
    )
  }
}
