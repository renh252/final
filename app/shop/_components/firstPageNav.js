'use client'

import React, { useState, useEffect,useRef } from 'react'
import Link from 'next/link'
// data
import Products from '../_data/data.json'
import Category from '../_data/category.json'
// style
import styles from './firstPageNav.module.css'
import "bootstrap/dist/css/bootstrap.min.css";
import { Collapse } from "react-bootstrap";

// 
import { FaAngleLeft,FaAngleRight } from "react-icons/fa6";


// 連接資料庫
import useSWR from 'swr'
const fetcher = (url) => fetch(url).then((res) => res.json())



export default function FirstPageNav() {

  const [openState, setOpenState] = useState({});
  const navItemsRef = useRef(null);

  // collapse
  const handleMouseEnter = (index) =>
    setOpenState((prev) => ({ ...prev, [index]: true }));
  const handleMouseLeave = (index) =>
    setOpenState((prev) => ({ ...prev, [index]: false }));

  // scroll
  const scroll = (direction) => {
    const container = navItemsRef.current;
    if (container) {
      const scrollAmount = 200; // 可以根据需要调整滚动距离
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    } else {
      console.error("Nav items container not found");
    }
  };
   // ----------------------------

  // 使用 SWR 獲取資料 - 使用整合的 API 路由
  const { data, error } = useSWR('/api/shop', fetcher)
// 处理加载状态
  if (!data) return <div>Loading...</div>
    
  // 处理错误状态
  if (error) return <div>Failed to load</div>

  const categories = data.categories
  
  // -----------------



  return (
    <>
    <div className={styles.nav}>
      <div className={styles.product_nav}>
        <button className={styles.angle} onClick={() => scroll('left')}>
          <FaAngleLeft/>
        </button>
        <div className={styles.nav_items_contain}>
          <div className={styles.nav_items}  ref={navItemsRef}>
            {categories.filter((category) => category.parent_id == null).map((parent) => {
              // 检查是否存在子类别
              const hasChildren = categories.some(child => child.parent_id === parent.category_id);
              
              // 只有在有子类别的情况下才渲染父类别
              return hasChildren && (
                <div key={parent.category_id} className={styles.item_group} 
                    onMouseEnter={() => handleMouseEnter(parent.category_id)}
                    onMouseLeave={() => handleMouseLeave(parent.category_id)}
                    >
                  <Link href={`/shop/categories/${parent.category_id}`}>
                    {parent.category_name}
                  </Link>
                </div>
              );
            })}
          </div>
  

        </div>
        <button className={styles.angle}  onClick={() => scroll('right')}>
          <FaAngleRight/>
        </button>
      </div>
  
      {/* Collapse 组件移到外部 */}
      <div className={styles.collapse_contain}>
        {categories.filter((category) => category.parent_id == null).map((parent) => {
          const hasChildren = categories.some(child => child.parent_id === parent.category_id);
          
          return hasChildren && (
            <Collapse key={parent.category_id} in={openState[parent.category_id]} className={styles.collapse}
            onMouseEnter={() => handleMouseEnter(parent.category_id)}
            onMouseLeave={() => handleMouseLeave(parent.category_id)}>
              <ul>
                {categories
                  ?.filter((category_child) => category_child.parent_id == parent.category_id)
                  .map((child) => (
                    <Link key={child.id} href={`/shop/categories/${parent.category_id}/${child.id}`} className={styles.subtitle}>
                      <li>{child.category_name}</li>
                    </Link>
                  ))}
              </ul>
            </Collapse>
          );
        })}
      </div>
      </div>
    </>
  )
}


