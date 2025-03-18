'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

const CreatePostButton = () => {
  const router = useRouter();

  const handleCreatePost = () => {
    router.push('/forum/publish');
  };

  return (
    <button 
      className="btn btn-primary ms-3" 
      onClick={handleCreatePost}
      style={{ minWidth: '130px' }}
    >
      <i className="bi bi-pencil-fill me-1"></i> 發文
    </button>
  );
};

export default CreatePostButton;