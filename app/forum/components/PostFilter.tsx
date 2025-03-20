import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { Category } from '../hooks/useForumData';

interface PostFilterProps {
  categories: Category[];
  selectedCategory: string;
  sortBy: 'latest' | 'hot';
  searchTerm: string;
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: 'latest' | 'hot') => void;
  onSearchChange: (search: string) => void;
}

export default function PostFilter({
  categories,
  selectedCategory,
  sortBy,
  searchTerm,
  onCategoryChange,
  onSortChange,
  onSearchChange
}: PostFilterProps) {
  return (
    <div className="post-filter mb-4">
      <Row>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>分類</Form.Label>
            <Form.Select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
            >
              <option value="">全部分類</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>排序方式</Form.Label>
            <Form.Select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as 'latest' | 'hot')}
            >
              <option value="latest">最新發布</option>
              <option value="hot">熱門文章</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>搜尋</Form.Label>
            <Form.Control
              type="text"
              placeholder="搜尋文章..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>
    </div>
  );
}
