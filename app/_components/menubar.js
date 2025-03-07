'use client'

import { useEffect, useState, useCallback } from 'react'
import styles from './menubar.module.css'
import Link from 'next/link'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Navbar, Nav, NavDropdown, Button, Container } from 'react-bootstrap'
import { usePathname } from 'next/navigation'

export default function Menubar() {
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
              <Nav.Link href="/member">會員</Nav.Link>
              <Nav.Link href="/cart">購物車</Nav.Link>
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
