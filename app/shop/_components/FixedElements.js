import ReactDOM from 'react-dom'
import React, { useState, useEffect, useRef,useCallback } from 'react'
import Link from 'next/link'
import ProductMenu from '@/app/shop/_components/productMenu'
import styles from './FixedElements.module.css'
import { MdOutlinePets } from "react-icons/md";
import { FaArrowLeft } from "react-icons/fa6";

export default function CidPage(props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [dragPosition, setDragPosition] = useState({ y: Math.max(150, 56) }); // 初始位置
  const [isDragging, setIsDragging] = useState(false);
  // const [isTouch, setIsTouch] = useState(false);
  const dragRef = useRef(null);
  const dragStartRef = useRef(null);

  // 開關選單
  const toggleMenu = useCallback((e) => {
    if (e) e.stopPropagation();
    setMenuOpen(prevState => !prevState);
  }, []);

  // 禁用页面滚动
  useEffect(() => {
    if (menuOpen || isDragging) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen, isDragging]);

  // 上下滑動------------------------------------------
  useEffect(() => {
    const handleStart = (e) => {
      const isTouch = e.type === 'touchstart';
      if (isTouch) e.preventDefault(); // 阻止触摸事件的默认行为
      
      setIsDragging(false);
      const clientY = isTouch ? e.touches[0].clientY : e.clientY;
      const startY = clientY - dragPosition.y;
      dragStartRef.current = { 
        y: clientY, 
        time: new Date().getTime() 
      };

      const handleMove = (e) => {
        if (isTouch) e.preventDefault(); // 阻止触摸移动的默认行为
        setIsDragging(true);
        const clientY = isTouch ? e.touches[0].clientY : e.clientY;
        const newY = clientY - startY;
        const maxY = window.innerHeight - dragRef.current.offsetHeight;
        const boundedY = Math.max(56, Math.min(newY, maxY));
        setDragPosition({ y: boundedY });
      };

      const handleEnd = (e) => {
        const isTouch = e.type === 'touchend';
        if (isTouch) e.preventDefault(); // 阻止触摸结束的默认行为
        
        document.removeEventListener(isTouch ? 'touchmove' : 'mousemove', handleMove, { passive: false });
        document.removeEventListener(isTouch ? 'touchend' : 'mouseup', handleEnd);
        
        const endTime = new Date().getTime();
        const timeDiff = endTime - dragStartRef.current.time;
        
        if (!isDragging && timeDiff < 200) {
          const clientY = isTouch ? e.changedTouches[0].clientY : e.clientY;
          const dy = clientY - dragStartRef.current.y;
          if (Math.abs(dy) < 10) {
            toggleMenu(e);
          }
        }
        setIsDragging(false);
      };

      document.addEventListener(isTouch ? 'touchmove' : 'mousemove', handleMove, { passive: false });
      document.addEventListener(isTouch ? 'touchend' : 'mouseup', handleEnd);
    };

    const dragElement = dragRef.current;
    if (dragElement) {
      dragElement.addEventListener('mousedown', handleStart);
      dragElement.addEventListener('touchstart', handleStart, { passive: false });
    }

    return () => {
      if (dragElement) {
        dragElement.removeEventListener('mousedown', handleStart);
        dragElement.removeEventListener('touchstart', handleStart);
      }
    };
  }, [dragPosition, isDragging, toggleMenu]);

  return ReactDOM.createPortal(
    <>
      <div className={`${styles.productMenu} ${menuOpen ? styles.open : ''}`}>
        <Link href={'/shop'} className={styles.menuTitle}>
        <FaArrowLeft/> 返回商城
        </Link>
        <ProductMenu />
      </div>

      <button 
        ref={dragRef}
        className={`${styles.menuToggle} ${menuOpen ? styles.open : ''}`} 
        style={{ top: `${dragPosition.y}px` }}
      >
        <MdOutlinePets/>
        <p className={styles.verticalText }>
        {menuOpen ? "關閉" : "選單"}
        </p>
      </button>
    </>,
    document.body
  )
}