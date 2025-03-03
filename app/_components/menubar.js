'use client'

import { useEffect, useState, useCallback } from 'react'
import styles from './menubar.module.css'
import Link from 'next/link'
import 'bootstrap/dist/css/bootstrap.min.css'
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
    console.log(currentScrollPos)
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
      <header className={styles.header_banner}>
        <div className="nav-bg fixed-top">
          <nav
            className="navbar navbar-expand-lg bg-body-tertiary"
            style={{
              position: 'fixed',
              top: 0,
              width: '100%',
              transition: 'top 0.3s',
              top: visible ? '0' : '-80px',
            }}
          >
            <div className="container-fluid">
              <Link className="navbar-brand" href="/">
                毛孩之家
              </Link>
              <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent"
                aria-expanded="true"
                aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon"></span>
              </button>
              <div
                className="collapse navbar-collapse"
                id="navbarSupportedContent"
              >
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                  <li
                    className={
                      pathname === '/' ? 'nav-item active' : 'nav-item'
                    }
                  >
                    <Link className="nav-link" href="/">
                      首頁
                    </Link>
                  </li>
                  <li
                    className={
                      pathname.includes('/shop')
                        ? 'nav-item active'
                        : 'nav-item'
                    }
                  >
                    <Link className="nav-link" href="/shop">
                      商城
                    </Link>
                  </li>
                  <li
                    className={
                      pathname.includes('/pets')
                        ? 'nav-item active'
                        : 'nav-item'
                    }
                  >
                    <Link className="nav-link" href="/pets">
                      寵物列表
                    </Link>
                  </li>
                  <li
                    className={
                      pathname.includes('/forum')
                        ? 'nav-item active'
                        : 'nav-item'
                    }
                  >
                    <Link className="nav-link" href="/forum">
                      論壇
                    </Link>
                  </li>
                  <li
                    className={
                      pathname.includes('/donate')
                        ? 'nav-item active'
                        : 'nav-item'
                    }
                  >
                    <Link className="nav-link" href="/donate">
                      捐款
                    </Link>
                  </li>
                  <li
                    className={
                      pathname.includes('/member')
                        ? 'nav-item active'
                        : 'nav-item'
                    }
                  >
                    <Link className="nav-link" href="/member">
                      會員
                    </Link>
                  </li>
                  <li
                    className={
                      pathname.includes('/cart')
                        ? 'nav-item active'
                        : 'nav-item'
                    }
                  >
                    <Link className="nav-link" href="/cart">
                      購物車
                    </Link>
                  </li>
                  <li
                    className={
                      pathname.includes('/contact')
                        ? 'nav-item active'
                        : 'nav-item'
                    }
                  >
                    <Link className="nav-link" href="/contact">
                      聯絡我們
                    </Link>
                  </li>
                  <li className="nav-item dropdown">
                    <a
                      className="nav-link dropdown-toggle"
                      href="#"
                      role="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      下拉式
                    </a>
                    <ul className="dropdown-menu">
                      <li>
                        <Link className="dropdown-item" href="/forum">
                          論壇
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" href="/donate">
                          捐款
                        </Link>
                      </li>
                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                      <li>
                        <Link className="dropdown-item" href="#">
                          Something else here
                        </Link>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
        </div>
      </header>
    </>
  )
}
