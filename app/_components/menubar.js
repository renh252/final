'use client'

import { useEffect, useState, useCallback } from 'react'
import styles from './menubar.module.css'
import Link from 'next/link'
import { Navbar, Nav, NavDropdown, Button, Container } from 'react-bootstrap'
import { usePathname } from 'next/navigation'
import NotificationBell from './NotificationBell'
import { useAuth } from '@/app/context/AuthContext'

export default function Menubar() {
  const { user, loading } = useAuth()
  const pathname = usePathname()

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
      >
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
              <Nav.Link href="/member">會員</Nav.Link>
              <div className={styles.notificationWrapper}>
                <NotificationBell />
              </div>
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
