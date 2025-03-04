import {useState} from "react";
import { FaRegHeart,FaHeart } from "react-icons/fa";

/* 使用方法
<div style={{ display: 'flex', gap: '20px' }}>
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
    <div style={styles.card}>
      <img src={image} alt={title} style={styles.image} />
      <div style={styles.body}>
        <h2 style={styles.title}>{title}</h2> 
        <div style={styles.Card_comment}>
          <p style={styles.price}>${price} <del>${price}</del></p>
          <button onClick={() => setLiked(!liked)}
          style={styles.button}>
            {liked ? <FaHeart/> : <FaRegHeart/>}
          </button>
        </div>
      </div>
    </div>
  );
};

// CSS 樣式（內嵌）
const styles = {
  card: {
    border: "1px solid #ddd",
    borderRadius: "62px",
    padding: "10px",
    // textAlign: "center",
    width: "280px",
    height: "410px",
    boxShadow: "10px 10px 15px rgba(0, 0, 0, 0.1)",
    backgroundColor: "rgba(199, 150, 80, 1)",
  },
  image: {
    width: '100%',
    objectFit: 'cover',
    aspectRatio: 1/1 ,
    borderRadius: "62px 62px 0px 0px",
  },
  body: {
    width: "100%",
    padding: "10px 0px",
    
  },
  title: {
    color:"#fff",
    fontSize: "30px",
    
  },
  Card_comment:{
    display: "flex",
    flexDeirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin: "10px 0px",
  },
  price: {
    color:"#fff",
    fontSize: "18px",
  },
  button: {
    width: "30px",
    height: "30px",
    backgroundColor: "#fff",
    color: "red",
    border: "none",
    borderRadius: "50%"
  },
};

export default Card;
