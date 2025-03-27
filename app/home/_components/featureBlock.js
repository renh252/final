'use client'

import Link from 'next/link'
import styles from './featureBlock.module.css'

export default function FeatureBlock({ title, description, icon, link }) {
  return (
    <div className={styles.card}>
      <div className={styles.icon}>{icon}</div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      <Link href={link} className={styles.button}>
        查看更多 →
      </Link>
    </div>
  )
}
