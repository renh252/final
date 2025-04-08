'use client'

import { useEffect, useState, useCallback } from 'react'
import styles from './menubar.module.css'
import Link from 'next/link'
import { Navbar, Nav, NavDropdown, Button, Container } from 'react-bootstrap'
import { usePathname } from 'next/navigation'
import NotificationBell from './NotificationBell'
import { useAuth } from '@/app/context/AuthContext'
import { LuShoppingCart } from 'react-icons/lu'
import useSWR from 'swr'
import Image from 'next/image'

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function Menubar() {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const [currentPath, setCurrentPath] = useState('/')
  const userId = user?.id
  
  // 客戶端與伺服器端渲染匹配
  const [isBrowser, setIsBrowser] = useState(false)
  
  // 確保只在客戶端渲染影像
  useEffect(() => {
    setIsBrowser(true)
  }, [])

  // 確保路徑在客戶端可用
  useEffect(() => {
    if (pathname) {
      setCurrentPath(pathname)
    }
  }, [pathname])

  // 獲取購物車數據
  const { data: cartData } = useSWR(
    userId ? `/api/shop/cart?userId=${userId}` : null,
    fetcher
  )
  const totalQuantity = cartData?.totalQuantity || 0

  useEffect(() => {
    // 確保這段程式碼只會在瀏覽器端執行
    require('bootstrap/dist/js/bootstrap.bundle.min.js')
  }, [])

  // 監聽滾動事件做隱藏效果
  const [prevScrollPos, setPrevScrollPos] = useState(0)
  const [visible, setVisible] = useState(true)
  const [solid, setSolid] = useState(false)

  const handleScroll = useCallback(() => {
    const currentScrollPos = window.scrollY

    // 簡化隱藏/顯示邏輯:
    // 1. 頁面位於頂部時總是顯示
    // 2. 向上滾動時顯示
    // 3. 向下滾動超過50像素時隱藏
    const isScrollingDown = currentScrollPos > prevScrollPos
    const isScrollingUp = currentScrollPos < prevScrollPos
    const isAtTop = currentScrollPos < 10

    // 向下滾動且超過50像素，則隱藏
    if (isScrollingDown && currentScrollPos > 50) {
      setVisible(false)
    }
    // 向上滾動或在頂部，則顯示
    else if (isScrollingUp || isAtTop) {
      setVisible(true)
    }

    // 處理透明度邏輯：
    // 1. 向上滾動超過30像素時變為不透明
    // 2. 滾動位置低於10像素時保持半透明
    setSolid(
      (isScrollingUp && prevScrollPos - currentScrollPos > 30) ||
        currentScrollPos > 100 // 也在頁面滾動超過100像素時變為不透明
    )

    setPrevScrollPos(currentScrollPos)
  }, [prevScrollPos])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return (
    <>
      <Navbar
        expand="lg"
        collapseOnSelect // 保留這個改進，有助於導航栏穩定性
        className={`bg-body-tertiary fixed-top ${styles.menubar} ${
          visible ? '' : styles.hidden
        } ${solid ? styles.solid : ''}`}
        data-theme="light"
      >
        <Container>
          <Link href="/" passHref legacyBehavior>
            <Navbar.Brand>
              {isBrowser ? (
                <Image
                  src="/images/logo2.png"
                  alt="圖片描述"
                  width={120}
                  height={30}
                  priority={true}
                  style={{ objectFit: 'contain' }}
                />
              ) : (
                <div style={{ width: '120px', height: '30px' }}></div>
              )}
            </Navbar.Brand>
          </Link>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Link href="/" passHref legacyBehavior>
                <Nav.Link>首頁</Nav.Link>
              </Link>
              <Link href="/shop" passHref legacyBehavior>
                <Nav.Link>商城</Nav.Link>
              </Link>
              <Link href="/pets" passHref legacyBehavior>
                <Nav.Link>寵物列表</Nav.Link>
              </Link>
              <Link href="/forum" passHref legacyBehavior>
                <Nav.Link>論壇</Nav.Link>
              </Link>
              <Link href="/donate" passHref legacyBehavior>
                <Nav.Link>捐款</Nav.Link>
              </Link>
              <Link href="/member" passHref legacyBehavior>
                <Nav.Link>會員</Nav.Link>
              </Link>
              <div className={styles.notificationWrapper}>
                <NotificationBell />
              </div>
              {/* 購物車圖標 */}
              <Link href="/shop/cart" passHref legacyBehavior>
                <Nav.Link className={styles.cartIconLink}>
                  <LuShoppingCart className={styles.cartIcon} />
                  {totalQuantity > 0 && (
                    <div className={styles.cartCount}>{totalQuantity}</div>
                  )}
                </Nav.Link>
              </Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  )
}
