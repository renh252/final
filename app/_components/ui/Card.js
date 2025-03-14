import React from 'react'
import Image from 'next/image'
import styles from './Card.module.css'

const Card = ({
  image,
  title,
  children,
  footer,
  className = '',
  onClick,
  ...props
}) => {
  // 按下 Enter 或 Space 鍵時，觸發 onClick 事件
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick?.()
    }
  }

  return (
    <div
      className={`${styles.card} ${className}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      {...props}
    >
      {image && (
        <div className={styles.imageContainer}>
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={styles.image}
            priority={false}
          />
        </div>
      )}
      <div className={styles.content}>
        {title && <h3 className={styles.title}>{title}</h3>}
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  )
}

export default Card
