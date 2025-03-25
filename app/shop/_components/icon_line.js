import favicon from '@/app/favicon.ico'
import styles from './icon_line.module.css'
import Image from 'next/image'
import { MdOutlinePets } from "react-icons/md";


export function IconLine({title}) {
  return (
    <div className={styles.line}>
      {[...Array(4)].map((_, i) => (
        <Image key={i} src={favicon} alt="Icon Line" className={styles.icon} />
      ))}
      <p className={styles.title}>{title}</p>
      {[...Array(4)].map((_, i) => (
        <Image key={i + 4} src={favicon} alt="Icon Line" className={styles.icon} />
      ))}
    </div>
  );
}

export function IconLine_lg({title}){

  return(
    <div className={styles.line_lg}>
      <div className={styles.imgs}>
        <MdOutlinePets />
        <MdOutlinePets />
        <MdOutlinePets />
        <MdOutlinePets />
        <MdOutlinePets />
        <MdOutlinePets />
      </div>
      <div>

      <p>{title}</p>
      </div>
      <div  className={styles.imgs}>
        <MdOutlinePets />
        <MdOutlinePets />
        <MdOutlinePets />
        <MdOutlinePets />
        <MdOutlinePets />
        <MdOutlinePets />
      </div>
    </div>
  )
}