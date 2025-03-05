import {useState} from "react";
import styles from "./component.module.css"
import { FaRegHeart,FaHeart } from "react-icons/fa";
import Link from 'next/link'
// import Image from 'next/image'

/* 使用方法
<div class={{ display: 'flex', gap: '20px' }}>
  {products.map((product) => (
    <Card
      key={product.id}
      image={product.image}
      title={product.title}
      description={product.description}
      price={product.price}
    />
  ))}
</div>    
*/

const Card = ({  
  image, title, price }) => {
    const [liked, setLiked] = useState(false);
  return (
    <Link href={'/shop/pages/productList'} class={styles.card}>
        <img src={image} alt={title} class={styles.image} />
        <div class={styles.body}>
          <h2 class={styles.title}>{title}</h2> 
          <p class={styles.price}>${price} <del class={styles.del}>${price}</del></p>
          <button onClick={() => setLiked(!liked)}
          class={styles.button}>
            {liked ? <FaHeart/> : <FaRegHeart/>}
          </button>
        </div>
    </Link>
  );
};


export default Card;
