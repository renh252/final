'use client'

import Image from 'next/image'
import styles from '../donate.module.css'

export default function MethodItem({imgSrc, alt, title, description }) {
  return (
    <>
      <div className={styles.method_item}>
        <div className={styles.icon}>
          <Image src={imgSrc} alt={alt} width={150} height={150}></Image>
        </div>
        <div className={styles.content}>
          <h5>{title}</h5>
          {description}
        </div>
      </div>
    </>
  )
}
