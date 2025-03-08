import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Carousel } from 'react-bootstrap';
import styles from '../forum.module.css';

export default function ArticleCarousel() {
  const [carouselItems, setCarouselItems] = useState([]);

  useEffect(() => {
    // 这里应该从API获取轮播图数据
    // 暂时使用模拟数据
    const mockData = [
      { id: 1, title: '文章1', image: '/images/article1.jpg' },
      { id: 2, title: '文章2', image: '/images/article2.jpg' },
      { id: 3, title: '文章3', image: '/images/article3.jpg' },
    ];
    setCarouselItems(mockData);
  }, []);

  return (
    <Carousel className="mb-4">
      {carouselItems.map((item) => (
        <Carousel.Item key={item.id}>
          <Link href={`/forum/${item.id}`}>
            <img
              className="d-block w-100"
              src={item.image}
              alt={item.title}
            />
          </Link>
          <Carousel.Caption>
            <h3 className={styles.carouselTitle}>{item.title}</h3>
          </Carousel.Caption>
        </Carousel.Item>
      ))}
    </Carousel>
  );
}