'use client';

import React from 'react';
import { Form, InputGroup, Button, Row, Col, Badge } from 'react-bootstrap';

interface PostFilterProps {
  categories: any[];
  selectedCategory: string;
  sortBy: 'latest' | 'hot';
  searchTerm: string;
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: 'latest' | 'hot') => void;
  onSearchChange: (search: string) => void;
}

const PostFilter: React.FC<PostFilterProps> = ({
  categories,
  selectedCategory,
  sortBy,
  searchTerm,
  onCategoryChange,
  onSortChange,
  onSearchChange
}) => {
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 搜尋功能已經透過 onChange 事件處理
  };

  return (
    <div className="post-filter bg-white rounded-3 shadow-sm p-3 mb-4">
      <Row className="g-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label className="small fw-bold text-secondary mb-1">
              分類
            </Form.Label>
            <Form.Select 
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="form-select-sm"
            >
              <option value="">所有分類</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        
        <Col md={3}>
          <Form.Group>
            <Form.Label className="small fw-bold text-secondary mb-1">
              排序
            </Form.Label>
            <Form.Select 
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as 'latest' | 'hot')}
              className="form-select-sm"
            >
              <option value="latest">最新</option>
              <option value="hot">熱門</option>
            </Form.Select>
          </Form.Group>
        </Col>
        
        <Col md={5}>
          <Form.Group>
            <Form.Label className="small fw-bold text-secondary mb-1">
              搜尋
            </Form.Label>
            <Form onSubmit={handleSearchSubmit}>
              <InputGroup size="sm">
                <Form.Control
                  type="text"
                  placeholder="搜尋文章..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
                <Button variant="outline-primary" type="submit">
                  搜尋
                </Button>
              </InputGroup>
            </Form>
          </Form.Group>
        </Col>
      </Row>
      
      {selectedCategory && (
        <div className="mt-3 d-flex align-items-center">
          <span className="small text-muted me-2">已選擇:</span>
          <Badge 
            bg="primary" 
            className="d-flex align-items-center"
          >
            {categories.find(c => c.id === selectedCategory)?.name || '所有分類'}
            <Button 
              variant="link" 
              className="p-0 ms-2 text-white" 
              onClick={() => onCategoryChange('')}
              style={{ fontSize: '10px' }}
            >
              ✕
            </Button>
          </Badge>
        </div>
      )}
    </div>
  );
};

export default PostFilter;
