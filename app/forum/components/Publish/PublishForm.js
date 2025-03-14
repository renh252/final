'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import PublishEditor from './PublishEditor';
import styles from '../article.module.css';

const PublishForm = () => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 表單驗證
  const validateForm = () => {
    if (!title.trim()) {
      setError('請輸入文章標題');
      return false;
    }
    if (!category.trim()) {
      setError('請選擇文章類別');
      return false;
    }
    if (!content.trim() || content === '<p><br></p>') {
      setError('請輸入文章內容');
      return false;
    }
    return true;
  };

  // 提交表單
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/forum/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          category,
          publishedAt: new Date().toISOString(),
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '發布失敗');
      }
      
      setSuccess('文章發布成功！');
      // 清空表單
      setTitle('');
      setContent('');
      setCategory('');
      
      // 短暫延遲後跳轉回論壇首頁
      setTimeout(() => {
        router.push('/forum');
      }, 2000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.publishForm}>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      )}
      
      <div className="mb-3">
        <label htmlFor="title" className="form-label">文章標題</label>
        <input
          type="text"
          className="form-control"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="請輸入標題"
          required
        />
      </div>
      
      <div className="mb-3">
        <label htmlFor="category" className="form-label">文章類別</label>
        <select
          className="form-select"
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">請選擇類別</option>
          <option value="健康">健康</option>
          <option value="旅遊">旅遊</option>
          <option value="技術">技術</option>
          <option value="美食">美食</option>
          <option value="生活">生活</option>
          <option value="其他">其他</option>
        </select>
      </div>
      
      <div className="mb-3">
        <label htmlFor="editor" className="form-label">文章內容</label>
        <PublishEditor onChange={setContent} initialContent={content} />
      </div>
      
      <div className="d-flex justify-content-between mt-4">
        <button 
          type="button" 
          className="btn btn-secondary" 
          onClick={() => router.push('/forum')}
        >
          返回論壇
        </button>
        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={isSubmitting}
        >
          {isSubmitting ? '發布中...' : '發布文章'}
        </button>
      </div>
    </form>
  );
};

export default PublishForm;