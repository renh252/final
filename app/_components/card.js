import {useState} from "react";
// import styles from "./component.module.css"
import styles from "./card.module.css"
import Link from 'next/link'
import Image from "next/image";


// 使用方法
// key (必填)
// image (必填)
// text_comment為註解: 以()呈現
// text_del為刪除線
// btn_text為按鈕文字
// btn_color為按鈕字體顏色

/* 範例
  <Card
    key={}
    image={}
    title={}
    text1={}
    text1_del={}
    text1_comment={}
    text2={}
    text2_del={}
    text2_comment={}
    text3={}
    text3_del={}
    text3_comment={}
    btn_text={}
    btn_color={}
    btn_onclick={()=>{}}
    link={}
  />
*/




const Card = ({  
  image, 
  title, 
  text1, text1_comment,text1_del,
  text2, text2_comment,text2_del, 
  text3, text3_comment,text3_del,
  btn_text, btn_color, btn_onclick,
  link}) => {


  return (
    <>
      <div className={styles.card}>
            <div className={styles.imgContainer}>
              {link ? (
                <Link href={link}>
                  <Image 
                    src={image} 
                    alt={title} 
                    className={styles.image} 
                    width={260} 
                    height={260}
                  />
                </Link>
              ) : (
                <Image 
                  src={image} 
                  alt={title} 
                  className={styles.image} 
                  width={260} 
                  height={260}
                />
              )}
            </div>
          <div className={styles.body}>
          {title && <h2 className={styles.title}>{title}</h2> }
            <div className={styles.textGroup}>
              {(text1 || text1_del || text1_comment) && (  
                <p>
                  {text1 && <>{text1} </>}
                  {text1_del && <del className={styles.del}>{text1_del}</del>}
                  {text1_comment && <span className={styles.comment}>&#40;{text1_comment}&#41;</span>}
                </p>
              )}
              {(text2 || text2_del || text2_comment) && (  
                <p>
                  {text2 && <>{text2} </>}
                  {text2_del && <del className={styles.del}>{text2_del}</del>}
                  {text2_comment && <span className={styles.comment}>&#40;{text2_comment}&#41;</span>}
                </p>
              )}
              {(text3 || text3_del || text3_comment) && (  
                <p>
                  {text3 && <>{text3} </>}
                  {text3_del && <del className={styles.del}>{text3_del}</del>}
                  {text3_comment && <span className={styles.comment}>&#40;{text3_comment}&#41;</span>}
                </p>
              )}
            </div>
            {btn_text && 
            <>
            <button style={{color:btn_color}} onClick={btn_onclick}
            className={styles.button}>
              {btn_text}
            </button>
            </>}
          </div>
      </div>
    </>
  )
}


export default Card;
