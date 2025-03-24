'use client';

import React, { useState, useEffect } from 'react';
import { Carousel as BootstrapCarousel } from 'react-bootstrap';
import Image from 'next/image';
import styles from './Carousel.module.css';
import '../styles/custom-theme.css';

interface CarouselItem {
  id: number;
  imageUrl: string;
  title: string;
  description: string;
  link?: string;
}

interface CarouselProps {
  items?: CarouselItem[];
}

const defaultItems: CarouselItem[] = [
  {
    id: 1,
    imageUrl: '/images/carousel/pet1.jpg',
    title: '布偶貓新手指南',
    description: '從選貓到日常照護，打造貓皇的幸福生活！',
    link: '/forum/posts/1'
  },
  {
    id: 2,
    imageUrl: '/images/carousel/pet2.jpg',
    title: '狗狗健康飲食指南',
    description: '了解如何為您的愛犬提供均衡營養的飲食',
    link: '/forum/posts/2'
  },
  {
    id: 3,
    imageUrl: '/images/carousel/pet3.jpg',
    title: '寵物夏季護理小貼士',
    description: '炎炎夏日，如何讓毛孩保持舒適涼爽',
    link: '/forum/posts/3'
  }
];

export default function Carousel({ items = defaultItems }: CarouselProps) {
  const [index, setIndex] = useState(0);

  const handleSelect = (selectedIndex: number) => {
    setIndex(selectedIndex);
  };

  // 自動輪播
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [items.length]);

  return (
    <div className={styles.carouselContainer}>
      <BootstrapCarousel activeIndex={index} onSelect={handleSelect} className={styles.carousel}>
        {items.map((item) => (
          <BootstrapCarousel.Item key={item.id} className={styles.carouselItem}>
            <div className={styles.imageContainer}>
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                sizes="100vw"
                priority
                className={styles.carouselImage}
              />
            </div>
            <BootstrapCarousel.Caption className={styles.carouselCaption}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              {item.link && (
                <a href={item.link} className={styles.carouselLink}>
                  閱讀更多
                </a>
              )}
            </BootstrapCarousel.Caption>
          </BootstrapCarousel.Item>
        ))}
      </BootstrapCarousel>
    </div>
  );
}
