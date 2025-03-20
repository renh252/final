'use client'

import React, { useState, useEffect } from 'react'
import styles from './list.module.css'

export default function List({title, body}) {
  return (
    <div className={styles.container}>
      <div className={styles.title}>
          {title}
      </div>
      <div className={styles.body}>
          {body}
      </div>
    </div>
  )
}
