'use client'

import React, { useState, useEffect } from 'react'
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


export default function FirstPageNav() {

  const [openState, setOpenState] = useState({});
  const handleMouseEnter = (index) =>
    setOpenState((prev) => ({ ...prev, [index]: true }));
  const handleMouseLeave = (index) =>
    setOpenState((prev) => ({ ...prev, [index]: false }));


  return (
    <>
    <div className={styles.product_nav}>
        <button className={styles.angle}>
          <FaAngleLeft/>
        </button>
        <div className={styles.nav_items}>

        {Category.filter((category) => category.parent_id == null).map((parent) => (
            <>
              <div className={styles.item_group} 
                onMouseEnter={() => handleMouseEnter(parent.id)}
                onMouseLeave={() => handleMouseLeave(parent.id)}>
                <Link href = {`/shop/categories/${parent.id}`}
                onMouseEnter={() => handleMouseEnter(parent.id)}
                onMouseLeave={() => handleMouseLeave(parent.id)}
                >
                  {parent.category_name}
                </Link>
                <Collapse in={openState[parent.id]} className={styles.collapse}>
                    <ul>
                      {Category.filter((category_child) => category_child.parent_id == parent.id).map((child) => (
                        <>
                          <Link href = {`/shop/categories/${parent.id}/${child.id}`} className={styles.subtitle}>
                            <li>{child.category_name}</li>
                          </Link>
                        </>
                      ))}
                    </ul>
                  
                </Collapse>
              </div>
            
            </>
        ))}
        {Category.filter((category) => category.parent_id == null).map((parent) => (
            <>
              <div className={styles.item_group} 
                onMouseEnter={() => handleMouseEnter(parent.id)}
                onMouseLeave={() => handleMouseLeave(parent.id)}>
                <Link href = {`/shop/categories/${parent.id}`}
                onMouseEnter={() => handleMouseEnter(parent.id)}
                onMouseLeave={() => handleMouseLeave(parent.id)}
                >
                  {parent.category_name}
                </Link>
                <Collapse in={openState[parent.id]} className={styles.collapse}>
                    <ul>
                      {Category.filter((category_child) => category_child.parent_id == parent.id).map((child) => (
                        <>
                          <Link href = {`/shop/categories/${parent.id}/${child.id}`} className={styles.subtitle}>
                            <li>{child.category_name}</li>
                          </Link>
                        </>
                      ))}
                    </ul>
                  
                </Collapse>
              </div>
            
            </>
        ))}
        {Category.filter((category) => category.parent_id == null).map((parent) => (
            <>
              <div className={styles.item_group} 
                onMouseEnter={() => handleMouseEnter(parent.id)}
                onMouseLeave={() => handleMouseLeave(parent.id)}>
                <Link href = {`/shop/categories/${parent.id}`}
                onMouseEnter={() => handleMouseEnter(parent.id)}
                onMouseLeave={() => handleMouseLeave(parent.id)}
                >
                  {parent.category_name}
                </Link>
                <Collapse in={openState[parent.id]} className={styles.collapse}>
                    <ul>
                      {Category.filter((category_child) => category_child.parent_id == parent.id).map((child) => (
                        <>
                          <Link href = {`/shop/categories/${parent.id}/${child.id}`} className={styles.subtitle}>
                            <li>{child.category_name}</li>
                          </Link>
                        </>
                      ))}
                    </ul>
                  
                </Collapse>
              </div>
            
            </>
        ))}
        {Category.filter((category) => category.parent_id == null).map((parent) => (
            <>
              <div className={styles.item_group} 
                onMouseEnter={() => handleMouseEnter(parent.id)}
                onMouseLeave={() => handleMouseLeave(parent.id)}>
                <Link href = {`/shop/categories/${parent.id}`}
                onMouseEnter={() => handleMouseEnter(parent.id)}
                onMouseLeave={() => handleMouseLeave(parent.id)}
                >
                  {parent.category_name}
                </Link>
                <Collapse in={openState[parent.id]} className={styles.collapse}>
                    <ul>
                      {Category.filter((category_child) => category_child.parent_id == parent.id).map((child) => (
                        <>
                          <Link href = {`/shop/categories/${parent.id}/${child.id}`} className={styles.subtitle}>
                            <li>{child.category_name}</li>
                          </Link>
                        </>
                      ))}
                    </ul>
                  
                </Collapse>
              </div>
            
            </>
        ))}
        {Category.filter((category) => category.parent_id == null).map((parent) => (
            <>
              <div className={styles.item_group} 
                onMouseEnter={() => handleMouseEnter(parent.id)}
                onMouseLeave={() => handleMouseLeave(parent.id)}>
                <Link href = {`/shop/categories/${parent.id}`}
                onMouseEnter={() => handleMouseEnter(parent.id)}
                onMouseLeave={() => handleMouseLeave(parent.id)}
                >
                  {parent.category_name}
                </Link>
                <Collapse in={openState[parent.id]} className={styles.collapse}>
                    <ul>
                      {Category.filter((category_child) => category_child.parent_id == parent.id).map((child) => (
                        <>
                          <Link href = {`/shop/categories/${parent.id}/${child.id}`} className={styles.subtitle}>
                            <li>{child.category_name}</li>
                          </Link>
                        </>
                      ))}
                    </ul>
                  
                </Collapse>
              </div>
            
            </>
        ))}
        {Category.filter((category) => category.parent_id == null).map((parent) => (
            <>
              <div className={styles.item_group} 
                onMouseEnter={() => handleMouseEnter(parent.id)}
                onMouseLeave={() => handleMouseLeave(parent.id)}>
                <Link href = {`/shop/categories/${parent.id}`}
                onMouseEnter={() => handleMouseEnter(parent.id)}
                onMouseLeave={() => handleMouseLeave(parent.id)}
                >
                  {parent.category_name}
                </Link>
                <Collapse in={openState[parent.id]} className={styles.collapse}>
                    <ul>
                      {Category.filter((category_child) => category_child.parent_id == parent.id).map((child) => (
                        <>
                          <Link href = {`/shop/categories/${parent.id}/${child.id}`} className={styles.subtitle}>
                            <li>{child.category_name}</li>
                          </Link>
                        </>
                      ))}
                    </ul>
                  
                </Collapse>
              </div>
            
            </>
        ))}
        {Category.filter((category) => category.parent_id == null).map((parent) => (
            <>
              <div className={styles.item_group} 
                onMouseEnter={() => handleMouseEnter(parent.id)}
                onMouseLeave={() => handleMouseLeave(parent.id)}>
                <Link href = {`/shop/categories/${parent.id}`}
                onMouseEnter={() => handleMouseEnter(parent.id)}
                onMouseLeave={() => handleMouseLeave(parent.id)}
                >
                  {parent.category_name}
                </Link>
                <Collapse in={openState[parent.id]} className={styles.collapse}>
                    <ul>
                      {Category.filter((category_child) => category_child.parent_id == parent.id).map((child) => (
                        <>
                          <Link href = {`/shop/categories/${parent.id}/${child.id}`} className={styles.subtitle}>
                            <li>{child.category_name}</li>
                          </Link>
                        </>
                      ))}
                    </ul>
                  
                </Collapse>
              </div>
            
            </>
        ))}
        </div>
        <button className={styles.angle}>
          <FaAngleRight/>
        </button>
      
    </div>
    </>
  )
}


{Category.filter((category) => category.parent_id == null).map((parent) => (
  <>
  <Link href = {`/shop/categories/${parent.id} `} className={styles.title}>
    <p>{parent.category_name}</p>
  </Link>
  {Category.filter((category_child) => category_child.parent_id == parent.id).map((child) => (
    <>
      <Link href = {`/shop/categories/${parent.id}/${child.id}`} className={styles.subtitle}>
        <p>{child.category_name}</p>
      </Link>
    </>
  ))}
  <hr />
  </>
))}