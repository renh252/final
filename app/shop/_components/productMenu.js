'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
// style
import styles from './productMenu.module.css'
// data
import Category from '../_data/category.json'

export default function ProductMenu(props) {
  
  return (
    <>
      <div className={styles.productMenu}>
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
        
      </div>
      
    </>
  )
}
