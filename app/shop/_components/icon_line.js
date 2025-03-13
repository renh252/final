import favicon from '@/app/favicon.ico'
import styles from './icon_line.module.css'
import Image from 'next/image'
import { MdOutlinePets } from "react-icons/md";


export function IconLine({title}) {
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