'use client';
import React from 'react';
import ForumLayout from './_components/ForumLayout';
import { Card } from 'react-bootstrap';

export default function ForumPage() {
  return (
    <ForumLayout>
      <Card>
        <Card.Body>
          <Card.Title>热门标签</Card.Title>
          {/* 这里可以添加热门标签组件 */}
        </Card.Body>
      </Card>
      <Card className="mt-3">
        <Card.Body>
          <Card.Title>最新评论</Card.Title>
          {/* 这里可以添加最新评论组件 */}
        </Card.Body>
      </Card>
    </ForumLayout>
  );
}