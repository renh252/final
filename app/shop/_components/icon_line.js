import favicon from '../../favicon.ico'
import styles from '../shop.module.css'
import Image from 'next/image'


export default function IconLine({title}) {
  return (
    <>
    <div className={styles.line}>
      <Image src={favicon} alt="Icon Line" />
      <Image src={favicon} alt="Icon Line" />
      <Image src={favicon} alt="Icon Line" />
      <Image src={favicon} alt="Icon Line" />
      <p>{title}</p>
      <Image src={favicon} alt="Icon Line" />
      <Image src={favicon} alt="Icon Line" />
      <Image src={favicon} alt="Icon Line" />
      <Image src={favicon} alt="Icon Line" />
    </div>
    </>
  )
}