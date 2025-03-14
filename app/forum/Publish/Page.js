'use client';
import React from 'react';
import PublishForm from '../components/Publish/PublishForm';

export default function PublishPage() {
  return (
    <div className="container mt-5 mb-5">
      <h1 className="mb-4">發布新文章</h1>
      <p className="text-muted mb-4">
        在這裡分享您的想法、經驗和知識。請確保內容符合社區規範。
      </p>
      <PublishForm />
    </div>
  );
}