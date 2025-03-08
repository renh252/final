import React, { useState } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';

export default function SearchBox() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    // 这里应该实现搜索逻辑
    console.log('搜索:', searchTerm);
  };

  return (
    <Form onSubmit={handleSearch} className="mb-4">
      <InputGroup>
        <Form.Control
          type="text"
          placeholder="搜索文章..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button variant="primary" type="submit">
          搜索
        </Button>
      </InputGroup>
    </Form>
  );
}