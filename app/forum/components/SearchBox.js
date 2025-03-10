'use client';
import React, { useState } from 'react';
import { InputGroup, FormControl, Button } from 'react-bootstrap';
import { useRouter } from 'next/navigation';  // 修改從 next/navigation 引入

const SearchBox = () => {
    const [query, setQuery] = useState('');
    const router = useRouter();

    const handleSearch = () => {
        if (query.trim()) {
            router.push(`/forum/search?query=${query}`);
        }
    };

    return (
        <InputGroup className="mb-3">
            <FormControl
                placeholder="搜尋文章"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <Button variant="primary" onClick={handleSearch}>
                搜尋
            </Button>
        </InputGroup>
    );
};

export default SearchBox;