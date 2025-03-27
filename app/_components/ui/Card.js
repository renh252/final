import React from 'react'
import Image from 'next/image'
import styles from './Card.module.css'
import { FaMapMarkerAlt } from 'react-icons/fa'

const Card = ({
  image,
  title,
  location,
  species,
  breed,
  age,
  gender,
  children,
  footer,
  className = '',
  onClick,
  variant = 'default',
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
        <div
          className={`${styles.imageContainer} ${
            variant === 'pet' ? styles.petImageContainer : ''
          }`}
        >
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
        {variant === 'pet' ? (
          // 寵物卡片的三排資訊結構
          <>
            <div className={styles.infoRow}>
              <h3 className={styles.title}>{title}</h3>
              {location && (
                <div className={styles.location}>
                  <FaMapMarkerAlt className={styles.locationIcon} />
                  <span>{location || '未提供'}</span>
                </div>
              )}
            </div>
            <div className={styles.petInfoRow}>
              <span className={styles.info}>
                {species || '寵物'} - {breed || '未知品種'}
              </span>
            </div>
            <div className={styles.petInfoRow}>
              <span className={styles.info}>
                {age || '年齡未知'} - {gender === 'M' ? '男生' : '女生'}
              </span>
            </div>
          </>
        ) : (
          // 預設商店卡片的簡化結構
          <h3 className={styles.title}>{title}</h3>
        )}
        {children}
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  )
}

export default Card
