'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from './RichTextEditor';

const CATEGORIES = [
  { id: '1', name: '一般討論' },
  { id: '2', name: '技術交流' },
  { id: '3', name: '問題求助' },
  { id: '4', name: '心得分享' },
  { id: '5', name: '新聞資訊' }
];

const CreatePostForm = ({ editMode = false, postId = null }) => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('1');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  
  // 載入草稿
  const loadDraft = useCallback(async () => {
    if (editMode) return;
    
    try {
      const response = await fetch('/api/posts/draft', { 
        credentials: 'include'
      });
      if (response.ok) {
        const draft = await response.json();
        if (draft.title) setTitle(draft.title);
        if (draft.category) setCategory(draft.category);
        if (draft.content) setContent(draft.content);
        
        if (draft.title || draft.content) {
          setSaveStatus('已載入草稿');
        }
      }
    } catch (error) {
      console.error('載入草稿失敗:', error);
    }
  }, [editMode]);

  // 載入現有文章（編輯模式）
  const loadPost = useCallback(async () => {
    if (!editMode || !postId) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/posts/${postId}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const post = await response.json();
        setTitle(post.title);
        setCategory(post.category);
        setContent(post.content);
      } else {
        setError('無法載入文章');
      }
    } catch (error) {
      setError('載入文章失敗');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [editMode, postId]);

  // 自動儲存草稿
  useEffect(() => {
    if (editMode) return;
    
    loadDraft();
    
    const autosaveInterval = setInterval(async () => {
      if (!title && !content) return;
      
      try {
        await fetch('/api/posts/draft', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ title, category, content }),
        });
        
        setSaveStatus('草稿已自動儲存 ' + new Date().toLocaleTimeString());
        setTimeout(() => setSaveStatus(''), 3000);
      } catch (error) {
        console.error('自動儲存失敗:', error);
      }
    }, 10000);

    return () => clearInterval(autosaveInterval);
  }, [title, category, content, editMode, loadDraft]);

  // 載入文章（編輯模式）
  useEffect(() => {
    loadPost();
  }, [loadPost]);

  // 手動儲存草稿
  const saveDraft = async () => {
    try {
      setSaveStatus('儲存中...');
      await fetch('/api/posts/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ title, category, content }),
      });
      
      setSaveStatus('草稿已儲存');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      setSaveStatus('儲存失敗');
      console.error('儲存草稿失敗:', error);
    }
  };

  // 發佈文章
  const publishPost = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('請輸入標題');
      return;
    }
    
    if (!content.trim()) {
      setError('請輸入內容');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      const url = editMode ? `/api/posts/${postId}` : '/api/posts';
      const method = editMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ title, category, content }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '發佈失敗');
      }
      
      const result = await response.json();
      
      // 發佈成功後跳轉至文章頁面
      router.push(`/forum/article/${result.id}`);
    } catch (error) {
      setError(error.message || '發佈失敗，請稍後再試');
      setIsLoading(false);
    }
  };

  if (isLoading && editMode) {
    return <div className="text-center py-5">載入中...</div>;
  }

  return (
    <div className="container mt-4">
      <form onSubmit={publishPost}>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
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
            placeholder="輸入標題"
            required
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="category" className="form-label">分類</label>
          <select
            className="form-select"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-3">
          <label htmlFor="content" className="form-label">文章內容</label>
          <RichTextEditor
            initialContent={content}
            onContentChange={setContent}
          />
        </div>
        
        {saveStatus && (
          <div className="alert alert-info py-2" role="status">
            {saveStatus}
          </div>
        )}
        
        <div className="d-flex justify-content-between mt-4">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={saveDraft}
            disabled={isLoading}
          >
            儲存草稿
          </button>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? '發佈中...' : (editMode ? '更新文章' : '發佈文章')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePostForm;
