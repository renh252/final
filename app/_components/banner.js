// FILEPATH: c:/iSpan/final/app/_components/banner.js

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
  '/member/layout': {
    show: true,
    image: '/images/banner-pets.png',
    title: '會員中心',
  },
}

export default function Banner() {
  const pathname = usePathname()

  // 修改这里的逻辑以处理 /member 开头的路径
  const config = pathname.startsWith('/member')
    ? bannerConfig['/member/layout']
    : bannerConfig[pathname] || bannerHome[pathname] || {
        show: false,
        image: '/images/Banner.jpg',
        title: '毛孩之家',
      }

  if (!config.show) {
    return null
  }

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
          height: pathname === '/' ? '100vh' : '50vh',
        }}
      />
      <div className={styles.banner_title}>{config.title}</div>
    </div>
  )
}