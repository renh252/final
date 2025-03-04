import Image from 'next/image'
import styles from './pet-card.module.css'

export default function PetCard({ image, name, breed, age, location }) {
  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <Image
          src={image}
          alt={name}
          width={300}
          height={200}
          className={styles.image}
        />
      </div>
      <div className={styles.content}>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.breed}>{breed}</p>
        <div className={styles.details}>
          <span className={styles.age}>{age}歲</span>
          <span className={styles.location}>{location}</span>
        </div>
      </div>
    </div>
  )
}
