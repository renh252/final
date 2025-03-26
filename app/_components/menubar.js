'use client'

import { useEffect, useState, useCallback } from 'react'
import styles from './menubar.module.css'
import Link from 'next/link'
import { Navbar, Nav, NavDropdown, Button, Container } from 'react-bootstrap'
import { usePathname } from 'next/navigation'
import NotificationBell from './NotificationBell'
import { LuShoppingCart } from "react-icons/lu";
import { useAuth } from '@/app/context/AuthContext'
// 連接資料庫
import useSWR, { mutate } from 'swr'
const fetcher = (url) => fetch(url).then((res) => res.json())

export default function Menubar() {
  const { user, loading} = useAuth()
  const userId = user?.id
  // 獲取購物車數據
  const { data:cartData, error:cartError } = useSWR(userId ? `/api/shop/cart?userId=${userId}` : null, fetcher)
  const pathname = usePathname()
  // console.log('pathname', pathname)
  useEffect(() => {
    // 確保這段程式碼只會在瀏覽器端執行
    require('bootstrap/dist/js/bootstrap.bundle.min.js')
  }, [])

  // 監聽滾動事件做隱藏效果
  const [prevScrollPos, setPrevScrollPos] = useState(0)
  const [visible, setVisible] = useState(true)

  const handleScroll = useCallback(() => {
    const currentScrollPos = window.scrollY
    // console.log(currentScrollPos)
    setVisible(
      (prevScrollPos > currentScrollPos &&
        prevScrollPos - currentScrollPos > 70) ||
        currentScrollPos < 10
    )
    setPrevScrollPos(currentScrollPos)
  }, [prevScrollPos])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])
  const totalQuantity = cartData?.totalQuantity


  return (
    <>
      <Navbar expand="lg" className="bg-body-tertiary fixed-top">
        <Container>
          <Navbar.Brand href="/">毛孩之家</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="/">首頁</Nav.Link>
              <Nav.Link href="/shop">商城</Nav.Link>
              <Nav.Link href="/pets">寵物列表</Nav.Link>
              <Nav.Link href="/forum">論壇</Nav.Link>
              <Nav.Link href="/donate">捐款</Nav.Link>
              <div className={styles.notificationWrapper}>
                <NotificationBell />
              </div>
              <Nav.Link href="/member">會員</Nav.Link>
              <Nav.Link href="/shop/cart">
              <div className={styles.cart}>
                <LuShoppingCart />
                <div className={styles.cartCount}>{totalQuantity || ''
                }</div>
              </div>
              </Nav.Link>
              <Nav.Link href="/contact">聯絡我們</Nav.Link>
              <NavDropdown title="下拉式" id="basic-nav-dropdown">
                <NavDropdown.Item href="/forum">論壇</NavDropdown.Item>
                <NavDropdown.Item href="/donate">捐款</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="#action/3.4">
                  Separated link
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  )
}
