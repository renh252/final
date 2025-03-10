import React, { useState } from 'react';
import { InputGroup, FormControl, Button } from 'react-bootstrap';
import { useRouter } from 'next/router';

const SearchBox = () => {
    const [query, setQuery] = useState('');
    const router = useRouter();

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?page=1&query=${encodeURIComponent(query)}`);
        }
    };

    return (
        <InputGroup className="mb-3">
            <FormControl
                placeholder="搜尋文章"
                aria-label="搜尋文章"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <Button variant="outline-secondary" onClick={handleSearch}>
                搜尋
            </Button>
        </InputGroup>
    );
};

export default SearchBox;