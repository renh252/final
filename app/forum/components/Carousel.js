'use client';
import React from 'react';
import Carousel from 'react-bootstrap/Carousel';
import { useEffect, useState } from 'react';
import Image from 'next/image';

const CustomCarousel = ({ items }) => { // 修改 props 名稱從 images 到 items
    const [carouselItems, setCarouselItems] = useState([]);

    useEffect(() => {
        // 添加防護代碼確保 items 存在
        if (items && Array.isArray(items)) {
            setCarouselItems(items);
        } else {
            setCarouselItems([]);
        }
    }, [items]);

    // 防止 carouselItems 未定義時的錯誤
    if (!carouselItems || carouselItems.length === 0) {
        return <div className="alert alert-info">沒有輪播項目可顯示</div>;
    }

    return (
        <Carousel>
            {carouselItems.map((item, index) => (
                <Carousel.Item key={index}>
                        <Image
                            className="d-block w-100"
                            src={item.imageUrl}
                            alt={item.title}
                            layout="responsive"
                            width={500}
                            height={300}
                        />
                        <Carousel.Caption>
                            <h5>{item.title}</h5>
                        </Carousel.Caption>
                </Carousel.Item>
            ))}
        </Carousel>
    );
};

export default CustomCarousel;