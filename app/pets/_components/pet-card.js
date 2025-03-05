import React from 'react'
import CardSwitchButton from '@/app/_components/ui/Card'
import styles from './pet-card.module.css'

const PetCard = ({ image, name, breed, age, location }) => {
  return (
    <CardSwitchButton image={image} title={name} className={styles.petCard}>
      <div className={styles.info}>
        <p>品種：{breed}</p>
        <p>年齡：{age}歲</p>
        <p>地點：{location}</p>
      </div>
      <div className={styles.footer}>
        <span className={styles.status}>待領養</span>
      </div>
    </CardSwitchButton>
  )
}

export default PetCard
