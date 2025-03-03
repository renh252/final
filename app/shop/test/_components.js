import React from "react";

const ProductCard = ({  image, title, price, description }) => {
  return (
    <div >
      <img src={image} alt={title} style={styles.image} />
      <div class="bigCard-body">
        <div class="bigCard_title">
          <h2>{title}</h2> 
        </div>
        <div class="bigCard_comment">
          <p class="p1">${price}<del>${price}</del></p>
          <div class="like_icon">
            <i class="fa-regular fa-heart"></i>
          </div>
        </div>
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <h4>${price}</h4>
      <button >加入購物車</button>
    </div>
  );
};

// CSS 樣式（內嵌）
const styles = {
  card: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "16px",
    textAlign: "center",
    width: "250px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  image: {
    width: "100%",
    height: "auto",
    borderRadius: "8px",
  },
  button: {
    background: "#007bff",
    color: "#fff",
    border: "none",
    padding: "10px 15px",
    cursor: "pointer",
    borderRadius: "5px",
    marginTop: "10px",
  },
};

export default ProductCard;
