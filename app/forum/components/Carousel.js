import React from 'react';
import Carousel from 'react-bootstrap/Carousel';
import { useEffect, useState } from 'react';

const CustomCarousel = () => {
    const [featuredArticles, setFeaturedArticles] = useState([]);

    useEffect(() => {
        const fetchFeaturedArticles = async () => {
            try {
                const response = await fetch('/api/forum/featured');
                const data = await response.json();
                setFeaturedArticles(data);
            } catch (error) {
                console.error('Error fetching featured articles:', error);
            }
        };

        fetchFeaturedArticles();
    }, []);

    return (
        <Carousel>
            {featuredArticles.map((article) => (
                <Carousel.Item key={article.id}>
                    <a href={`/forum/article/${article.id}`}>
                        <img
                            className="d-block w-100"
                            src={article.image}
                            alt={article.title}
                        />
                        <Carousel.Caption>
                            <h3>{article.title}</h3>
                        </Carousel.Caption>
                    </a>
                </Carousel.Item>
            ))}
        </Carousel>
    );
};

export default CustomCarousel;