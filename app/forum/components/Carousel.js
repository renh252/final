'use client';
import React from 'react';
import Carousel from 'react-bootstrap/Carousel';
import { useEffect, useState } from 'react';
import Image from 'next/image';

// 測試用模擬數據
const demoItems = [
    {
        id: 1,
        title: '寵物健康講座：夏季寵物保健指南',
        imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?q=80&w=2060&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        articleUrl: '/forum/article/1',
    },
    {
        id: 2,
        title: '最新品種貓咪介紹：蘇格蘭折耳貓',
        imageUrl: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        articleUrl: '/forum/article/2',
    },
    {
        id: 3,
        title: '週末寵物聚會活動：台北大安森林公園',
        imageUrl: 'https://images.unsplash.com/photo-1609791636587-50feca5caee7?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        articleUrl: '/forum/article/3',
    }
];

const CustomCarousel = ({ items }) => {
    const [carouselItems, setCarouselItems] = useState([]);

    useEffect(() => {
        // 如果有提供items就使用items，否則使用demo數據
        if (items && Array.isArray(items) && items.length > 0) {
            setCarouselItems(items);
        } else {
            setCarouselItems(demoItems);
        }
    }, [items]);

    return (
        <Carousel>
            {carouselItems.map((item, index) => (
                <Carousel.Item key={index}>
                    <a href={item.articleUrl} style={{ display: 'block', position: 'relative', height: '400px' }}>
                        <img
                            className="d-block w-100 h-100"
                            src={item.imageUrl}
                            alt={item.title}
                            style={{ objectFit: 'cover' }}
                        />
                        <Carousel.Caption>
                            <h3>{item.title}</h3>
                        </Carousel.Caption>
                    </a>
                </Carousel.Item>
            ))}
        </Carousel>
    );
};

export default CustomCarousel;