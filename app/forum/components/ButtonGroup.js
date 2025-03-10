'use client';
import React from 'react';
import { Button, Row, Col } from 'react-bootstrap';

const ButtonGroupComponent = () => {
    const handleButtonClick = (category) => {
        // 這裡可以添加按鈕點擊後的事件處理邏輯
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
        <div className="container-fluid mb-4">
            <Row className="g-3">
                {categories.map((category, index) => (
                    <Col key={index} xs={12} sm={6} md={4} lg>
                        <Button 
                            variant="outline-primary" 
                            onClick={() => handleButtonClick(category)}
                            className="w-100 py-2 fs-5"
                        >
                            {category}
                        </Button>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default ButtonGroupComponent;