import ReactDOM from 'react-dom'
import React from 'react'
import Link from 'next/link'
import styles from '@/app/shop/cart/cart.module.css'

export default function CartRWD(props) {
  

  return ReactDOM.createPortal(
    <div className={styles.detailRWD}>
      {props.children}
    </div>,
    document.body
  )
}