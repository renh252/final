'use client'

import Image from 'next/image'
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

  // 判斷是否為會員頁面特殊路徑
  const config = pathname.startsWith('/member')
    ? bannerConfig['/member/layout']
    : bannerConfig[pathname] || {
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
