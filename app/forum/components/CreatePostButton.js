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
      className="btn ms-3 create-post-button" 
      onClick={handleCreatePost}
      style={{
        backgroundColor: '#C79650',
        borderColor: '#C79650',
        color: 'white',
        minWidth: '150px',
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        marginRight: 'auto',
        transition: 'all 0.3s ease',
        borderRadius: '25px', // 修改這一行
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = '#e7c698';
        e.target.style.borderColor = '#e7c698';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = '#C79650';
        e.target.style.borderColor = '#C79650';
      }}
      onMouseDown={(e) => {
        e.target.style.backgroundColor = '#d1a87a';
        e.target.style.borderColor = '#d1a87a';
      }}
      onMouseUp={(e) => {
        e.target.style.backgroundColor = '#e7c698';
        e.target.style.borderColor = '#e7c698';
      }}
    >
      <i className="bi bi-pencil-fill me-1"></i> 發文
    </button>
  );
};

export default CreatePostButton;