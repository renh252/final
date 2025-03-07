'use client'

import { usePathname } from 'next/navigation'
import Banner from './banner'

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

export default function BannerWrapper() {
  const pathname = usePathname()

  // 獲取當前頁面的 Banner 配置
  const currentBannerConfig = bannerConfig[pathname] || {
    show: false,
    image: '/images/Banner.jpg',
    title: '毛孩之家',
  }

  return <Banner {...currentBannerConfig} />
}
