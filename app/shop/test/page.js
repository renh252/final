'use client'

import { useState, useEffect } from 'react'
import ProductCard from "./_components";
const products = [
  {
    id: 1,
    image: "https://via.placeholder.com/150",
    title: "商品 A",
    description: "這是一個很棒的商品",
    price: 299,
  },
  {
    id: 2,
    image: "https://via.placeholder.com/150",
    title: "商品 B",
    description: "這是另一個優質商品",
    price: 399,
  },
  {
    id: 3,
    image: "https://via.placeholder.com/150",
    title: "商品 C",
    description: "限量商品，快來搶購！",
    price: 499,
  },
];

export default function Page(props) {
  return (
    <>
    <br />
    <br />
    <br />
    
    <div style={{ display: "flex", gap: "20px" }}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          image={product.image}
          title={product.title}
          description={product.description}
          price={product.price}
        />
      ))}
    </div>
  </>
  );
  
}

