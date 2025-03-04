'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './component.module.css'

export default function ProductMenu(props) {
  return (
    <>
      <div className={styles.productMenu}>
        <Link href = {` `} className={styles.title}>
          <p>title</p>
        </Link>
        <Link href = {` `} className={styles.subtitle}>subtitle</Link>
        <Link href = {` `} className={styles.subtitle}>subtitle</Link>
        <hr />
        <Link href = {` `} className={styles.title}>
          <p>title</p>
        </Link>
        <Link href = {` `} className={styles.subtitle}>subtitle</Link>
        <Link href = {` `} className={styles.subtitle}>subtitle</Link>
      </div>
      
    </>
  )
}
