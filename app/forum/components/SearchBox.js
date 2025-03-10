'use client';
import React, { useState } from 'react';
import { InputGroup, FormControl, Button } from 'react-bootstrap';
import { useRouter } from 'next/navigation';

const SearchBox = () => {
    const [query, setQuery] = useState('');
    const [isHovered, setIsHovered] = useState(false);
    const router = useRouter();

    const handleSearch = () => {
        if (query.trim()) {
            router.push(`/forum/search?query=${query}`);
        }
    };

    return (
        <div style={{ width: "400px" }}> {/* 設置固定寬度 */}
            <InputGroup className="mb-3">
                <FormControl
                    placeholder="搜尋文章"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    size="sm"
                    className="flex-grow-1" // 確保輸入框能夠彈性伸展
                />
                <Button 
                    onClick={handleSearch} 
                    size="sm"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    style={{ 
                        backgroundColor: isHovered ? '#092C4C' : '#063970', 
                        borderColor: isHovered ? '#092C4C' : '#063970',
                        color: 'white',
                        transition: 'background-color 0.2s ease'
                    }}
                >
                    搜尋
                </Button>
            </InputGroup>
        </div>
    );
};

export default SearchBox;