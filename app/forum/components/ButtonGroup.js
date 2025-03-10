'use client';
import React from 'react';
import { ButtonGroup, Button } from 'react-bootstrap';

const ButtonGroupComponent = () => {
    const handleButtonClick = (category) => {
        // 這裡可以添加按鈕點擊後的事件處理邏輯
        console.log(`Selected category: ${category}`);
    };

    return (
        <ButtonGroup className="mb-3">
            <Button variant="primary" onClick={() => handleButtonClick('公告')}>限定公告</Button>
            <Button variant="primary" onClick={() => handleButtonClick('寵物健康')}>寵物健康</Button>
            <Button variant="primary" onClick={() => handleButtonClick('線下聚會')}>線下聚會</Button>
            <Button variant="primary" onClick={() => handleButtonClick('經驗分享')}>經驗分享</Button>
            <Button variant="primary" onClick={() => handleButtonClick('送養寵物')}>送養寵物</Button>
        </ButtonGroup>
    );
};

export default ButtonGroupComponent;