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
                    style={{
                        marginTop: '20px',  // 固定高度
                        borderRadius: '4px 0 0 4px' // 左側圓角
                    }}
                />
                <Button 
                    onClick={handleSearch}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    style={{ 
                        backgroundColor: isHovered ? '#092C4C' : '#063970', 
                        borderColor: isHovered ? '#092C4C' : '#063970',
                        color: 'white',
                        transition: 'background-color 0.2s ease',
                        marginTop: '20px', // 與輸入框相同高度
                        borderRadius: '0 4px 4px 0' // 右側圓角
                    }}
                >
                    搜尋
                </Button>
            </InputGroup>
        </div>
    );
};

export default SearchBox;