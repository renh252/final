'use client';
import React, { useState } from 'react';
import { Button, Row, Col } from 'react-bootstrap';

const ButtonGroupComponent = () => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [hoveredCategory, setHoveredCategory] = useState(null);

    const handleButtonClick = (category) => {
        setSelectedCategory(category);
        console.log(`Selected category: ${category}`);
    };

    const categories = [
        '限定公告',
        '寵物健康',
        '線下聚會',
        '經驗分享',
        '送養寵物'
    ];

    return (
        <div className="container-fluid mt-4 mb-4">
            <Row className="g-3">
                {categories.map((category, index) => {
                    const isSelected = category === selectedCategory;
                    const isHovered = category === hoveredCategory;
                    
                    return (
                        <Col key={index} xs={12} sm={6} md={4} lg>
                            <Button 
                                variant="primary"
                                onClick={() => handleButtonClick(category)}
                                onMouseEnter={() => setHoveredCategory(category)}
                                onMouseLeave={() => setHoveredCategory(null)}
                                className="w-100 py-2 fs-5"
                                style={{
                                    backgroundColor: isSelected || isHovered ? '#C79650' : '#092C4C',
                                    borderColor: isSelected || isHovered ? '#C79650' : '#092C4C',
                                    color: 'white',
                                    transition: 'background-color 0.2s ease'
                                }}
                            >
                                {category}
                            </Button>
                        </Col>
                    );
                })}
            </Row>
        </div>
    );
};

export default ButtonGroupComponent;