'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import './CreatePostButton.css';

const CreatePostButton = () => {
  const router = useRouter();

  const handleCreatePost = () => {
    router.push('/forum/publish');
  };

  return (
    <button 
      className="btn ms-3 create-post-button" 
      onClick={handleCreatePost}
    >
      <i className="bi bi-pencil-fill me-1"></i> 發文
    </button>
  );
};

export default CreatePostButton;