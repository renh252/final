import React from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';

export default function CategoryButtons() {
  const categories = ['全部', '科技', '娱乐', '体育', '生活'];

  return (
    <ButtonGroup className="mb-4 d-flex">
      {categories.map((category, index) => (
        <Button key={index} variant="outline-primary">
          {category}
        </Button>
      ))}
    </ButtonGroup>
  );
}