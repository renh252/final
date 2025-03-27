// app/home/components/PetCard.jsx
'use client'

import Image from 'next/image'
import styles from './card.module.css'

export default function PetCard({ pet }) {
  return (
    <div className={styles.card}>
      <div className={styles.imageWrap}>
        <Image
          src={pet.main_photo || '/images/default_no_pet.jpg'}
          alt={pet.name}
          layout="fill"
          objectFit="cover"
          className={styles.image}
          priority
        />
      </div>
      <div className={styles.info}>
        <h3 className={styles.name}>{pet.name}</h3>
        <p className={styles.detail}>品種：{pet.variety}</p>
        <p className={styles.detail}>
          年齡：{pet.age}・{pet.gender}
        </p>
        <p className={styles.detail}>地點：{pet.location}</p>
      </div>
    </div>
  )
}
