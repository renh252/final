import ReactDOM from 'react-dom'
import React, { useState, useEffect, useRef,useCallback } from 'react'
import Link from 'next/link'
import styles from './menuRWD.module.css'
import { MdOutlinePets } from "react-icons/md";
import { FaArrowLeft } from "react-icons/fa6";
import Image from 'next/image'
import { useAuth } from '@/app/context/AuthContext' // 引入 useAuth
import { useRouter } from 'next/navigation' // 導向到登入頁面

export default function MenuRWD({children}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [dragPosition, setDragPosition] = useState({ y: Math.max(150, 56) }); // 初始位置
  const [isDragging, setIsDragging] = useState(false);
  // const [isTouch, setIsTouch] = useState(false);
  const dragRef = useRef(null);
  const dragStartRef = useRef(null);
    const { user, logout } = useAuth() // 從 useAuth 中獲取 logout
    let user_id = user ? user.id : null
  
    const router = useRouter()
  
    const handleLogout = () => {
      logout() // 呼叫登出函數
      router.push('/member/MemberLogin/login') // 確保登出後導向登入頁面
    }
  
    // 讓我的收藏一職顯示在select
    const [selectedCollection, setSelectedCollection] = useState('')

      // 開關選單
  const toggleMenu = useCallback((e) => {
    if (e) e.stopPropagation();
    setMenuOpen(prevState => !prevState);
  }, []);

  // 禁用页面滚动
    const handleCollectionChange = (e) => {
      const selectedValue = e.target.value
      setSelectedCollection(selectedValue)
      if (selectedValue) {
        router.push(`/member/FavoritesList/${selectedValue}`)
      }
    }
  
    if (!user) {
      return <main>{children}</main> // 如果使用者未登入，只渲染 children
    }



  return ReactDOM.createPortal(
    <>
      <div className={styles.menu}>
        <button
          
          
        >
          <Link href={user ? `/member/orders?=${user_id}` : '/member/orders'}>
            我的訂單
          </Link>
        </button>
        <button
          
          
        >
          <Link href="/member/appointments">寵物預約</Link>
        </button>
        <select
          
          
          onChange={handleCollectionChange}
          value={selectedCollection}
        >
          <option value="" disabled style={{ display: 'none' }}>
            我的收藏
          </option>
          <option value="Pets">寵物</option>
          <option value="products">商品</option>
          <option value="articles">文章</option>
        </select>
        <button
          
          
        >
          <Link href="/forum">我的論壇</Link>
        </button>
        <button
          
          
        >
          <Link
            href={user ? `/member/donations?=${user_id}` : '/member/donations'}
          >
            我的捐款
          </Link>
        </button>
        <button
          
          
        >
          <Link href="/">回首頁</Link>
        </button>
        <button
          
          
          onClick={handleLogout} // 添加 onClick 事件
        >
          登出
        </button>
      </div>
      <button>
        <MdOutlinePets/>
        <p className={styles.verticalText }>
        {menuOpen ? "關閉" : "選單"}
        </p>
      </button>
    </>,
    document.body
  )
}